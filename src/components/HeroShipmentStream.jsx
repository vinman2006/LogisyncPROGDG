import React from 'react';

// Authentic 3D Isometric Cardboard Shipping Box matching reference image
function CardboardBox({ id = 'box1', size = 260, showBadge = true, showLabel = true, className = '', style = {} }) {
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

        {/* Double Upward Arrow Fragile Stamp on Left Face */}
        {showBadge && (
          <g transform="translate(62, 105) skewY(23)">
            <rect x="0" y="0" width="28" height="34" rx="2" fill="none" stroke="#2a1808" strokeWidth="2.2" />
            <path d="M 8 26 L 8 13 L 5 16 M 8 13 L 11 16" stroke="#2a1808" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="5" y1="26" x2="11" y2="26" stroke="#2a1808" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M 20 26 L 20 13 L 17 16 M 20 13 L 23 16" stroke="#2a1808" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="17" y1="26" x2="23" y2="26" stroke="#2a1808" strokeWidth="2.2" strokeLinecap="round" />
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
  return (
    <section className="relative w-full min-h-screen bg-[#140a4a] text-[#c7d5fd] flex flex-col justify-center overflow-hidden select-none">
      
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

      {/* ── MAIN HERO LAYOUT: Left Headline + Right Live Shipment Tracks ──── */}
      <div className="relative z-10 w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-16 pt-24 sm:pt-20 pb-8 flex-1 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-10">

        {/* ── LEFT SIDE: Stable Bold 4-Line Headline + Working Action CTAs ── */}
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

          {/* Single Action Button without animation */}
          <div className="mt-6">
            <button
              type="button"
              onClick={() => onOpenDashboard && onOpenDashboard('command-center')}
              className="px-8 py-3.5 rounded-full bg-white hover:bg-[#f0f4ff] text-[#0d0738] font-display font-black text-xs uppercase tracking-wider cursor-pointer shadow-[0_4px_16px_rgba(0,0,0,0.25)]"
            >
              START NOW
            </button>
          </div>

        </div>

        {/* ── RIGHT SIDE: Contained Conveyor Transport Animation Zone ─────── */}
        <div 
          className="hero-track-container w-full lg:w-[54%] h-[380px] sm:h-[480px] lg:h-[560px] relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-r from-white/[0.01] via-white/[0.025] to-transparent select-none pointer-events-none"
          aria-hidden="true"
        >
          {/* Subtle Ambient Depth Lighting inside the Zone */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 90% 70% at 50% 50%, rgba(124, 58, 237, 0.08) 0%, transparent 80%)',
            }}
          />

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* CONVEYOR LANE 1 (TOP): Medium Cardboard Boxes (Left → Right)      */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          <div className="absolute left-0 right-0 h-0 pointer-events-none" style={{ top: '22%' }}>
            {/* Subtle transit guide line */}
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />

            {/* Lane 1 Package A */}
            <div className="conveyor-item conveyor-lane1-a">
              <div className="flex flex-col items-end gap-1 mr-[-12px] z-0">
                <div 
                  className="h-3 sm:h-3.5 rounded-full anim-shimmer-orange"
                  style={{
                    width: 'clamp(140px, 18vw, 240px)',
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255, 119, 0, 0.3) 25%, #ff7700 50%, #ffb347 75%, #ff5500 100%)',
                    boxShadow: '0 0 16px rgba(255, 119, 0, 0.55)',
                  }}
                />
                <div 
                  className="h-2.5 sm:h-3 rounded-full mr-4 anim-shimmer-purple"
                  style={{
                    width: 'clamp(180px, 22vw, 300px)',
                    background: 'linear-gradient(90deg, transparent 0%, rgba(124, 58, 237, 0.3) 20%, #7c3aed 45%, #a78bfa 70%, #6d28d9 100%)',
                    boxShadow: '0 0 14px rgba(124, 58, 237, 0.4)',
                  }}
                />
              </div>
              <div className="relative z-10 flex-shrink-0">
                <CardboardBox id="boxL1A" size={118} className="origin-center" />
              </div>
            </div>

            {/* Lane 1 Package B (Staggered by 50% for continuous motion) */}
            <div className="conveyor-item conveyor-lane1-b">
              <div className="flex flex-col items-end gap-1 mr-[-12px] z-0">
                <div 
                  className="h-3 sm:h-3.5 rounded-full anim-shimmer-orange"
                  style={{
                    width: 'clamp(140px, 18vw, 240px)',
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255, 119, 0, 0.3) 25%, #ff7700 50%, #ffb347 75%, #ff5500 100%)',
                    boxShadow: '0 0 16px rgba(255, 119, 0, 0.55)',
                  }}
                />
                <div 
                  className="h-2.5 sm:h-3 rounded-full mr-4 anim-shimmer-purple"
                  style={{
                    width: 'clamp(180px, 22vw, 300px)',
                    background: 'linear-gradient(90deg, transparent 0%, rgba(124, 58, 237, 0.3) 20%, #7c3aed 45%, #a78bfa 70%, #6d28d9 100%)',
                    boxShadow: '0 0 14px rgba(124, 58, 237, 0.4)',
                  }}
                />
              </div>
              <div className="relative z-10 flex-shrink-0">
                <CardboardBox id="boxL1B" size={118} className="origin-center" />
              </div>
            </div>
          </div>

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* CONVEYOR LANE 2 (MIDDLE): Compact Cardboard Boxes (Left → Right)   */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          <div className="absolute left-0 right-0 h-0 pointer-events-none" style={{ top: '50%' }}>
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />

            {/* Lane 2 Package A */}
            <div className="conveyor-item conveyor-lane2-a">
              <div className="flex flex-col items-end gap-1 mr-[-10px] z-0">
                <div 
                  className="h-2.5 sm:h-3 rounded-full anim-shimmer-orange"
                  style={{
                    width: 'clamp(120px, 16vw, 200px)',
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255, 136, 0, 0.3) 25%, #ff8800 50%, #ffc060 75%, #ff6600 100%)',
                    boxShadow: '0 0 14px rgba(255, 136, 0, 0.5)',
                  }}
                />
                <div 
                  className="h-2 sm:h-2.5 rounded-full mr-3 anim-shimmer-purple"
                  style={{
                    width: 'clamp(150px, 20vw, 250px)',
                    background: 'linear-gradient(90deg, transparent 0%, rgba(139, 92, 246, 0.3) 20%, #8b5cf6 45%, #c4b5fd 70%, #7c3aed 100%)',
                    boxShadow: '0 0 12px rgba(139, 92, 246, 0.4)',
                  }}
                />
              </div>
              <div className="relative z-10 flex-shrink-0">
                <CardboardBox id="boxL2A" size={88} className="origin-center" />
              </div>
            </div>

            {/* Lane 2 Package B */}
            <div className="conveyor-item conveyor-lane2-b">
              <div className="flex flex-col items-end gap-1 mr-[-10px] z-0">
                <div 
                  className="h-2.5 sm:h-3 rounded-full anim-shimmer-orange"
                  style={{
                    width: 'clamp(120px, 16vw, 200px)',
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255, 136, 0, 0.3) 25%, #ff8800 50%, #ffc060 75%, #ff6600 100%)',
                    boxShadow: '0 0 14px rgba(255, 136, 0, 0.5)',
                  }}
                />
                <div 
                  className="h-2 sm:h-2.5 rounded-full mr-3 anim-shimmer-purple"
                  style={{
                    width: 'clamp(150px, 20vw, 250px)',
                    background: 'linear-gradient(90deg, transparent 0%, rgba(139, 92, 246, 0.3) 20%, #8b5cf6 45%, #c4b5fd 70%, #7c3aed 100%)',
                    boxShadow: '0 0 12px rgba(139, 92, 246, 0.4)',
                  }}
                />
              </div>
              <div className="relative z-10 flex-shrink-0">
                <CardboardBox id="boxL2B" size={88} className="origin-center" />
              </div>
            </div>
          </div>

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* CONVEYOR LANE 3 (BOTTOM): Large Freight Boxes (Left → Right)      */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          <div className="absolute left-0 right-0 h-0 pointer-events-none" style={{ top: '78%' }}>
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />

            {/* Lane 3 Package A */}
            <div className="conveyor-item conveyor-lane3-a">
              <div className="flex flex-col items-end gap-1.5 mr-[-16px] z-0">
                <div 
                  className="h-4 sm:h-5 rounded-full anim-shimmer-orange"
                  style={{
                    width: 'clamp(160px, 20vw, 280px)',
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255, 115, 0, 0.35) 20%, #ff7700 45%, #ffaa33 70%, #ff5500 100%)',
                    boxShadow: '0 0 20px rgba(255, 119, 0, 0.65)',
                  }}
                />
                <div 
                  className="h-3 sm:h-4 rounded-full mr-5 anim-shimmer-purple"
                  style={{
                    width: 'clamp(200px, 25vw, 340px)',
                    background: 'linear-gradient(90deg, transparent 0%, rgba(139, 92, 246, 0.3) 15%, #8b5cf6 40%, #a78bfa 65%, #7c3aed 100%)',
                    boxShadow: '0 0 18px rgba(139, 92, 246, 0.5)',
                  }}
                />
              </div>
              <div className="relative z-10 flex-shrink-0">
                <CardboardBox id="boxL3A" size={142} className="origin-center" />
              </div>
            </div>

            {/* Lane 3 Package B */}
            <div className="conveyor-item conveyor-lane3-b">
              <div className="flex flex-col items-end gap-1.5 mr-[-16px] z-0">
                <div 
                  className="h-4 sm:h-5 rounded-full anim-shimmer-orange"
                  style={{
                    width: 'clamp(160px, 20vw, 280px)',
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255, 115, 0, 0.35) 20%, #ff7700 45%, #ffaa33 70%, #ff5500 100%)',
                    boxShadow: '0 0 20px rgba(255, 119, 0, 0.65)',
                  }}
                />
                <div 
                  className="h-3 sm:h-4 rounded-full mr-5 anim-shimmer-purple"
                  style={{
                    width: 'clamp(200px, 25vw, 340px)',
                    background: 'linear-gradient(90deg, transparent 0%, rgba(139, 92, 246, 0.3) 15%, #8b5cf6 40%, #a78bfa 65%, #7c3aed 100%)',
                    boxShadow: '0 0 18px rgba(139, 92, 246, 0.5)',
                  }}
                />
              </div>
              <div className="relative z-10 flex-shrink-0">
                <CardboardBox id="boxL3B" size={142} className="origin-center" />
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
