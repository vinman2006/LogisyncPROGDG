import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * ThreeJsBackground - A subtle, animated Three.js particle field
 * that renders behind the hero section as a living 3D star map / logistics network.
 */
export default function ThreeJsBackground({ style = {} }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // ── Scene setup ──────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // ── Particle field ──────────────────────────────────────────────────────
    const particleCount = 380;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    const palette = [
      new THREE.Color('#10b981'), // emerald
      new THREE.Color('#06b6d4'), // cyan
      new THREE.Color('#6366f1'), // indigo
      new THREE.Color('#ff5500'), // orange accent
      new THREE.Color('#c2ebfa'), // icy blue
    ];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 18;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8;

      const color = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      sizes[i] = Math.random() * 3 + 0.5;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      size: 0.06,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // ── Connecting lines network (logistics mesh) ─────────────────────────
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.06,
      blending: THREE.AdditiveBlending,
    });

    const lineGeometries = [];
    for (let i = 0; i < 60; i++) {
      const a = Math.floor(Math.random() * particleCount);
      const b = Math.floor(Math.random() * particleCount);

      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(positions[a * 3], positions[a * 3 + 1], positions[a * 3 + 2]),
        new THREE.Vector3(positions[b * 3], positions[b * 3 + 1], positions[b * 3 + 2]),
      ]);
      const line = new THREE.Line(lineGeo, lineMaterial);
      scene.add(line);
      lineGeometries.push(line);
    }

    // ── Mouse parallax ──────────────────────────────────────────────────────
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // ── Resize handler ──────────────────────────────────────────────────────
    const handleResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // ── Animation loop ──────────────────────────────────────────────────────
    let frameId;
    const clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      particles.rotation.y = elapsed * 0.025 + mouseX * 0.04;
      particles.rotation.x = elapsed * 0.012 + mouseY * 0.02;

      // Breathe effect on particle opacity
      material.opacity = 0.55 + Math.sin(elapsed * 0.5) * 0.1;

      lineGeometries.forEach((line, i) => {
        line.material.opacity = 0.04 + Math.sin(elapsed * 0.3 + i * 0.5) * 0.03;
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 0, ...style }}
    />
  );
}
