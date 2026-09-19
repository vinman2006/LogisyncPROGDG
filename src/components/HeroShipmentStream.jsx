import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ThreeJsBackground from './ThreeJsBackground';

// Register ScrollTrigger plugin if not already registered
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Authentic 3D Isometric Cardboard Shipping Box matching reference image with dynamic badge states
function CardboardBox({ 
  id = 'box1', 
  size = 260, 
  showBadge = true, 
  showLabel = true, 
  badgeType = 'standard', // 'standard' | 'cold-chain' | 'tracking' | 'network' | 'delivered'
  className = '', 
  style = {} 
}) {
  const width = size;
  const height = size * 0.833;

  return (
    <div className={`relative flex-shrink-0 ${className}`} style={{ width, height, ...style }}>
      <svg 
        viewBox="0 0 240 200" 
        className="w-full h-full drop-shadow-[0_20px_40px_rgba(10,5,40,0.65)]" 
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Cardboard Top Face Gradient */}
          <linearGradient id={`boxTop_${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f5c792" />
            <stop offset="100%" stopColor="#dfa565" />
          </linearGradient>

          {/* Cardboard Left Face Gradient (Facing front-left) */}
          <linearGradient id={`boxLeft_${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d99553" />
            <stop offset="100%" stopColor="#be7b38" />
          </linearGradient>

          {/* Cardboard Right Face Gradient (Facing front-right / shaded) */}
          <linearGradient id={`boxRight_${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#b57333" />
            <stop offset="100%" stopColor="#96581f" />
          </linearGradient>

          {/* Brown Packing Tape Gradient */}
          <linearGradient id={`tapeGrad_${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#b47437" />
            <stop offset="100%" stopColor="#985c25" />
          </linearGradient>

          {/* Ground Contact Shadow */}
          <radialGradient id={`boxShadow_${id}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#080424" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#080424" stopOpacity="0" />
          </radialGradient>

          {/* Glow filter for delivery checkmark */}
          <filter id={`deliveredGlow_${id}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Ambient Ground Shadow */}
        <ellipse cx="120" cy="180" rx="95" ry="18" fill={`url(#boxShadow_${id})`} />

        {/* ── TOP FACE ──────────────────────────────────────── */}
        <path
          d="M 120 20 L 210 58 L 120 96 L 30 58 Z"
          fill={`url(#boxTop_${id})`}
        />
        {/* Packing Tape on Top Seam */}
        <path
          d="M 110 24 L 130 32 L 130 92 L 110 84 Z"
          fill={`url(#tapeGrad_${id})`}
          opacity="0.9"
        />

        {/* ── LEFT FACE (Facing front-left) ─────────────────── */}
        <path
          d="M 30 58 L 120 96 L 120 176 L 30 138 Z"
          fill={`url(#boxLeft_${id})`}
        />
        {/* Packing Tape Fold over Left Edge */}
        <path
          d="M 110 84 L 120 96 L 120 176 L 110 168 Z"
          fill={`url(#tapeGrad_${id})`}
          opacity="0.65"
        />

        {/* ── DYNAMIC BADGE ON LEFT FACE ─────────────────────── */}
        {showBadge && badgeType === 'standard' && (
          <g transform="translate(62, 105) skewY(23)">
            <rect x="0" y="0" width="28" height="34" rx="2" fill="none" stroke="#2a1808" strokeWidth="2.2" />
            <path d="M 8 26 L 8 13 L 5 16 M 8 13 L 11 16" stroke="#2a1808" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="5" y1="26" x2="11" y2="26" stroke="#2a1808" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M 20 26 L 20 13 L 17 16 M 20 13 L 23 16" stroke="#2a1808" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="17" y1="26" x2="23" y2="26" stroke="#2a1808" strokeWidth="2.2" strokeLinecap="round" />
          </g>
        )}

        {/* Cold-Chain Snowflake Badge */}
        {showBadge && badgeType === 'cold-chain' && (
          <g transform="translate(60, 102) skewY(23)">
            <circle cx="15" cy="18" r="14" fill="#08233d" stroke="#38bdf8" strokeWidth="2" />
            <g stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round">
              <line x1="15" y1="9" x2="15" y2="27" />
              <line x1="7" y1="18" x2="23" y2="18" />
              <line x1="9" y1="12" x2="21" y2="24" />
              <line x1="9" y1="24" x2="21" y2="12" />
              <line x1="13" y1="11" x2="15" y2="13" />
              <line x1="17" y1="11" x2="15" y2="13" />
              <line x1="13" y1="25" x2="15" y2="23" />
              <line x1="17" y1="25" x2="15" y2="23" />
            </g>
            <circle cx="15" cy="18" r="2.5" fill="#e0f2fe" />
          </g>
        )}

        {/* Location / Tracking Pin Badge */}
        {showBadge && badgeType === 'tracking' && (
          <g transform="translate(60, 102) skewY(23)">
            <rect x="0" y="2" width="30" height="32" rx="7" fill="#2d1405" stroke="#f97316" strokeWidth="2" />
            <path d="M 15 8 C 11 8 8 11 8 15 C 8 20 15 26 15 26 C 15 26 22 20 22 15 C 22 11 19 8 15 8 Z" fill="#ea580c" />
            <circle cx="15" cy="14" r="3" fill="#ffffff" />
          </g>
        )}

        {/* Global Mesh / Network Badge */}
        {showBadge && badgeType === 'network' && (
          <g transform="translate(60, 102) skewY(23)">
            <circle cx="15" cy="18" r="14" fill="#1b0f38" stroke="#a855f7" strokeWidth="2" />
            <circle cx="15" cy="18" r="10" fill="none" stroke="#c084fc" strokeWidth="1.2" strokeDasharray="2.5 2.5" />
            <ellipse cx="15" cy="18" rx="5" ry="10" fill="none" stroke="#e9d5ff" strokeWidth="1.2" />
            <line x1="5" y1="18" x2="25" y2="18" stroke="#e9d5ff" strokeWidth="1.2" />
          </g>
        )}

        {/* Delivered Checkmark Badge */}
        {showBadge && badgeType === 'delivered' && (
          <g transform="translate(59, 100) skewY(23)">
            <rect x="0" y="2" width="32" height="32" rx="8" fill="#06291a" stroke="#22c55e" strokeWidth="2.5" filter={`url(#deliveredGlow_${id})`} />
            <circle cx="16" cy="18" r="10" fill="#15803d" opacity="0.3" />
            <path d="M 9 18 L 14 23 L 23 12" fill="none" stroke="#4ade80" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        )}

        {/* ── RIGHT FACE (Facing front-right / shaded) ──────── */}
        <path
          d="M 120 96 L 210 58 L 210 138 L 120 176 Z"
          fill={`url(#boxRight_${id})`}
        />
        {/* Packing Tape on Top-Right Edge */}
        <path
          d="M 195 64 L 210 58 L 210 80 L 195 86 Z"
          fill={`url(#tapeGrad_${id})`}
          opacity="0.8"
        />

        {/* White Shipping Label with Barcode on Right Face */}
        {showLabel && (
          <g transform="translate(142, 94) skewY(-23)">
            <rect x="0" y="0" width="46" height="36" rx="2" fill="#ffffff" />
            <rect x="4" y="16" width="38" height="15" fill="#f8fafc" />
            <line x1="6" y1="18" x2="6" y2="29" stroke="#000" strokeWidth="1.2" />
            <line x1="9" y1="18" x2="9" y2="29" stroke="#000" strokeWidth="2.2" />
            <line x1="13" y1="18" x2="13" y2="29" stroke="#000" strokeWidth="1" />
            <line x1="16" y1="18" x2="16" y2="29" stroke="#000" strokeWidth="2.8" />
            <line x1="21" y1="18" x2="21" y2="29" stroke="#000" strokeWidth="1.5" />
            <line x1="25" y1="18" x2="25" y2="29" stroke="#000" strokeWidth="2" />
            <line x1="29" y1="18" x2="29" y2="29" stroke="#000" strokeWidth="1" />
            <line x1="33" y1="18" x2="33" y2="29" stroke="#000" strokeWidth="2.4" />
            <line x1="38" y1="18" x2="38" y2="29" stroke="#000" strokeWidth="1.4" />
            <line x1="4" y1="5" x2="28" y2="5" stroke="#94a3b8" strokeWidth="1.2" />
            <line x1="4" y1="9" x2="22" y2="9" stroke="#94a3b8" strokeWidth="1" />
          </g>
        )}

        {/* Subtle Edge Bevel Highlights */}
        <line x1="120" y1="20" x2="120" y2="176" stroke="#ffffff" strokeWidth="0.8" opacity="0.35" />
        <line x1="30" y1="58" x2="120" y2="96" stroke="#ffffff" strokeWidth="0.8" opacity="0.25" />
        <line x1="120" y1="96" x2="210" y2="58" stroke="#ffffff" strokeWidth="0.6" opacity="0.2" />
      </svg>
    </div>
  );
}

export default function HeroShipmentStream({ 
  onOpenDashboard, 
  onOpenAiAssistant, 
  onOpenApiHub, 
  onOpenPublicMap, 
  onOpenOnboarding,
  onOpenDemo 
}) {
  const heroSectionRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // ── Scroll Progress Calculation & ScrollTrigger sync ────────────────────────
  useEffect(() => {
    let rafId = null;

    const handleScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        if (!heroSectionRef.current) {
          rafId = null;
          return;
        }
        const el = heroSectionRef.current;
        const rect = el.getBoundingClientRect();
        const totalScrollable = el.offsetHeight - window.innerHeight;
        
        if (totalScrollable > 0) {
          const scrolled = Math.max(0, -rect.top);
          const p = Math.min(Math.max(scrolled / totalScrollable, 0), 1);
          setScrollProgress(p);
        }
        rafId = null;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    let trigger = null;
    try {
      trigger = ScrollTrigger.create({
        trigger: heroSectionRef.current,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          setScrollProgress(self.progress);
        },
      });
    } catch (e) {
      // Graceful fallback to window listener
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
      if (trigger) trigger.kill();
    };
  }, []);

  const p = scrollProgress; // 0.0 → 1.0 continuous scrub position

  // ── Package Position, Opacity & Badge Interpolation (Left → Right) ──────────
  // Package 1: Lead Package (Middle lane, visible at 0% → travels right)
  const pkg1 = (() => {
    // 0% -> 10%, 12% -> 22%, 25% -> 42%, 40% -> 66%, 55% -> 82%, 70% -> 96%
    const x = p <= 0.70 ? 10 + (p / 0.70) * 86 : 96 + (p - 0.70) * 80;
    const opacity = p <= 0.70 ? (p < 0.08 ? 0.85 + p * 1.5 : 1) : Math.max(0, 1 - (p - 0.70) * 12);
    const badgeType = p >= 0.60 ? 'tracking' : p >= 0.45 ? 'cold-chain' : 'standard';
    const trailWidth = Math.max(40, Math.min(340, x * 3.4));
    return { x, opacity, badgeType, trailWidth };
  })();

  // Package 2: Upper Lane Package (Starts entering around 25% -> delivers at 100%)
  const pkg2 = (() => {
    // Hidden before 20%
    if (p < 0.20) {
      return { x: -20, opacity: 0, badgeType: 'standard', trailWidth: 20 };
    }
    // 25% -> 12%, 40% -> 38%, 55% -> 60%, 70% -> 78%, 85% -> 88%, 100% -> 93%
    const normalizedP = (p - 0.20) / 0.80;
    const x = 5 + normalizedP * 88;
    const opacity = Math.min(1, (p - 0.20) * 8);
    const badgeType = p >= 0.92 ? 'delivered' : p >= 0.75 ? 'tracking' : p >= 0.52 ? 'cold-chain' : 'standard';
    const trailWidth = Math.max(40, Math.min(360, x * 3.6));
    return { x, opacity, badgeType, trailWidth };
  })();

  // Package 3: Lower Lane Package (Enters around 35% -> travels to ~86% at 100%)
  const pkg3 = (() => {
    if (p < 0.32) {
      return { x: -20, opacity: 0, badgeType: 'standard', trailWidth: 20 };
    }
    // 40% -> 10%, 55% -> 26%, 70% -> 48%, 85% -> 70%, 100% -> 86%
    const normalizedP = (p - 0.32) / 0.68;
    const x = 6 + normalizedP * 80;
    const opacity = Math.min(1, (p - 0.32) * 8);
    const badgeType = p >= 0.65 ? 'network' : 'standard';
    const trailWidth = Math.max(35, Math.min(320, x * 3.2));
    return { x, opacity, badgeType, trailWidth };
  })();

  // Package 4: Middle Lane Second Wave (Enters around 55% -> travels to ~60% at 100%)
  const pkg4 = (() => {
    if (p < 0.52) {
      return { x: -20, opacity: 0, badgeType: 'standard', trailWidth: 20 };
    }
    // 70% -> 14%, 85% -> 38%, 100% -> 62%
    const normalizedP = (p - 0.52) / 0.48;
    const x = 6 + normalizedP * 56;
    const opacity = Math.min(1, (p - 0.52) * 8);
    const badgeType = p >= 0.88 ? 'tracking' : p >= 0.75 ? 'cold-chain' : 'standard';
    const trailWidth = Math.max(30, Math.min(260, x * 3.0));
    return { x, opacity, badgeType, trailWidth };
  })();

  // Package 5: Bottom Lane Second Wave (Enters around 75% -> reaches ~28% at 100%)
  const pkg5 = (() => {
    if (p < 0.72) {
      return { x: -20, opacity: 0, badgeType: 'standard', trailWidth: 20 };
    }
    const normalizedP = (p - 0.72) / 0.28;
    const x = 5 + normalizedP * 24;
    const opacity = Math.min(1, (p - 0.72) * 8);
    const badgeType = 'standard';
    const trailWidth = Math.max(25, Math.min(200, x * 2.8));
    return { x, opacity, badgeType, trailWidth };
  })();

  return (
    <section 
      ref={heroSectionRef}
      id="hero"
      style={{ height: '280vh' }}
      className="relative w-full bg-[#140a4a] text-[#c7d5fd] select-none"
    >
      {/* ── STICKY PINNED CONTAINER: Stays pinned while user scrubs through 280vh ── */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-center overflow-hidden bg-[#140a4a]">

        {/* ── THREE.JS PARTICLES PINNED IN BACKGROUND ──────────────────────── */}
        <ThreeJsBackground />

        {/* ── AMBIENT HERO LIGHTING (Subtle purple / violet depth) ─────────── */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 85% 65% at 75% 50%, rgba(109, 40, 217, 0.38) 0%, rgba(20, 10, 74, 0.8) 55%, #140a4a 100%)',
          }}
        />

        {/* Subtle warm speed-line ambient glow behind right tracks */}
        <div 
          className="absolute top-1/2 right-[18%] -translate-y-1/2 w-[550px] h-[320px] pointer-events-none rounded-full blur-3xl opacity-25"
          style={{
            background: 'radial-gradient(circle, rgba(255, 115, 0, 0.6) 0%, rgba(147, 51, 234, 0.35) 50%, transparent 75%)',
          }}
        />

        {/* ── MAIN HERO LAYOUT: Left Fixed Headline + Right Scrubbed Conveyor ── */}
        <div className="relative z-10 w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-16 pt-20 pb-8 flex-1 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-10">

          {/* ── LEFT SIDE: Fixed Headline + Fixed Paragraph + Fixed CTA Button ── */}
          <div className="w-full lg:w-[46%] flex flex-col justify-center select-none z-20">
            <h1 
              className="font-display font-black uppercase tracking-tight sm:tracking-tighter leading-[0.84] text-[#c7d5fd] headline-stable"
              style={{
                fontSize: 'clamp(3.2rem, 7.5vw, 6.8rem)',
                textShadow: '0 4px 30px rgba(10, 4, 40, 0.5)',
              }}
            >
              <span className="block text-[#dbe5ff] drop-shadow-sm">MOVE</span>
              <span className="block text-[#dbe5ff] drop-shadow-sm">EVERY</span>
              <span className="block text-[#c7d5fd] drop-shadow-sm">SHIPMENT</span>
              <span className="block text-[#c7d5fd] drop-shadow-sm">SMARTER</span>
            </h1>

            <p className="mt-5 text-sm sm:text-base text-[#a9bee8] max-w-lg leading-relaxed font-sans">
              Autonomous multimodal logistics with sub-second telemetry, cold-chain compliance, and live NeonDB PostgreSQL coordination.
            </p>

            {/* Fixed Action Button */}
            <div className="mt-6">
              <button
                type="button"
                onClick={() => onOpenDashboard && onOpenDashboard('command-center')}
                className="px-8 py-3.5 rounded-full bg-white hover:bg-[#f0f4ff] text-[#0d0738] font-display font-black text-xs uppercase tracking-wider cursor-pointer shadow-[0_4px_16px_rgba(0,0,0,0.25)] transition-all hover:scale-105 active:scale-95"
              >
                START NOW
              </button>
            </div>
          </div>

          {/* ── RIGHT SIDE: Contained Conveyor Transport Animation Zone ─────── */}
          <div 
            className="hero-track-container w-full lg:w-[54%] h-[380px] sm:h-[480px] lg:h-[560px] relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-r from-white/[0.01] via-white/[0.025] to-transparent select-none"
            aria-label="Scroll-driven logistics conveyor animation"
          >
            {/* Subtle Ambient Depth Lighting inside the Zone */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse 90% 70% at 50% 50%, rgba(124, 58, 237, 0.08) 0%, transparent 80%)',
              }}
            />

            {/* ═════════════════════════════════════════════════════════════════ */}
            {/* CONVEYOR LANE 1 (TOP): Packages Scrubbed Left → Right              */}
            {/* ═════════════════════════════════════════════════════════════════ */}
            <div className="absolute left-0 right-0 h-0 pointer-events-none" style={{ top: '24%' }}>
              {/* Subtle transit guide line */}
              <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

              {/* Ambient Glowing Track Beam (Right destination terminal glow) */}
              <div 
                className="absolute right-6 top-[-6px] h-3 rounded-full opacity-60 pointer-events-none"
                style={{
                  width: 'clamp(140px, 20vw, 260px)',
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255, 119, 0, 0.25) 30%, #ff7700 70%, #ffb347 100%)',
                  boxShadow: '0 0 20px rgba(255, 119, 0, 0.4)',
                }}
              />

              {/* Top Lane Package (Pkg 2: Travels to destination checkmark) */}
              {pkg2.opacity > 0.01 && (
                <div 
                  className="conveyor-item"
                  style={{
                    transform: `translate3d(calc(${pkg2.x}% - 60px), -50%, 0)`,
                    opacity: pkg2.opacity,
                  }}
                >
                  {/* Glowing Trail */}
                  <div className="flex flex-col items-end gap-1 mr-[-12px] z-0">
                    <div 
                      className="h-3 sm:h-3.5 rounded-full"
                      style={{
                        width: `${pkg2.trailWidth}px`,
                        background: 'linear-gradient(90deg, transparent 0%, rgba(255, 119, 0, 0.25) 20%, #ff7700 50%, #ffb347 75%, #ff5500 100%)',
                        boxShadow: '0 0 16px rgba(255, 119, 0, 0.55)',
                      }}
                    />
                    <div 
                      className="h-2.5 sm:h-3 rounded-full mr-4"
                      style={{
                        width: `${pkg2.trailWidth * 1.15}px`,
                        background: 'linear-gradient(90deg, transparent 0%, rgba(124, 58, 237, 0.25) 20%, #7c3aed 45%, #a78bfa 70%, #6d28d9 100%)',
                        boxShadow: '0 0 14px rgba(124, 58, 237, 0.4)',
                      }}
                    />
                  </div>

                  <div className="relative z-10 flex-shrink-0">
                    <CardboardBox 
                      id="boxTopScrub" 
                      size={118} 
                      badgeType={pkg2.badgeType} 
                      className="origin-center" 
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ═════════════════════════════════════════════════════════════════ */}
            {/* CONVEYOR LANE 2 (MIDDLE): Packages Scrubbed Left → Right           */}
            {/* ═════════════════════════════════════════════════════════════════ */}
            <div className="absolute left-0 right-0 h-0 pointer-events-none" style={{ top: '50%' }}>
              <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

              {/* Ambient Glowing Track Beam */}
              <div 
                className="absolute right-14 top-[-5px] h-2.5 rounded-full opacity-40 pointer-events-none"
                style={{
                  width: 'clamp(120px, 16vw, 220px)',
                  background: 'linear-gradient(90deg, transparent 0%, rgba(124, 58, 237, 0.2) 20%, #7c3aed 60%, #a78bfa 100%)',
                  boxShadow: '0 0 16px rgba(124, 58, 237, 0.35)',
                }}
              />

              {/* Initial Lead Package (Pkg 1: Visible at 0% and scrubs right) */}
              {pkg1.opacity > 0.01 && (
                <div 
                  className="conveyor-item"
                  style={{
                    transform: `translate3d(calc(${pkg1.x}% - 55px), -50%, 0)`,
                    opacity: pkg1.opacity,
                  }}
                >
                  {/* Glowing Trail */}
                  <div className="flex flex-col items-end gap-1 mr-[-10px] z-0">
                    <div 
                      className="h-2.5 sm:h-3 rounded-full"
                      style={{
                        width: `${pkg1.trailWidth}px`,
                        background: 'linear-gradient(90deg, transparent 0%, rgba(255, 136, 0, 0.25) 25%, #ff8800 50%, #ffc060 75%, #ff6600 100%)',
                        boxShadow: '0 0 14px rgba(255, 136, 0, 0.5)',
                      }}
                    />
                    <div 
                      className="h-2 sm:h-2.5 rounded-full mr-3"
                      style={{
                        width: `${pkg1.trailWidth * 1.15}px`,
                        background: 'linear-gradient(90deg, transparent 0%, rgba(139, 92, 246, 0.2) 20%, #8b5cf6 45%, #c4b5fd 70%, #7c3aed 100%)',
                        boxShadow: '0 0 12px rgba(139, 92, 246, 0.4)',
                      }}
                    />
                  </div>

                  <div className="relative z-10 flex-shrink-0">
                    <CardboardBox 
                      id="boxLeadScrub" 
                      size={105} 
                      badgeType={pkg1.badgeType} 
                      className="origin-center" 
                    />
                  </div>
                </div>
              )}

              {/* Middle Lane Second Package (Pkg 4: Enters around 55%) */}
              {pkg4.opacity > 0.01 && (
                <div 
                  className="conveyor-item hidden sm:flex"
                  style={{
                    transform: `translate3d(calc(${pkg4.x}% - 45px), -50%, 0)`,
                    opacity: pkg4.opacity,
                  }}
                >
                  <div className="flex flex-col items-end gap-1 mr-[-10px] z-0">
                    <div 
                      className="h-2.5 sm:h-3 rounded-full"
                      style={{
                        width: `${pkg4.trailWidth}px`,
                        background: 'linear-gradient(90deg, transparent 0%, rgba(255, 136, 0, 0.25) 25%, #ff8800 50%, #ffc060 75%, #ff6600 100%)',
                        boxShadow: '0 0 14px rgba(255, 136, 0, 0.5)',
                      }}
                    />
                    <div 
                      className="h-2 sm:h-2.5 rounded-full mr-3"
                      style={{
                        width: `${pkg4.trailWidth * 1.15}px`,
                        background: 'linear-gradient(90deg, transparent 0%, rgba(139, 92, 246, 0.2) 20%, #8b5cf6 45%, #c4b5fd 70%, #7c3aed 100%)',
                        boxShadow: '0 0 12px rgba(139, 92, 246, 0.4)',
                      }}
                    />
                  </div>

                  <div className="relative z-10 flex-shrink-0">
                    <CardboardBox 
                      id="boxMidWaveScrub" 
                      size={90} 
                      badgeType={pkg4.badgeType} 
                      className="origin-center" 
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ═════════════════════════════════════════════════════════════════ */}
            {/* CONVEYOR LANE 3 (BOTTOM): Large Freight Boxes (Left → Right)      */}
            {/* ═════════════════════════════════════════════════════════════════ */}
            <div className="absolute left-0 right-0 h-0 pointer-events-none" style={{ top: '76%' }}>
              <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

              {/* Ambient Glowing Track Beam */}
              <div 
                className="absolute right-4 top-[-6px] h-3.5 rounded-full opacity-55 pointer-events-none"
                style={{
                  width: 'clamp(150px, 20vw, 260px)',
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255, 115, 0, 0.3) 25%, #ff7700 65%, #ffaa33 100%)',
                  boxShadow: '0 0 18px rgba(255, 119, 0, 0.5)',
                }}
              />

              {/* Bottom Lane Package 3 */}
              {pkg3.opacity > 0.01 && (
                <div 
                  className="conveyor-item"
                  style={{
                    transform: `translate3d(calc(${pkg3.x}% - 65px), -50%, 0)`,
                    opacity: pkg3.opacity,
                  }}
                >
                  <div className="flex flex-col items-end gap-1.5 mr-[-14px] z-0">
                    <div 
                      className="h-3.5 sm:h-4 rounded-full"
                      style={{
                        width: `${pkg3.trailWidth}px`,
                        background: 'linear-gradient(90deg, transparent 0%, rgba(255, 115, 0, 0.3) 20%, #ff7700 45%, #ffaa33 70%, #ff5500 100%)',
                        boxShadow: '0 0 20px rgba(255, 119, 0, 0.6)',
                      }}
                    />
                    <div 
                      className="h-3 sm:h-3.5 rounded-full mr-4"
                      style={{
                        width: `${pkg3.trailWidth * 1.15}px`,
                        background: 'linear-gradient(90deg, transparent 0%, rgba(139, 92, 246, 0.25) 15%, #8b5cf6 40%, #a78bfa 65%, #7c3aed 100%)',
                        boxShadow: '0 0 18px rgba(139, 92, 246, 0.45)',
                      }}
                    />
                  </div>

                  <div className="relative z-10 flex-shrink-0">
                    <CardboardBox 
                      id="boxBottomScrub1" 
                      size={130} 
                      badgeType={pkg3.badgeType} 
                      className="origin-center" 
                    />
                  </div>
                </div>
              )}

              {/* Bottom Lane Package 5 (Second wave) */}
              {pkg5.opacity > 0.01 && (
                <div 
                  className="conveyor-item hidden sm:flex"
                  style={{
                    transform: `translate3d(calc(${pkg5.x}% - 60px), -50%, 0)`,
                    opacity: pkg5.opacity,
                  }}
                >
                  <div className="flex flex-col items-end gap-1.5 mr-[-14px] z-0">
                    <div 
                      className="h-3.5 sm:h-4 rounded-full"
                      style={{
                        width: `${pkg5.trailWidth}px`,
                        background: 'linear-gradient(90deg, transparent 0%, rgba(255, 115, 0, 0.3) 20%, #ff7700 45%, #ffaa33 70%, #ff5500 100%)',
                        boxShadow: '0 0 20px rgba(255, 119, 0, 0.6)',
                      }}
                    />
                    <div 
                      className="h-3 sm:h-3.5 rounded-full mr-4"
                      style={{
                        width: `${pkg5.trailWidth * 1.15}px`,
                        background: 'linear-gradient(90deg, transparent 0%, rgba(139, 92, 246, 0.25) 15%, #8b5cf6 40%, #a78bfa 65%, #7c3aed 100%)',
                        boxShadow: '0 0 18px rgba(139, 92, 246, 0.45)',
                      }}
                    />
                  </div>

                  <div className="relative z-10 flex-shrink-0">
                    <CardboardBox 
                      id="boxBottomScrub2" 
                      size={118} 
                      badgeType={pkg5.badgeType} 
                      className="origin-center" 
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ── RIGHT-SIDE VERTICAL SCROLL SCRUBBER (0% → 100%) ─────────────────── */}
            <div 
              className="hidden sm:flex absolute right-3 lg:right-5 top-1/2 -translate-y-1/2 h-[60%] lg:h-[70%] w-9 flex-col items-center justify-between z-30 pointer-events-none select-none"
              aria-label="Scroll progress indicator"
            >
              {/* Background Track Line */}
              <div className="absolute top-0 bottom-0 w-[1.5px] bg-white/15 rounded-full" />
              
              {/* Active Glowing Filled Progress Track */}
              <div 
                className="absolute top-0 w-[2px] bg-gradient-to-b from-[#ff7700] via-[#7c3aed] to-[#a855f7] rounded-full shadow-[0_0_8px_rgba(255,119,0,0.6)]"
                style={{ height: `${p * 100}%` }}
              />

              {/* Moving Circular Thumb Knob & Current Percentage */}
              <div 
                className="absolute -translate-y-1/2 flex items-center gap-1.5 will-change-transform"
                style={{ top: `${p * 100}%` }}
              >
                <div className="relative flex items-center justify-center">
                  <div className="w-3.5 h-3.5 rounded-full bg-white border-2 border-[#ff7700] shadow-[0_0_10px_#ff7700] ring-2 ring-[#7c3aed]/40" />
                  <div className="absolute w-5 h-5 rounded-full bg-[#ff7700]/25 animate-ping pointer-events-none" />
                </div>

                <div className="text-[9.5px] font-mono font-bold tracking-wider text-white bg-[#140a4a]/90 backdrop-blur-md px-1.5 py-0.5 rounded border border-white/20 shadow-md">
                  {Math.round(p * 100)}%
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* ── SUBTLE BOTTOM CAPTION: Matches reference mockup ─────────────── */}
        <div className="relative z-10 pb-4 text-center">
          <div className="inline-flex items-center gap-2 text-[10px] sm:text-[11px] font-mono tracking-widest text-[#93a8d9] uppercase opacity-80">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff7700] animate-ping" />
            <span>Boxes continuously move from left to right as the user scrolls down</span>
          </div>
        </div>

      </div>
    </section>
  );
}
