import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function GeometricCargoVisual() {
  const containerRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const [interactiveMode, setInteractiveMode] = useState('cargo-prisms'); // 'cargo-prisms' | 'transit-mesh'

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const width = container.clientWidth;
    const height = container.clientHeight;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, -0.4, 6.2);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    container.appendChild(renderer.domElement);

    // Group to hold all geometric forms
    const mainGroup = new THREE.Group();
    // Position it so the shapes peak dramatically from the bottom, exactly matching the reference
    mainGroup.position.set(0, -2.4, 0);
    scene.add(mainGroup);

    // Lighting setup for high-contrast crisp faceted origami look
    const ambientLight = new THREE.AmbientLight(0x1a4038, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xff7722, 4.0);
    keyLight.position.set(4, 5, 4);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xff3300, 2.5);
    fillLight.position.set(-5, 2, 3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xc2ebfa, 1.2);
    rimLight.position.set(0, -4, 2);
    scene.add(rimLight);

    // Custom faceted geometric structures (inspired by cargo prisms and the reference's sharp peaks)
    // 1. Center Major Cargo Peak (Left & Right twin peaks resembling route vectors & container geometry)
    const materials = {
      safetyOrange: new THREE.MeshStandardMaterial({
        color: 0xff5500,
        roughness: 0.35,
        metalness: 0.15,
        flatShading: true,
      }),
      burntOrange: new THREE.MeshStandardMaterial({
        color: 0xc93d00,
        roughness: 0.45,
        metalness: 0.1,
        flatShading: true,
      }),
      darkOrange: new THREE.MeshStandardMaterial({
        color: 0x7a2200,
        roughness: 0.5,
        metalness: 0.2,
        flatShading: true,
      }),
      deepRust: new THREE.MeshStandardMaterial({
        color: 0x471400,
        roughness: 0.6,
        metalness: 0.3,
        flatShading: true,
      }),
      icyWire: new THREE.LineBasicMaterial({
        color: 0xc2ebfa,
        transparent: true,
        opacity: 0.35,
      }),
      orangeWire: new THREE.LineBasicMaterial({
        color: 0xffaa44,
        transparent: true,
        opacity: 0.8,
      }),
    };

    // Construct dramatic low-poly faceted origami peaks at bottom
    // We create custom geometry or octahedron / pyramid clusters with exact sharp facets
    
    // Left Dramatic Peak
    const leftPyramidGeo = new THREE.ConeGeometry(2.3, 3.8, 4, 1);
    const leftPeak = new THREE.Mesh(leftPyramidGeo, materials.safetyOrange);
    leftPeak.position.set(-1.8, 0.4, 0.2);
    leftPeak.rotation.set(0.1, 0.78, -0.18);
    mainGroup.add(leftPeak);

    const leftWireframe = new THREE.LineSegments(
      new THREE.WireframeGeometry(leftPyramidGeo),
      materials.icyWire
    );
    leftPeak.add(leftWireframe);

    // Right Dramatic Peak (mirrored balance)
    const rightPyramidGeo = new THREE.ConeGeometry(2.3, 3.8, 4, 1);
    const rightPeak = new THREE.Mesh(rightPyramidGeo, materials.burntOrange);
    rightPeak.position.set(1.8, 0.4, 0.2);
    rightPeak.rotation.set(0.1, -0.78, 0.18);
    mainGroup.add(rightPeak);

    const rightWireframe = new THREE.LineSegments(
      new THREE.WireframeGeometry(rightPyramidGeo),
      materials.icyWire
    );
    rightPeak.add(rightWireframe);

    // Center interlocking cargo faceted block (connecting the two peaks)
    const centerPolyGeo = new THREE.OctahedronGeometry(1.65, 0);
    const centerPeak = new THREE.Mesh(centerPolyGeo, materials.darkOrange);
    centerPeak.position.set(0, -0.1, 0.6);
    centerPeak.rotation.set(0.4, 0.2, 0.1);
    centerPeak.scale.set(1.5, 1.2, 1.1);
    mainGroup.add(centerPeak);

    // Floating Abstract Cargo Nodes (representing decentralized logistics points)
    const satelliteNodes = [];
    const nodeCoords = [
      { x: -3.8, y: -0.2, z: -0.5, s: 0.65, rot: [0.3, 0.5, 0] },
      { x: 3.8, y: -0.2, z: -0.5, s: 0.65, rot: [-0.3, -0.5, 0] },
      { x: -2.8, y: 1.4, z: -1.2, s: 0.45, rot: [0.5, 0.2, 0.4] },
      { x: 2.8, y: 1.4, z: -1.2, s: 0.45, rot: [-0.5, -0.2, -0.4] },
      { x: 0, y: 1.1, z: -1.4, s: 0.55, rot: [0.8, 0.8, 0] },
    ];

    nodeCoords.forEach((coord, i) => {
      const geo = i % 2 === 0 
        ? new THREE.OctahedronGeometry(coord.s, 0)
        : new THREE.BoxGeometry(coord.s * 1.3, coord.s * 0.9, coord.s * 1.5);
      
      const mesh = new THREE.Mesh(
        geo,
        i % 2 === 0 ? materials.safetyOrange : materials.burntOrange
      );
      mesh.position.set(coord.x, coord.y, coord.z);
      mesh.rotation.set(coord.rot[0], coord.rot[1], coord.rot[2]);
      
      const wire = new THREE.LineSegments(
        new THREE.WireframeGeometry(geo),
        materials.orangeWire
      );
      mesh.add(wire);
      
      mainGroup.add(mesh);
      satelliteNodes.push({
        mesh,
        baseY: coord.y,
        baseX: coord.x,
        speed: 0.6 + i * 0.2,
        rotSpeed: 0.005 + (i % 3) * 0.003
      });
    });

    // Glowing logistics route lines connecting satellites to center peaks
    const routePoints = [];
    satelliteNodes.forEach((node) => {
      routePoints.push(new THREE.Vector3(node.baseX, node.baseY, node.mesh.position.z));
      routePoints.push(new THREE.Vector3(0, 0, 0.6));
    });
    const routeGeo = new THREE.BufferGeometry().setFromPoints(routePoints);
    const routeLines = new THREE.LineSegments(
      routeGeo,
      new THREE.LineBasicMaterial({
        color: 0xff5500,
        transparent: true,
        opacity: 0.22,
      })
    );
    mainGroup.add(routeLines);

    // Mouse Tracking Event Listener
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const x = (clientX / window.innerWidth) * 2 - 1;
      const y = -(clientY / window.innerHeight) * 2 + 1;
      mouseRef.current.targetX = x * 0.45;
      mouseRef.current.targetY = y * 0.25;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId;
    const startTime = performance.now();

    const animate = () => {
      const elapsedTime = (performance.now() - startTime) / 1000;

      // Smooth mouse interpolation
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.04;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.04;

      // Rotate and tilt main group smoothly
      mainGroup.rotation.y = mouseRef.current.x * 0.4 + Math.sin(elapsedTime * 0.3) * 0.05;
      mainGroup.rotation.x = -mouseRef.current.y * 0.2 + Math.cos(elapsedTime * 0.4) * 0.03;
      mainGroup.position.y = -2.3 + Math.sin(elapsedTime * 0.7) * 0.05;

      // Individual satellite node motions
      satelliteNodes.forEach((node, idx) => {
        node.mesh.position.y = node.baseY + Math.sin(elapsedTime * node.speed + idx) * 0.12;
        node.mesh.rotation.x += node.rotSpeed;
        node.mesh.rotation.y += node.rotSpeed * 1.4;
      });

      // Subtle breathing on primary peaks
      leftPeak.rotation.y = 0.78 + Math.sin(elapsedTime * 0.5) * 0.04;
      rightPeak.rotation.y = -0.78 - Math.sin(elapsedTime * 0.5) * 0.04;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Clean up
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex items-end justify-center overflow-hidden">
      {/* 3D WebGL Canvas Container */}
      <div
        ref={containerRef}
        className="w-full h-[68vh] sm:h-[72vh] md:h-[76vh] lg:h-[80vh] flex items-end justify-center transform translate-y-6 sm:translate-y-8"
      />

      {/* Ambient Gradient Glow behind shapes for dramatic cinematic depth */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-56 bg-radial from-[#ff5500]/25 via-[#ff3700]/10 to-transparent blur-3xl -z-10 pointer-events-none" />

      {/* Subtle floor transit line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#ff5500]/40 to-transparent pointer-events-none" />
    </div>
  );
}
