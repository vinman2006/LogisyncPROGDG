import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, Truck, MapPin, Package, Home, BarChart3, FileText, Search, Bell, 
  Globe, Clock, Calendar, AlertTriangle, ArrowRight, Plus, Minus, Crosshair, 
  ChevronDown, LogOut, Leaf, Coins, Train, Sparkles, Map, Network, LayoutGrid, 
  ChevronRight, User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function FeatureGridSection({ 
  onOpenDemo, 
  onOpenLogin, 
  onOpenDashboard,
  onOpenAiAssistant,
  onOpenApiHub,
  onOpenPublicMap
}) {
  const { user, logout, onboardingProfile } = useAuth();
  const profileName = onboardingProfile?.name || user?.displayName || user?.email?.split('@')[0] || 'User';
  const sectionRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // ── Pinned Scroll Progress Calculation ──────────────────────────────────────
  useEffect(() => {
    let rafId = null;

    const handleScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        if (!sectionRef.current) {
          rafId = null;
          return;
        }
        const el = sectionRef.current;
        const rect = el.getBoundingClientRect();
        const totalScrollable = el.offsetHeight - window.innerHeight;
        
        if (totalScrollable > 0) {
          // Progress is 0 when section hits top of viewport, 1 when it leaves
          const scrolled = Math.max(0, -rect.top);
          const p = Math.min(Math.max(scrolled / totalScrollable, 0), 1);
          setScrollProgress(p);
        }
        rafId = null;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  // 5 discrete feature stages mapped across 0.0 → 1.0 scroll progress
  // stageProgress is continuous: 0.0 to 4.0
  const stageProgress = scrollProgress * 4;
  const activeStage = Math.min(Math.floor(stageProgress + 0.5), 4);



  // Helper to compute smooth opacity, translation & scale for each card
  const getCardTransition = (index) => {
    const dist = stageProgress - index; // negative if ahead, positive if behind
    const absDist = Math.abs(dist);

    // Active card: opacity 1, translateY 0, scale 1
    // Adjacent: smoothly fades and offsets
    const opacity = Math.max(0, 1 - absDist * 1.6);
    const translateY = dist * -36; // moves slightly up as we scroll past
    const scale = Math.max(0.92, 1 - absDist * 0.05);

    return {
      opacity,
      transform: `translateY(${translateY}px) scale(${scale})`,
      pointerEvents: opacity > 0.4 ? 'auto' : 'none',
      transition: 'opacity 0.15s ease-out, transform 0.15s ease-out',
    };
  };

  const STAGES = [
    {
      id: 'visibility',
      num: '01',
      title: 'REAL-TIME SHIPMENT VISIBILITY',
      subtitle: 'Track every shipment. Across every mile with sub-second telemetry.',
      tag: 'LIVE MESH',
      color: '#0d221c',
      textColor: '#ffffff',
      subColor: '#8db8a9',
      accentColor: '#a8e63d',
      btnBorder: 'border-white/20',
      btnText: 'text-white hover:bg-white hover:text-[#0d221c]',
    },
    {
      id: 'optimization',
      num: '02',
      title: 'AI-POWERED ROUTE OPTIMIZATION',
      subtitle: 'Smarter routes. Lower costs. Greener miles computed in real-time.',
      tag: 'DYNAMIC PATH',
      color: '#f2ad38',
      textColor: '#17120a',
      subColor: '#523d21',
      accentColor: '#17120a',
      btnBorder: 'border-[#17120a]/30',
      btnText: 'text-[#17120a] hover:bg-[#17120a] hover:text-[#f2ad38]',
    },
    {
      id: 'prediction',
      num: '03',
      title: 'PREDICT DELAYS BEFORE THEY HAPPEN',
      subtitle: 'AI detects weather and port congestion risks. You stay in control.',
      tag: 'RISK RADAR',
      color: '#823719',
      textColor: '#ffffff',
      subColor: '#e8b39d',
      accentColor: '#ff5500',
      btnBorder: 'border-white/20',
      btnText: 'text-white hover:bg-white hover:text-[#823719]',
    },
    {
      id: 'control',
      num: '04',
      title: 'INTELLIGENT LOGISTICS CONTROL',
      subtitle: 'All your operations across 140+ countries. In one unified view.',
      tag: 'COMMAND CORE',
      color: '#091814',
      textColor: '#ffffff',
      subColor: '#7ca69a',
      accentColor: '#b5f542',
      btnBorder: 'border-white/20',
      btnText: 'text-white hover:bg-white hover:text-[#091814]',
    },
    {
      id: 'unified',
      num: '05',
      title: 'ONE COMMAND CENTER. EVERY MOVEMENT.',
      subtitle: 'People. Shipments. Autonomous decisions. All in perfect sync.',
      tag: 'END-TO-END',
      color: '#f39770',
      textColor: '#1b110b',
      subColor: '#5c3826',
      accentColor: '#65a30d',
      btnBorder: 'border-[#1b110b]/30',
      btnText: 'text-[#1b110b] hover:bg-[#1b110b] hover:text-[#f39770]',
    },
  ];

  return (
    <section 
      ref={sectionRef}
      id="intelligence" 
      style={{ height: '420vh' }}
      className="relative z-30 bg-[#f5f6e8] select-none text-[#071f1c]"
    >
      {/* ── STICKY PINNED STAGE: Stays pinned while user scrolls through 420vh ── */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-center p-4 sm:p-6 lg:p-10 overflow-hidden bg-[#f5f6e8]">

        {/* ── TOP SECTION HEADER (Positioned downwards, closely framing the showcase) ── */}
        <div className="max-w-[1640px] w-full mx-auto pb-3 sm:pb-4 mb-3 sm:mb-5 border-b border-[#0a231e]/10">
          <h2 className="font-display font-black text-xl sm:text-2xl lg:text-3xl uppercase tracking-tight text-[#112520] leading-none">
            ENGINEERED FOR <span className="text-[#e65100]">RADICAL VISIBILITY</span>
          </h2>
        </div>

        {/* ── MAIN SHOWCASE COMPOSITION (Editorial Left Card + Central Anchor Dashboard) ── */}
        <div className="max-w-[1640px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center overflow-hidden">

          {/* ================================================================ */}
          {/* LEFT: THE TRANSITIONING FEATURE CARD (4.5 cols)                  */}
          {/* ================================================================ */}
          <div className="lg:col-span-5 h-full relative flex flex-col justify-center">

            {/* Stacked Cards: all positioned in the same frame, transitioning smoothly via scroll */}
            <div className="relative w-full h-[520px] sm:h-[560px] lg:h-[590px]">

              {/* CARD 01: REAL-TIME SHIPMENT VISIBILITY */}
              <div 
                style={getCardTransition(0)}
                className="absolute inset-0 rounded-[32px] sm:rounded-[36px] bg-[#071a16] border border-[#1b4337] text-white p-7 sm:p-8 flex flex-col justify-between shadow-2xl overflow-hidden will-change-transform"
              >
                {/* Top Section: Title, Subtitle, Stepper */}
                <div className="relative z-10">
                  <h3 className="font-display font-black text-3xl sm:text-4xl lg:text-[42px] uppercase tracking-tight leading-[0.92] text-white">
                    REAL-TIME <br />
                    SHIPMENT <br />
                    VISIBILITY
                  </h3>

                  <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-[#8daea3] leading-relaxed font-normal">
                    Track every container.<br />
                    Across every ocean.<br />
                    In real time.
                  </p>

                  {/* 3-Node Stepper: Mumbai Origin -> In Transit -> Dubai Destination */}
                  <div className="relative flex items-center justify-between max-w-[320px] mt-5 sm:mt-6">
                    {/* Connecting Dashed Track */}
                    <div className="absolute top-4 left-6 right-6 h-[1.5px] border-t-2 border-dashed border-[#1f4e41] -z-0" />
                    <div className="absolute top-4 left-6 w-1/2 h-[1.5px] border-t-2 border-dashed border-emerald-500/80 -z-0" />

                    {/* Mumbai Origin */}
                    <div className="flex flex-col items-center relative z-10">
                      <div className="w-8 h-8 rounded-full bg-[#08201a] border border-[#235849] flex items-center justify-center text-white shadow-md">
                        <Building2 className="w-4 h-4 text-[#8daea3]" />
                      </div>
                      <span className="text-[11px] font-bold text-white mt-1.5 leading-none">Mumbai</span>
                      <span className="text-[9px] text-[#8daea3] mt-0.5">Origin</span>
                    </div>

                    {/* In Transit */}
                    <div className="flex flex-col items-center relative z-10">
                      <div className="w-8 h-8 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                        <Truck className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-[11px] font-bold text-white mt-1.5 leading-none">In Transit</span>
                    </div>

                    {/* Dubai Destination */}
                    <div className="flex flex-col items-center relative z-10">
                      <div className="w-8 h-8 rounded-full bg-[#08201a] border border-[#235849] flex items-center justify-center text-white shadow-md">
                        <MapPin className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-[11px] font-bold text-white mt-1.5 leading-none">Dubai</span>
                      <span className="text-[9px] text-[#8daea3] mt-0.5">Destination</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Section: Floating HUD Card on Left + 3D Shipping Container on Right */}
                <div className="relative z-10 flex items-end justify-between mt-auto pt-4">
                  {/* Floating Container HUD Glass Card */}
                  <div className="relative z-20 max-w-[205px] sm:max-w-[220px] rounded-2xl bg-[#061814]/92 backdrop-blur-md border border-[#1b483c] p-3 shadow-xl">
                    <div className="flex items-center justify-between gap-1 pb-2 border-b border-[#1b483c]/60">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded bg-[#0e3025] border border-[#215a49] flex items-center justify-center text-emerald-400">
                          <Package className="w-3 h-3" />
                        </div>
                        <span className="text-[10px] font-semibold text-white tracking-tight">Container #LS-9428</span>
                      </div>
                      <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[7.5px] font-bold tracking-wider text-emerald-400 uppercase">
                        IN TRANSIT
                      </span>
                    </div>

                    <div className="pt-2 flex items-baseline justify-between gap-2">
                      <div>
                        <div className="text-[8.5px] font-mono text-[#8daea3]">ETA</div>
                        <div className="text-base font-display font-black text-white leading-tight">2h 18m</div>
                      </div>
                      <div className="text-right border-l border-[#1b483c]/60 pl-2">
                        <div className="text-[8px] text-[#8daea3] leading-tight">
                          Departed <span className="text-white block font-medium">Oct 24, 2026</span>
                          <span className="text-[7.5px] text-[#7ca69a]">10:30 UTC</span>
                        </div>
                        <div className="text-[8px] text-[#8daea3] leading-tight mt-1">
                          Arriving <span className="text-white block font-medium">Oct 24, 2026</span>
                          <span className="text-[7.5px] text-[#7ca69a]">12:48 UTC</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3D Isometric Shipping Container + GPS Pin Beacon + Glowing Pathway */}
                  <div className="absolute -bottom-4 -right-4 sm:-bottom-2 sm:-right-2 w-[260px] sm:w-[290px] h-[210px] sm:h-[230px] pointer-events-none">
                    <svg viewBox="0 0 300 240" className="w-full h-full drop-shadow-2xl" fill="none">
                      <defs>
                        <linearGradient id="cTopGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#2c6351" />
                          <stop offset="100%" stopColor="#183f32" />
                        </linearGradient>
                        <linearGradient id="cSideGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#1d4a3b" />
                          <stop offset="100%" stopColor="#0b241c" />
                        </linearGradient>
                        <linearGradient id="cFrontGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#245746" />
                          <stop offset="100%" stopColor="#123328" />
                        </linearGradient>
                        <radialGradient id="beaconRadialGlow" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#84cc16" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="#84cc16" stopOpacity="0" />
                        </radialGradient>
                      </defs>

                      {/* Glowing Perspective Runway Road / Track */}
                      <path 
                        d="M 280 150 Q 220 180 170 200 T 40 235" 
                        stroke="#10b981" 
                        strokeWidth="3.5" 
                        strokeOpacity="0.8" 
                        strokeLinecap="round" 
                      />
                      <path 
                        d="M 280 150 Q 220 180 170 200 T 40 235" 
                        stroke="#ffffff" 
                        strokeWidth="1.2" 
                        strokeDasharray="4 4" 
                        strokeOpacity="0.75" 
                      />
                      <path 
                        d="M 295 170 Q 230 198 180 215 T 60 240" 
                        stroke="#059669" 
                        strokeWidth="2" 
                        strokeOpacity="0.4" 
                      />

                      {/* Location Pin Beacon Behind Container */}
                      <g transform="translate(195, 120)">
                        <circle cx="10" cy="10" r="20" fill="url(#beaconRadialGlow)" opacity="0.6" className="animate-pulse" />
                        <path 
                          d="M10 0 C4.48 0 0 4.48 0 10 C0 17.5 10 28 10 28 C10 28 20 17.5 20 10 C20 4.48 15.52 0 10 0 Z" 
                          fill="#84cc16" 
                        />
                        <circle cx="10" cy="9" r="4" fill="#061814" />
                        <circle cx="10" cy="9" r="2" fill="#ffffff" />
                      </g>

                      {/* Drop shadow under container */}
                      <ellipse cx="140" cy="195" rx="75" ry="18" fill="#030c0a" opacity="0.85" />

                      {/* 3D Shipping Container Body */}
                      {/* Top Face */}
                      <polygon points="120,95 205,120 145,142 60,117" fill="url(#cTopGlow)" stroke="#397e68" strokeWidth="1" />
                      <line x1="88" y1="106" x2="173" y2="131" stroke="#3d8770" strokeWidth="1" />
                      <line x1="102" y1="111" x2="187" y2="136" stroke="#3d8770" strokeWidth="1" />

                      {/* Side Face (Long side with Corrugation Grooves) */}
                      <polygon points="60,117 145,142 145,188 60,163" fill="url(#cSideGlow)" stroke="#235848" strokeWidth="1" />
                      {[72, 84, 96, 108, 120, 132].map((x, i) => (
                        <g key={i}>
                          <line x1={x} y1={120 + i * 3} x2={x} y2={166 + i * 3} stroke="#2a6d59" strokeWidth="2.5" />
                          <line x1={x + 2} y1={121 + i * 3} x2={x + 2} y2={167 + i * 3} stroke="#081813" strokeWidth="1.2" />
                        </g>
                      ))}

                      {/* Front Face (Doors with Handles & Hex Logo) */}
                      <polygon points="145,142 205,120 205,166 145,188" fill="url(#cFrontGlow)" stroke="#235848" strokeWidth="1" />
                      <line x1="175" y1="131" x2="175" y2="177" stroke="#081813" strokeWidth="2" />
                      {/* Door Lock Rods */}
                      <line x1="160" y1="136" x2="160" y2="182" stroke="#468f78" strokeWidth="1.5" />
                      <line x1="190" y1="125" x2="190" y2="171" stroke="#468f78" strokeWidth="1.5" />
                      
                      {/* LogiSync Logo on Container Front Door */}
                      <g transform="translate(169, 146) scale(0.9)">
                        <polygon points="6,0 12,3.5 12,10.5 6,14 0,10.5 0,3.5" fill="#10b981" opacity="0.9" />
                        <polygon points="6,2 10,4.5 10,9.5 6,12 2,9.5 2,4.5" fill="#092019" />
                      </g>
                    </svg>
                  </div>
                </div>
              </div>

              {/* CARD 02: AI-POWERED ROUTE OPTIMIZATION */}
              <div 
                style={getCardTransition(1)}
                className="absolute inset-0 rounded-[32px] sm:rounded-[36px] overflow-hidden shadow-2xl flex flex-col justify-between p-7 sm:p-9 will-change-transform select-none"
              >
                {/* Background Sunset Highway Photo */}
                <div 
                  className="absolute inset-0 bg-cover bg-center pointer-events-none transition-transform duration-700 hover:scale-105"
                  style={{
                    backgroundImage: 'url(/assets/route_optimization_sunset.jpg)',
                  }}
                />

                {/* Warm golden gradient overlay for text legibility */}
                <div 
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'linear-gradient(180deg, rgba(254, 215, 115, 0.96) 0%, rgba(252, 203, 85, 0.82) 28%, rgba(245, 158, 11, 0.2) 55%, rgba(10, 6, 2, 0.65) 100%)',
                  }}
                />

                {/* Top Section: Bold Editorial Headlines */}
                <div className="relative z-10">
                  <h3 className="font-display font-black text-3xl sm:text-4xl lg:text-[42px] uppercase tracking-tight leading-[0.92] text-[#140e07]">
                    <span className="block text-[#140e07]">AI-POWERED</span>
                    <span className="block text-[#b45309] drop-shadow-sm">ROUTE</span>
                    <span className="block text-[#140e07]">OPTIMIZATION</span>
                  </h3>

                  <div className="mt-3.5 space-y-0.5 text-[10px] sm:text-[11px] font-mono font-bold tracking-[0.22em] text-[#332211] uppercase">
                    <div>SMARTER ROUTES</div>
                    <div>A CLEANER TOMORROW</div>
                  </div>

                  {/* Clean Horizontal Divider */}
                  <div className="w-14 h-[2px] bg-[#332211]/35 mt-3.5" />
                </div>

                {/* Bottom Left: INTELLIGENCE IN MOTION */}
                <div className="relative z-10 mt-auto">
                  <div className="text-[9.5px] sm:text-[10px] font-mono font-bold tracking-[0.28em] text-[#241709] uppercase leading-tight">
                    <div>INTELLIGENCE</div>
                    <div>IN MOTION</div>
                  </div>
                </div>
              </div>

              {/* CARD 03: PREDICT DELAYS BEFORE THEY HAPPEN */}
              <div 
                style={getCardTransition(2)}
                className="absolute inset-0 rounded-[32px] sm:rounded-[36px] bg-[#823719] text-white p-7 sm:p-9 flex flex-col justify-start shadow-2xl overflow-hidden will-change-transform"
              >
                <h3 className="font-display font-black text-3xl sm:text-4xl lg:text-[42px] uppercase tracking-tight leading-[0.92] text-white">
                  PREDICT <br />
                  DELAYS <br />
                  BEFORE THEY <br />
                  HAPPEN
                </h3>

                {/* Enlarged 3D Parcel Box + Weather Risk Radar at Lower Right */}
                <div className="absolute -bottom-2 -right-2 sm:bottom-0 sm:right-0 w-[270px] sm:w-[320px] h-[220px] sm:h-[260px] flex items-end justify-end pointer-events-none">
                  <div className="relative w-full h-full flex items-end justify-end">
                    {/* Floating Delay Risk Glass Badge */}
                    <div className="absolute top-2 left-2 w-36 rounded-xl bg-black/55 backdrop-blur-md border border-orange-500/30 p-2 shadow-2xl">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-orange-400 text-[10px]">⚠️</span>
                        <div>
                          <div className="text-[7px] font-mono text-orange-200/70 uppercase leading-none">Risk Index</div>
                          <div className="text-[10px] font-display font-black text-orange-400">High: Port Dwell</div>
                        </div>
                      </div>
                      <div className="flex items-end gap-1 h-6 pt-1">
                        <div className="flex-1 bg-orange-400/40 rounded-t h-[30%]" />
                        <div className="flex-1 bg-orange-400/50 rounded-t h-[45%]" />
                        <div className="flex-1 bg-orange-400/60 rounded-t h-[40%]" />
                        <div className="flex-1 bg-orange-500/80 rounded-t h-[70%]" />
                        <div className="flex-1 bg-red-500 rounded-t h-[95%] shadow-[0_0_6px_rgba(239,68,68,0.7)]" />
                        <div className="flex-1 bg-orange-500/90 rounded-t h-[75%]" />
                      </div>
                    </div>

                    {/* Enlarged 3D Parcel Box SVG */}
                    <svg viewBox="0 0 160 140" className="w-[190px] sm:w-[220px] h-[170px] sm:h-[200px] drop-shadow-2xl" fill="none">
                      <ellipse cx="80" cy="120" rx="55" ry="14" fill="#361306" opacity="0.6" />
                      <polygon points="80,42 128,64 80,86 32,64" fill="#dca068" />
                      <polygon points="74,45 86,50 86,83 74,78" fill="#b0733c" />

                      <polygon points="32,64 80,86 80,126 32,104" fill="#c38248" />
                      <polygon points="74,83 80,86 80,126 74,123" fill="#9d612e" />

                      <g transform="translate(42, 85) skewY(24)">
                        <rect width="20" height="12" fill="#ffffff" rx="1" />
                        <line x1="2" y1="2" x2="2" y2="10" stroke="#000" strokeWidth="1" />
                        <line x1="5" y1="2" x2="5" y2="10" stroke="#000" strokeWidth="1.5" />
                        <line x1="8" y1="2" x2="8" y2="10" stroke="#000" strokeWidth="0.8" />
                        <line x1="11" y1="2" x2="11" y2="10" stroke="#000" strokeWidth="1.2" />
                        <line x1="15" y1="2" x2="15" y2="10" stroke="#000" strokeWidth="1" />
                      </g>

                      <polygon points="80,86 128,64 128,104 80,126" fill="#a46835" />

                      <g transform="translate(108, 88)">
                        <path d="M12 2 L22 20 L2 20 Z" fill="#ff5500" stroke="#ffffff" strokeWidth="1.5" />
                        <text x="12" y="17" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="900" fontFamily="sans-serif">!</text>
                      </g>
                    </svg>
                  </div>
                </div>
              </div>

              {/* CARD 04: INTELLIGENT LOGISTICS CONTROL */}
              <div 
                style={getCardTransition(3)}
                className="absolute inset-0 rounded-[32px] sm:rounded-[36px] bg-[#091814] text-white p-7 sm:p-9 flex flex-col justify-start shadow-2xl overflow-hidden will-change-transform"
              >
                <h3 className="font-display font-black text-3xl sm:text-4xl lg:text-[42px] uppercase tracking-tight leading-[0.92] text-white">
                  INTELLIGENT <br />
                  LOGISTICS <br />
                  CONTROL
                </h3>

                {/* Enlarged 3D Isometric Server & Command Matrix at Lower Right */}
                <div className="absolute -bottom-2 -right-2 sm:bottom-0 sm:right-0 w-[270px] sm:w-[320px] h-[220px] sm:h-[260px] flex items-end justify-end pointer-events-none">
                  <div className="relative w-full h-full flex items-end justify-end">
                    {/* Floating HUD Chip */}
                    <div className="absolute top-2 left-2 bg-[#061512]/90 backdrop-blur-md rounded-xl border border-[#1b3e34] p-2.5 shadow-2xl">
                      <div className="text-[8px] font-mono text-[#7ca69a] flex items-center gap-1.5 mb-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#a8e63d] animate-pulse" />
                        AUTONOMOUS MESH
                      </div>
                      <div className="text-sm font-display font-black text-white">41.8K <span className="text-[9px] font-normal text-[#a8e63d]">OPS/SEC</span></div>
                    </div>

                    {/* 3D Isometric Command Server & Terminal SVG */}
                    <svg viewBox="0 0 200 170" className="w-[190px] sm:w-[230px] h-[170px] sm:h-[210px] drop-shadow-2xl" fill="none">
                      <defs>
                        <linearGradient id="srvTop" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#1e4b3e" />
                          <stop offset="100%" stopColor="#0f2b23" />
                        </linearGradient>
                        <linearGradient id="srvLeft" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#13382d" />
                          <stop offset="100%" stopColor="#081813" />
                        </linearGradient>
                        <linearGradient id="srvRight" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#194235" />
                          <stop offset="100%" stopColor="#0a1f18" />
                        </linearGradient>
                      </defs>

                      <ellipse cx="100" cy="142" rx="75" ry="20" fill="#030b09" opacity="0.7" />
                      <ellipse cx="100" cy="142" rx="65" ry="16" stroke="#a8e63d" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
                      <ellipse cx="100" cy="142" rx="42" ry="10" stroke="#a8e63d" strokeWidth="1" opacity="0.7" />

                      <polygon points="100,75 155,100 100,125 45,100" fill="url(#srvTop)" stroke="#2d6a58" strokeWidth="0.8" />
                      <polygon points="45,100 100,125 100,145 45,120" fill="url(#srvLeft)" stroke="#1a3d33" strokeWidth="0.8" />
                      <polygon points="100,125 155,100 155,120 100,145" fill="url(#srvRight)" stroke="#1a3d33" strokeWidth="0.8" />

                      <circle cx="58" cy="108" r="1.5" fill="#a8e63d" />
                      <circle cx="65" cy="111" r="1.5" fill="#a8e63d" />
                      <circle cx="72" cy="114" r="1.5" fill="#00e5ff" />
                      <circle cx="112" cy="133" r="1.5" fill="#a8e63d" />
                      <circle cx="120" cy="129" r="1.5" fill="#a8e63d" />
                      <circle cx="128" cy="125" r="1.5" fill="#00e5ff" />

                      <polygon points="100,45 140,65 100,85 60,65" fill="#245849" stroke="#3a806b" strokeWidth="0.8" />
                      <polygon points="60,65 100,85 100,98 60,78" fill="#133a2f" />
                      <polygon points="100,85 140,65 140,78 100,98" fill="#184236" />

                      <line x1="100" y1="45" x2="100" y2="15" stroke="#a8e63d" strokeWidth="2" strokeLinecap="round" />
                      <circle cx="100" cy="15" r="4" fill="#a8e63d" />
                      <circle cx="100" cy="15" r="8" stroke="#a8e63d" strokeWidth="1" opacity="0.6" strokeDasharray="2 2" />
                      <circle cx="100" cy="15" r="14" stroke="#a8e63d" strokeWidth="0.8" opacity="0.3" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* CARD 05: ONE COMMAND CENTER. EVERY MOVEMENT. */}
              <div 
                style={getCardTransition(4)}
                className="absolute inset-0 rounded-[32px] sm:rounded-[36px] bg-[#f39770] text-[#1b110b] p-7 sm:p-9 flex flex-col justify-start shadow-2xl overflow-hidden will-change-transform"
              >
                <h3 className="font-display font-black text-3xl sm:text-4xl lg:text-[40px] uppercase tracking-tight leading-[0.92] text-[#1b110b]">
                  ONE <br />
                  COMMAND <br />
                  CENTER. <br />
                  EVERY MOVEMENT.
                </h3>

                {/* Enlarged 3D Stacked Containers + Connected Workflow at Lower Right */}
                <div className="absolute -bottom-2 -right-2 sm:bottom-0 sm:right-0 w-[270px] sm:w-[320px] h-[220px] sm:h-[260px] flex items-end justify-end pointer-events-none">
                  <div className="relative w-full h-full flex items-end justify-end">
                    {/* Floating Connected Workflow Status Pills */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5 bg-[#ffede6]/95 px-2.5 py-1 rounded-full shadow-md border border-white/70 text-[#1b110b]">
                        <span className="text-[10px]">🔀</span>
                        <span className="text-[8px] font-display font-black tracking-wider uppercase">PLAN</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-[#ffede6]/95 px-2.5 py-1 rounded-full shadow-md border border-white/70 text-[#1b110b]">
                        <span className="text-[10px]">🎯</span>
                        <span className="text-[8px] font-display font-black tracking-wider uppercase">TRACK</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-[#ffede6]/95 px-2.5 py-1 rounded-full shadow-md border border-white/70 text-[#1b110b]">
                        <span className="text-[10px] text-emerald-600 font-bold">✓</span>
                        <span className="text-[8px] font-display font-black tracking-wider uppercase">DELIVER</span>
                      </div>
                    </div>

                    {/* Enlarged 3D Stacked Containers SVG */}
                    <svg viewBox="0 0 140 140" className="w-[180px] sm:w-[220px] h-[180px] sm:h-[220px] drop-shadow-2xl" fill="none">
                      <ellipse cx="65" cy="115" rx="45" ry="14" fill="#6d2b0e" opacity="0.4" />
                      <polygon points="60,60 100,78 60,96 20,78" fill="#fda481" />
                      <polygon points="20,78 60,96 60,126 20,108" fill="#ea7a53" />
                      <polygon points="60,96 100,78 100,108 60,126" fill="#cf5c35" />

                      <polygon points="75,35 110,50 75,65 40,50" fill="#fed0be" />
                      <polygon points="40,50 75,65 75,90 40,75" fill="#f98d68" />
                      <polygon points="75,65 110,50 110,75 75,90" fill="#e06941" />

                      <g transform="translate(68, 8)">
                        <path d="M8 0 C3.58 0 0 3.58 0 8 C0 13 8 22 8 22 C8 22 16 13 16 8 C16 3.58 12.42 0 8 0 Z" fill="#65a30d" />
                        <circle cx="8" cy="7.5" r="3" fill="#ffffff" />
                      </g>
                    </svg>
                  </div>
                </div>
              </div>

            </div>

            {/* Scroll instruction indicator under the card */}
            <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-[#5c7c73]">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-[#e65100] animate-ping" />
                <span>SCROLL TO ADVANCE NARRATIVE</span>
              </div>
              <span>{(scrollProgress * 100).toFixed(0)}% EXPLORED</span>
            </div>

          </div>

          {/* ================================================================ */}
          {/* RIGHT: THE CENTRAL ANCHOR COMMAND CENTER DASHBOARD (7 cols)      */}
          {/* ================================================================ */}
          <div className="lg:col-span-7 h-full flex flex-col justify-center">

            <div className="relative rounded-[32px] sm:rounded-[38px] bg-[#071916] text-[#c2ebfa] border border-[#1b3e34] shadow-[0_25px_65px_rgba(7,31,28,0.3)] overflow-hidden flex flex-col h-[520px] sm:h-[560px] lg:h-[590px]">

              {/* ── DASHBOARD TOP OPERATING BAR ─────────────────────────── */}
              {activeStage === 1 ? (
                <div className="px-5 py-3 bg-[#080d14] border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    {/* Brand Logo: polygon mark + LOGISYNC */}
                    <div className="flex items-center gap-2 font-display font-black text-sm tracking-wider text-white">
                      <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#fbbf24]" fill="currentColor">
                        <polygon points="2,4 12,9 7,14 2,9" />
                        <polygon points="12,10 22,15 17,20 12,15" />
                      </svg>
                      <span>LOGISYNC</span>
                    </div>

                    {/* Nav Items */}
                    <div className="hidden sm:flex items-center gap-6 text-[11px] font-mono font-bold tracking-widest text-[#71859c]">
                      <span className="text-white hover:text-[#fbbf24] cursor-pointer transition-colors">ROUTES</span>
                      <span className="hover:text-white cursor-pointer transition-colors">FLEET</span>
                      <span className="hover:text-white cursor-pointer transition-colors">ANALYTICS</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* SYSTEM ONLINE Pill */}
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#071d17] border border-[#10b981]/30 text-[#10b981] text-[11px] font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                      <span>SYSTEM ONLINE</span>
                    </div>

                    {/* User Profile Avatar */}
                    <div className="w-7 h-7 rounded-full bg-[#141e2b] border border-white/10 flex items-center justify-center text-white/80">
                      {user?.photoURL ? (
                        <img src={user.photoURL} alt="User" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <User className="w-3.5 h-3.5 text-white/70" />
                      )}
                    </div>
                  </div>
                </div>
              ) : activeStage === 0 ? (
                <div className="px-4 py-2.5 bg-[#051612] border-b border-[#1b3e34] flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Brand Logo */}
                    <div className="flex items-center gap-1.5 font-display font-black text-sm tracking-tight text-white">
                      <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-[#ea580c] to-[#f59e0b] flex items-center justify-center text-white shadow-sm">
                        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                      </div>
                      <span>LogiSync<span className="text-[#ea580c]">PRO</span></span>
                    </div>

                    {/* Nav Tabs */}
                    <div className="hidden sm:flex items-center gap-1">
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#0e3026] text-white text-xs font-semibold border border-[#205242]">
                        <Home className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Overview</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[#7ca69a] hover:text-white text-xs transition-colors cursor-pointer">
                        <Package className="w-3.5 h-3.5" />
                        <span>Shipments</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[#7ca69a] hover:text-white text-xs transition-colors cursor-pointer">
                        <Truck className="w-3.5 h-3.5" />
                        <span>Fleet</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[#7ca69a] hover:text-white text-xs transition-colors cursor-pointer">
                        <BarChart3 className="w-3.5 h-3.5" />
                        <span>Analytics</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[#7ca69a] hover:text-white text-xs transition-colors cursor-pointer">
                        <FileText className="w-3.5 h-3.5" />
                        <span>Reports</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3">
                    {/* Search Box */}
                    <div className="relative hidden md:block">
                      <Search className="w-3 h-3 text-[#7ca69a] absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text" 
                        readOnly 
                        placeholder="Search shipments..." 
                        className="bg-[#09221b] border border-[#1b4337] rounded-full pl-7 pr-3 py-1 text-[11px] text-[#c2ebfa] placeholder-[#5d8378] w-36 lg:w-44 focus:outline-none"
                      />
                    </div>

                    {/* Notification Bell */}
                    <div className="relative p-1.5 rounded-full bg-[#09221b] border border-[#1b4337] text-[#7ca69a] hover:text-white cursor-pointer">
                      <Bell className="w-3.5 h-3.5" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ea580c] absolute top-1 right-1" />
                    </div>

                    {/* User Avatar & Profile Dropdown */}
                    {user ? (
                      <div className="relative group">
                        <button 
                          className="w-6 h-6 rounded-full overflow-hidden border border-emerald-400 cursor-pointer flex items-center justify-center bg-[#1b4539] text-white text-[10px] font-bold shadow-sm"
                          title={profileName}
                        >
                          {user.photoURL ? (
                            <img 
                              src={user.photoURL} 
                              alt={profileName} 
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            <span>{profileName[0].toUpperCase()}</span>
                          )}
                        </button>
                        <div className="hidden group-hover:block absolute right-0 mt-1.5 w-48 rounded-xl bg-[#09221b] border border-[#1b4337] shadow-2xl p-2 z-50 text-white text-xs animate-in fade-in duration-150">
                          <div className="font-bold truncate text-[11px] text-white">{profileName}</div>
                          <div className="text-[10px] text-[#7ca69a] truncate mb-1.5">{user.email}</div>
                          <button 
                            onClick={logout} 
                            className="w-full text-left px-2 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-[10px] flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <LogOut size={12} />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={onOpenLogin}
                        className="w-6 h-6 rounded-full bg-[#1b4539] hover:bg-emerald-600 border border-[#2b6555] text-white flex items-center justify-center text-[10px] font-bold cursor-pointer transition-colors"
                        title="Click to Sign In with Google"
                      >
                        V
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="px-5 py-3.5 bg-[#051412] border-b border-[#1b3e34]/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                    </div>
                    <span className="h-4 w-px bg-white/10" />
                    <span className="text-[11px] font-mono font-bold tracking-wider text-white">
                      LOGISYNC COMMAND OS v4.2
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[10px] font-mono">
                    <span className="hidden sm:inline text-[#7ca69a]">TELEMETRY FREQ: 1000HZ</span>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0a231e] border border-[#a8e63d]/30 text-[#a8e63d]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#a8e63d] animate-pulse" />
                      STATUS: OPTIMAL
                    </div>
                  </div>
                </div>
              )}

              {/* ── DYNAMIC DASHBOARD MAIN SCREEN: Transforms smoothly with scroll stage ── */}
              <div className="flex-1 relative p-3 sm:p-4 lg:p-5 flex flex-col justify-between overflow-hidden bg-gradient-to-b from-[#071916] to-[#041210]">

                {/* Background dot-matrix map canvas */}
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                  <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="cmdGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <circle cx="2" cy="2" r="1" fill="#c2ebfa" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#cmdGrid)" />
                  </svg>
                </div>

                {/* ── STATE 0: Real-Time Shipment Telemetry HUD ───────────── */}
                {activeStage === 0 && (
                  <div className="relative z-10 flex-1 flex flex-col justify-between gap-2.5 animate-in fade-in duration-300">
                    {/* Subheader: Live Shipment Overview */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2 border-b border-[#1b3e34]/60">
                      <div>
                        <h4 className="font-display font-bold text-base sm:text-lg text-white leading-tight">
                          Live Shipment Overview
                        </h4>
                        <p className="text-[11px] text-[#7ca69a]">
                          Real-time tracking across 190+ countries
                        </p>
                      </div>
                      <div className="flex items-center gap-3 self-start sm:self-auto text-[11px]">
                        <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>All systems operational</span>
                        </div>
                        <span className="text-[#5b7d72] font-mono hidden md:inline">Thu, Oct 24, 2026 14:00 UTC</span>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0c2820] border border-[#1b483c] text-white text-[11px] font-medium cursor-pointer hover:bg-[#11352a]">
                          <Globe className="w-3 h-3 text-emerald-400" />
                          <span>Global View</span>
                          <ChevronDown className="w-3 h-3 text-[#7ca69a]" />
                        </div>
                      </div>
                    </div>

                    {/* Section 1: Map (70%) + Container Card (30%) */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 h-[165px] sm:h-[180px]">
                      {/* Interactive Map View */}
                      <div className="md:col-span-8 relative rounded-2xl bg-[#051612] border border-[#1b3e34] p-2.5 overflow-hidden flex flex-col justify-between">
                        {/* SVG Map Canvas */}
                        <div className="absolute inset-0">
                          <svg viewBox="0 0 540 220" className="w-full h-full object-cover" fill="none">
                            {/* Dark Topographic Contours */}
                            <path d="M 20 190 Q 90 120 190 140 T 340 90 T 500 130" stroke="#0e2a22" strokeWidth="36" strokeLinecap="round" opacity="0.6" />
                            <path d="M 50 200 Q 130 90 230 110 T 370 70 T 530 100" stroke="#091f19" strokeWidth="26" strokeLinecap="round" opacity="0.8" />
                            <path d="M 100 30 C 130 60, 160 80, 150 110 C 140 140, 110 160, 80 200" stroke="#16382d" strokeWidth="2" strokeDasharray="3 3" opacity="0.4" />
                            <path d="M 220 30 C 250 60, 270 100, 260 140 C 250 170, 280 190, 310 210" stroke="#16382d" strokeWidth="2" opacity="0.3" />
                            <path d="M 330 20 C 360 50, 380 70, 430 80 C 480 90, 500 120, 530 150" stroke="#16382d" strokeWidth="2" strokeDasharray="4 4" opacity="0.4" />

                            {/* Glowing Trajectory Arc: Mumbai -> Dubai */}
                            <path 
                              d="M 260 145 Q 340 70 425 100" 
                              stroke="#22c55e" 
                              strokeWidth="2.5" 
                              strokeDasharray="6 4" 
                              strokeLinecap="round"
                            />
                            <path 
                              d="M 260 145 Q 340 70 425 100" 
                              stroke="#22c55e" 
                              strokeWidth="7" 
                              strokeOpacity="0.22" 
                              strokeLinecap="round" 
                            />

                            {/* In-Transit Moving Vehicle Icon along Arc */}
                            <g transform="translate(345, 96)">
                              <circle cx="0" cy="0" r="11" fill="#10b981" />
                              <circle cx="0" cy="0" r="17" fill="#10b981" opacity="0.3" className="animate-ping" />
                              <g transform="translate(-6, -6) scale(0.6)">
                                <path d="M1 3h15v13H1z" fill="none" />
                                <path d="M16 8h4l3 3v5h-7V8z" fill="#ffffff" />
                                <rect x="2" y="5" width="13" height="11" rx="1" fill="#ffffff" />
                              </g>
                            </g>

                            {/* Origin Pin: Mumbai, India */}
                            <g transform="translate(260, 145)">
                              <circle cx="0" cy="0" r="12" fill="#22c55e" opacity="0.25" className="animate-pulse" />
                              <circle cx="0" cy="0" r="5" fill="#22c55e" stroke="#061814" strokeWidth="2" />
                            </g>

                            {/* Destination Pin: Dubai, UAE */}
                            <g transform="translate(425, 100)">
                              <circle cx="0" cy="0" r="12" fill="#f59e0b" opacity="0.25" className="animate-pulse" />
                              <circle cx="0" cy="0" r="5" fill="#f59e0b" stroke="#061814" strokeWidth="2" />
                            </g>
                          </svg>
                        </div>

                        {/* Left Zoom Controls */}
                        <div className="relative z-10 flex flex-col gap-1 w-5 rounded-lg bg-[#071d17]/90 border border-[#1b4337] p-0.5 text-[#7ca69a] shadow-lg">
                          <button className="w-4 h-4 flex items-center justify-center hover:text-white transition-colors">
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                          <div className="h-px bg-[#1b4337] w-full" />
                          <button className="w-4 h-4 flex items-center justify-center hover:text-white transition-colors">
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <div className="h-px bg-[#1b4337] w-full" />
                          <button className="w-4 h-4 flex items-center justify-center hover:text-white transition-colors">
                            <Crosshair className="w-2.5 h-2.5" />
                          </button>
                        </div>

                        {/* Overlaid Location Labels */}
                        <div className="relative z-10 flex items-center justify-between pointer-events-none px-1">
                          {/* Mumbai Label */}
                          <div className="ml-20 sm:ml-32 mt-12 bg-[#061814]/85 backdrop-blur-sm px-2 py-0.5 rounded border border-[#1b483c]/60">
                            <div className="text-[10px] font-bold text-white leading-none">Mumbai</div>
                            <div className="text-[8px] text-[#7ca69a]">India</div>
                          </div>
                          {/* Dubai Label */}
                          <div className="mr-3 sm:mr-6 mb-3 bg-[#061814]/85 backdrop-blur-sm px-2 py-0.5 rounded border border-[#1b483c]/60">
                            <div className="text-[10px] font-bold text-white leading-none">Dubai</div>
                            <div className="text-[8px] text-[#7ca69a]">UAE</div>
                          </div>
                        </div>
                      </div>

                      {/* Container Inspection Sidebar Card */}
                      <div className="md:col-span-4 rounded-2xl bg-[#051612] border border-[#1b3e34] p-2.5 sm:p-3 flex flex-col justify-between">
                        <div className="flex items-center justify-between pb-1.5 border-b border-[#1b3e34]/70">
                          <span className="font-semibold text-white text-[11px] sm:text-xs">Container #LS-9428</span>
                          <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[7.5px] font-bold text-emerald-400">
                            IN TRANSIT
                          </span>
                        </div>

                        <div className="space-y-1.5 py-1 text-[10px] sm:text-[11px]">
                          <div className="flex items-start gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 mt-0.5 shrink-0" />
                            <div>
                              <div className="text-[8.5px] text-[#7ca69a] leading-none">From</div>
                              <div className="font-semibold text-white">Mumbai, India</div>
                            </div>
                          </div>

                          <div className="flex items-start gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-400 mt-0.5 shrink-0" />
                            <div>
                              <div className="text-[8.5px] text-[#7ca69a] leading-none">To</div>
                              <div className="font-semibold text-white">Dubai, UAE</div>
                            </div>
                          </div>

                          <div className="flex items-start gap-2">
                            <Clock className="w-2.5 h-2.5 text-[#7ca69a] mt-0.5 shrink-0" />
                            <div>
                              <div className="text-[8.5px] text-[#7ca69a] leading-none">ETA</div>
                              <div className="font-semibold text-white">2h 18m</div>
                            </div>
                          </div>

                          <div className="flex items-start gap-2">
                            <Package className="w-2.5 h-2.5 text-[#7ca69a] mt-0.5 shrink-0" />
                            <div>
                              <div className="text-[8.5px] text-[#7ca69a] leading-none">Goods</div>
                              <div className="font-semibold text-white">Electronics</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section 2: 4 KPI Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                      {/* Active Shipments */}
                      <div className="rounded-xl bg-[#051612] border border-[#1b3e34] p-2 sm:p-2.5 flex flex-col justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-lg bg-[#0e2c22] border border-[#1c4b3a] flex items-center justify-center text-emerald-400">
                            <Package className="w-3 h-3" />
                          </div>
                          <div className="text-[9.5px] text-[#7ca69a] font-medium leading-none">Active Shipments</div>
                        </div>
                        <div className="flex items-baseline justify-between pt-1.5">
                          <div>
                            <div className="font-display font-black text-base sm:text-lg text-white leading-tight">1,248</div>
                            <div className="text-[8.5px] font-semibold text-emerald-400 flex items-center gap-0.5">
                              <span>▲</span> +12%
                            </div>
                          </div>
                          <div className="flex items-end gap-1 h-5">
                            <div className="w-1 bg-emerald-500/40 rounded-t h-2" />
                            <div className="w-1 bg-emerald-500/60 rounded-t h-3" />
                            <div className="w-1 bg-emerald-500/50 rounded-t h-2.5" />
                            <div className="w-1 bg-emerald-500/80 rounded-t h-4" />
                            <div className="w-1 bg-emerald-400 rounded-t h-5" />
                          </div>
                        </div>
                      </div>

                      {/* On-Time Delivery */}
                      <div className="rounded-xl bg-[#051612] border border-[#1b3e34] p-2 sm:p-2.5 flex flex-col justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-lg bg-[#0e2c22] border border-[#1c4b3a] flex items-center justify-center text-emerald-400">
                            <Clock className="w-3 h-3" />
                          </div>
                          <div className="text-[9.5px] text-[#7ca69a] font-medium leading-none">On-Time Delivery</div>
                        </div>
                        <div className="flex items-baseline justify-between pt-1.5">
                          <div>
                            <div className="font-display font-black text-base sm:text-lg text-white leading-tight">96.8%</div>
                            <div className="text-[8.5px] font-semibold text-emerald-400 flex items-center gap-0.5">
                              <span>▲</span> +2.4%
                            </div>
                          </div>
                          <svg viewBox="0 0 45 20" className="w-10 h-5" fill="none">
                            <path d="M 2 16 Q 12 14 22 8 T 43 3" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        </div>
                      </div>

                      {/* In Transit */}
                      <div className="rounded-xl bg-[#051612] border border-[#1b3e34] p-2 sm:p-2.5 flex flex-col justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-lg bg-[#0e2c22] border border-[#1c4b3a] flex items-center justify-center text-emerald-400">
                            <Truck className="w-3 h-3" />
                          </div>
                          <div className="text-[9.5px] text-[#7ca69a] font-medium leading-none">In Transit</div>
                        </div>
                        <div className="flex items-baseline justify-between pt-1.5">
                          <div>
                            <div className="font-display font-black text-base sm:text-lg text-white leading-tight">342</div>
                            <div className="text-[8.5px] font-semibold text-emerald-400 flex items-center gap-0.5">
                              <span>▲</span> +8%
                            </div>
                          </div>
                          <div className="flex items-end gap-1 h-5">
                            <div className="w-1 bg-emerald-500/40 rounded-t h-1.5" />
                            <div className="w-1 bg-emerald-500/50 rounded-t h-2.5" />
                            <div className="w-1 bg-emerald-500/70 rounded-t h-3.5" />
                            <div className="w-1 bg-emerald-500/60 rounded-t h-3" />
                            <div className="w-1 bg-emerald-400 rounded-t h-4.5" />
                          </div>
                        </div>
                      </div>

                      {/* At Risk */}
                      <div className="rounded-xl bg-[#051612] border border-[#1b3e34] p-2 sm:p-2.5 flex flex-col justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-lg bg-[#261412] border border-[#48201a] flex items-center justify-center text-rose-400">
                            <AlertTriangle className="w-3 h-3" />
                          </div>
                          <div className="text-[9.5px] text-[#7ca69a] font-medium leading-none">At Risk</div>
                        </div>
                        <div className="flex items-baseline justify-between pt-1.5">
                          <div>
                            <div className="font-display font-black text-base sm:text-lg text-white leading-tight">12</div>
                            <div className="text-[8.5px] font-semibold text-rose-400 flex items-center gap-0.5">
                              <span>▼</span> -4%
                            </div>
                          </div>
                          <svg viewBox="0 0 45 20" className="w-10 h-5" fill="none">
                            <path d="M 2 5 Q 14 6 24 13 T 43 17" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Recent Shipments Table (70%) + Quick Actions (30%) */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
                      {/* Recent Shipments Table */}
                      <div className="md:col-span-8 rounded-2xl bg-[#051612] border border-[#1b3e34] p-2.5 sm:p-3 flex flex-col justify-between">
                        <div className="flex items-center justify-between pb-1.5 border-b border-[#1b3e34]/70">
                          <span className="font-semibold text-white text-xs">Recent Shipments</span>
                          <button className="text-[10px] text-[#7ca69a] hover:text-white flex items-center gap-1 transition-colors">
                            <span>View all</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="w-full pt-1 overflow-x-auto">
                          <table className="w-full text-left text-[10px]">
                            <thead>
                              <tr className="text-[#5d8378] font-mono border-b border-[#1b3e34]/50">
                                <th className="pb-1 font-normal">Container ID</th>
                                <th className="pb-1 font-normal">Route</th>
                                <th className="pb-1 font-normal">Status</th>
                                <th className="pb-1 font-normal">ETA</th>
                                <th className="pb-1 font-normal w-20">Progress</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#1b3e34]/40 font-medium">
                              <tr>
                                <td className="py-1 text-white font-mono">LS-9428</td>
                                <td className="py-1 text-[#a8c7bd]">Mumbai → Dubai</td>
                                <td className="py-1 text-emerald-400">● In Transit</td>
                                <td className="py-1 text-white font-mono">2h 18m</td>
                                <td className="py-1">
                                  <div className="w-full bg-[#0e2a22] rounded-full h-1.5 overflow-hidden">
                                    <div className="bg-emerald-400 h-full rounded-full w-[70%]" />
                                  </div>
                                </td>
                              </tr>
                              <tr>
                                <td className="py-1 text-white font-mono">LS-7710</td>
                                <td className="py-1 text-[#a8c7bd]">Singapore → Mumbai</td>
                                <td className="py-1 text-amber-400">● Delayed</td>
                                <td className="py-1 text-white font-mono">6h 32m</td>
                                <td className="py-1">
                                  <div className="w-full bg-[#0e2a22] rounded-full h-1.5 overflow-hidden">
                                    <div className="bg-amber-400 h-full rounded-full w-[45%]" />
                                  </div>
                                </td>
                              </tr>
                              <tr>
                                <td className="py-1 text-white font-mono">LS-5581</td>
                                <td className="py-1 text-[#a8c7bd]">Shanghai → Singapore</td>
                                <td className="py-1 text-emerald-400">● Delivered</td>
                                <td className="py-1 text-[#7ca69a] font-mono">Completed</td>
                                <td className="py-1">
                                  <div className="w-full bg-[#0e2a22] rounded-full h-1.5 overflow-hidden">
                                    <div className="bg-emerald-400 h-full rounded-full w-[100%]" />
                                  </div>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Quick Actions Card */}
                      <div className="md:col-span-4 rounded-2xl bg-[#051612] border border-[#1b3e34] p-2.5 sm:p-3 flex flex-col justify-between">
                        <span className="font-semibold text-white text-xs pb-1 border-b border-[#1b3e34]/70">
                          Quick Actions
                        </span>

                        <div className="space-y-1.5 pt-1.5">
                          <button className="w-full flex items-center justify-between p-1.5 sm:p-2 rounded-xl bg-[#09221b] hover:bg-[#0e2f25] border border-[#1b4337] text-left text-[10.5px] text-white transition-colors group">
                            <div className="flex items-center gap-1.5">
                              <Search className="w-3 h-3 text-[#7ca69a] group-hover:text-emerald-400" />
                              <span>Track a Shipment</span>
                            </div>
                            <ArrowRight className="w-3 h-3 text-[#7ca69a] group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
                          </button>

                          <button className="w-full flex items-center justify-between p-1.5 sm:p-2 rounded-xl bg-[#09221b] hover:bg-[#0e2f25] border border-[#1b4337] text-left text-[10.5px] text-white transition-colors group">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3 h-3 text-[#7ca69a] group-hover:text-emerald-400" />
                              <span>Schedule a Pickup</span>
                            </div>
                            <ArrowRight className="w-3 h-3 text-[#7ca69a] group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
                          </button>

                          <button className="w-full flex items-center justify-between p-1.5 sm:p-2 rounded-xl bg-[#09221b] hover:bg-[#0e2f25] border border-[#1b4337] text-left text-[10.5px] text-white transition-colors group">
                            <div className="flex items-center gap-1.5">
                              <FileText className="w-3 h-3 text-[#7ca69a] group-hover:text-emerald-400" />
                              <span>Get a Quote</span>
                            </div>
                            <ArrowRight className="w-3 h-3 text-[#7ca69a] group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STATE 1: AI Route Optimization & Multi-Modal Routing Dashboard ── */}
                {activeStage === 1 && (
                  <div className="relative z-10 flex-1 flex flex-col justify-between animate-in fade-in duration-300 gap-2.5">
                    {/* Header: Title + Real-time Dropdown */}
                    <div className="flex items-center justify-between pb-1">
                      <div>
                        <div className="text-[9.5px] font-mono tracking-widest text-[#71859c] uppercase font-bold">
                          GLOBAL LOGISTICS
                        </div>
                        <h4 className="font-display font-black text-base sm:text-xl text-white tracking-tight leading-tight">
                          AUTONOMOUS MULTIMODAL <span className="text-[#fbbf24]">ROUTING</span>
                        </h4>
                      </div>

                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#101722] border border-white/10 text-white/90 text-xs font-medium shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                        <span>Real-time</span>
                        <ChevronDown size={13} className="text-white/60 ml-0.5" />
                      </div>
                    </div>

                    {/* Globe / Route Map Visual with Floating Intermodal Bypass Card */}
                    <div className="relative flex-1 rounded-2xl bg-[#060b12] border border-white/10 overflow-hidden flex items-center justify-center min-h-[140px] sm:min-h-[170px]">
                      {/* Night Globe Graphic SVG */}
                      <svg viewBox="0 0 640 240" className="w-full h-full object-cover" fill="none">
                        <defs>
                          <radialGradient id="globeGrad" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#14283d" stopOpacity="0.8" />
                            <stop offset="65%" stopColor="#0a1420" stopOpacity="0.9" />
                            <stop offset="100%" stopColor="#04080e" stopOpacity="0" />
                          </radialGradient>
                          <linearGradient id="amberPathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#ffffff" />
                            <stop offset="40%" stopColor="#fbbf24" />
                            <stop offset="65%" stopColor="#f59e0b" />
                            <stop offset="100%" stopColor="#ffffff" />
                          </linearGradient>
                          <filter id="goldenHalo" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="6" result="blur" />
                            <feMerge>
                              <feMergeNode in="blur" />
                              <feMergeNode in="SourceGraphic" />
                            </feMerge>
                          </filter>
                        </defs>

                        {/* Globe Atmosphere Glow */}
                        <circle cx="320" cy="150" r="220" fill="url(#globeGrad)" />

                        {/* Globe Latitude Lines */}
                        <ellipse cx="320" cy="150" rx="220" ry="105" stroke="#1e3448" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
                        <ellipse cx="320" cy="150" rx="220" ry="60" stroke="#1e3448" strokeWidth="1" opacity="0.3" />
                        <ellipse cx="320" cy="150" rx="220" ry="15" stroke="#1e3448" strokeWidth="1" opacity="0.25" />

                        {/* Globe Longitude Arcs */}
                        <path d="M 320 0 C 230 40 180 100 180 150 C 180 200 230 260 320 300" stroke="#1e3448" strokeWidth="1" opacity="0.3" />
                        <path d="M 320 0 C 410 40 460 100 460 150 C 460 200 410 260 320 300" stroke="#1e3448" strokeWidth="1" opacity="0.3" />
                        <line x1="320" y1="0" x2="320" y2="300" stroke="#1e3448" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />

                        {/* Continents Night Lights (Dotted Matrix Clusters) */}
                        {/* Americas Lights */}
                        <g opacity="0.75">
                          <circle cx="160" cy="95" r="1.5" fill="#c2ebfa" />
                          <circle cx="172" cy="90" r="1.2" fill="#c2ebfa" />
                          <circle cx="150" cy="105" r="1" fill="#71859c" />
                          <circle cx="165" cy="115" r="1.4" fill="#c2ebfa" />
                          <circle cx="180" cy="110" r="1.5" fill="#fef08a" />
                          <circle cx="195" cy="125" r="1.2" fill="#c2ebfa" />
                          <circle cx="190" cy="145" r="1" fill="#71859c" />
                          <circle cx="205" cy="160" r="1.2" fill="#c2ebfa" />
                        </g>

                        {/* Europe & Africa Lights */}
                        <g opacity="0.85">
                          <circle cx="320" cy="65" r="1.5" fill="#fef08a" />
                          <circle cx="330" cy="60" r="1.8" fill="#ffffff" />
                          <circle cx="340" cy="70" r="1.5" fill="#fef08a" />
                          <circle cx="325" cy="80" r="1.3" fill="#c2ebfa" />
                          <circle cx="345" cy="85" r="1.2" fill="#c2ebfa" />
                          <circle cx="335" cy="105" r="1.2" fill="#71859c" />
                          <circle cx="350" cy="120" r="1" fill="#71859c" />
                          <circle cx="340" cy="140" r="1.2" fill="#c2ebfa" />
                        </g>

                        {/* Middle East & Asia Lights */}
                        <g opacity="0.85">
                          <circle cx="390" cy="80" r="1.8" fill="#fef08a" />
                          <circle cx="410" cy="75" r="1.5" fill="#ffffff" />
                          <circle cx="425" cy="90" r="1.3" fill="#c2ebfa" />
                          <circle cx="450" cy="85" r="1.6" fill="#fef08a" />
                          <circle cx="475" cy="95" r="1.8" fill="#ffffff" />
                          <circle cx="490" cy="105" r="1.5" fill="#c2ebfa" />
                          <circle cx="460" cy="115" r="1.4" fill="#fef08a" />
                          <circle cx="440" cy="125" r="1.2" fill="#c2ebfa" />
                        </g>

                        {/* Faint secondary route lines */}
                        <path d="M 180 110 Q 260 155 340 135 T 460 110" stroke="#ffffff" strokeWidth="1" strokeDasharray="3 3" opacity="0.18" />
                        <path d="M 340 68 Q 420 105 520 115" stroke="#ffffff" strokeWidth="1" strokeDasharray="4 4" opacity="0.22" />

                        {/* Glowing Main Golden Trajectory Line */}
                        <path 
                          d="M 180 110 Q 250 35 340 65 Q 400 55 475 95" 
                          stroke="#f59e0b" 
                          strokeWidth="8" 
                          opacity="0.3" 
                          strokeLinecap="round" 
                        />
                        <path 
                          d="M 180 110 Q 250 35 340 65 Q 400 55 475 95" 
                          stroke="url(#amberPathGrad)" 
                          strokeWidth="3.2" 
                          strokeLinecap="round" 
                        />

                        {/* Node 1: Origin (Americas) */}
                        <circle cx="180" cy="110" r="4.5" fill="#ffffff" />
                        <circle cx="180" cy="110" r="7.5" stroke="#ffffff" strokeWidth="1.2" opacity="0.5" />

                        {/* Node 2: Central Highlighted Golden Waypoint */}
                        <circle cx="340" cy="65" r="14" fill="#fbbf24" opacity="0.25" className="animate-ping" />
                        <circle cx="340" cy="65" r="8.5" fill="#f59e0b" filter="url(#goldenHalo)" />
                        <circle cx="340" cy="65" r="4.5" fill="#ffffff" />

                        {/* Node 3: Destination Node */}
                        <circle cx="475" cy="95" r="4.5" fill="#ffffff" />
                        <circle cx="475" cy="95" r="7.5" stroke="#ffffff" strokeWidth="1.2" opacity="0.5" />
                      </svg>

                      {/* Floating Intermodal Bypass Card at Top Right */}
                      <div className="absolute top-2.5 right-2.5 bg-[#0a121a]/92 backdrop-blur-md border border-white/15 rounded-2xl p-2 sm:p-2.5 shadow-2xl flex items-center justify-between gap-3 w-52 sm:w-56 z-20">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-[#08231a] border border-[#10b981]/40 flex items-center justify-center text-[#10b981] shrink-0">
                            <Train className="w-3.5 h-3.5 text-[#10b981]" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-[11px] text-white">Intermodal Bypass</span>
                              <span className="px-1.5 py-0.2 rounded-full bg-[#10b981]/20 border border-[#10b981]/40 text-[7.5px] font-bold text-[#10b981]">
                                OPTIMAL
                              </span>
                            </div>
                            <div className="text-[9.5px] text-[#71859c] font-mono">Rail + Road</div>
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-white/40" />
                      </div>
                    </div>

                    {/* Three Metric Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {/* TIME SAVED */}
                      <div className="bg-[#0b131a]/95 rounded-2xl border border-white/10 p-2.5 sm:p-3 flex items-center justify-between shadow-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#0a251c] border border-[#10b981]/30 flex items-center justify-center text-[#10b981] shrink-0">
                            <Leaf className="w-3.5 h-3.5 text-[#10b981]" />
                          </div>
                          <div>
                            <div className="text-[8.5px] font-mono tracking-widest text-[#6e8294] uppercase">TIME SAVED</div>
                            <div className="text-lg sm:text-xl font-display font-black text-[#10b981] leading-tight">37.1%</div>
                          </div>
                        </div>
                        <svg viewBox="0 0 50 22" className="w-11 h-5 text-[#10b981]" fill="none">
                          <path d="M 2 16 Q 14 18 24 10 T 48 4" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
                        </svg>
                      </div>

                      {/* COST REDUCTION */}
                      <div className="bg-[#0b131a]/95 rounded-2xl border border-white/10 p-2.5 sm:p-3 flex items-center justify-between shadow-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#131b26] border border-white/10 flex items-center justify-center text-[#94a3b8] shrink-0">
                            <Coins className="w-3.5 h-3.5 text-[#94a3b8]" />
                          </div>
                          <div>
                            <div className="text-[8.5px] font-mono tracking-widest text-[#6e8294] uppercase">COST REDUCTION</div>
                            <div className="text-lg sm:text-xl font-display font-black text-white leading-tight">$12.4K</div>
                          </div>
                        </div>
                        <svg viewBox="0 0 50 22" className="w-11 h-5 text-[#64748b]" fill="none">
                          <path d="M 2 14 Q 16 16 26 8 T 48 6" stroke="#64748b" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
                        </svg>
                      </div>

                      {/* EMISSION OFFSET */}
                      <div className="bg-[#0b131a]/95 rounded-2xl border border-white/10 p-2.5 sm:p-3 flex items-center justify-between shadow-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#0a251c] border border-[#10b981]/30 flex items-center justify-center text-[#10b981] shrink-0">
                            <Leaf className="w-3.5 h-3.5 text-[#10b981]" />
                          </div>
                          <div>
                            <div className="text-[8.5px] font-mono tracking-widest text-[#6e8294] uppercase">EMISSION OFFSET</div>
                            <div className="text-lg sm:text-xl font-display font-black text-[#10b981] leading-tight">-3.8 TONS</div>
                          </div>
                        </div>
                        <svg viewBox="0 0 50 22" className="w-11 h-5 text-[#10b981]" fill="none">
                          <path d="M 2 15 Q 12 17 24 9 T 48 5" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
                        </svg>
                      </div>
                    </div>

                    {/* Bottom Action Toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={onOpenAiAssistant}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#121924] hover:bg-[#1a2332] border border-white/10 hover:border-white/20 text-white text-[11px] font-medium cursor-pointer transition-all hover:scale-105 active:scale-95"
                        >
                          <Sparkles size={12} className="text-[#fbbf24]" />
                          <span>Ask AI</span>
                        </button>

                        <button
                          type="button"
                          onClick={onOpenPublicMap}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#121924] hover:bg-[#1a2332] border border-white/10 hover:border-white/20 text-white/90 text-[11px] font-medium cursor-pointer transition-all hover:scale-105 active:scale-95"
                        >
                          <Map size={12} className="text-white/70" />
                          <span>Map</span>
                        </button>

                        <button
                          type="button"
                          onClick={onOpenApiHub}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#121924] hover:bg-[#1a2332] border border-white/10 hover:border-white/20 text-white/90 text-[11px] font-medium cursor-pointer transition-all hover:scale-105 active:scale-95"
                        >
                          <Network size={12} className="text-white/70" />
                          <span>API Hub</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onOpenDashboard && onOpenDashboard('command-center')}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#121924] hover:bg-[#1a2332] border border-white/10 hover:border-white/20 text-white/90 text-[11px] font-medium cursor-pointer transition-all hover:scale-105 active:scale-95"
                        >
                          <LayoutGrid size={12} className="text-white/70" />
                          <span>Open Dashboard</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => onOpenDashboard && onOpenDashboard('command-center')}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#f59e0b] hover:bg-[#fbbf24] text-[#0f172a] text-[11px] font-bold font-display uppercase tracking-wider shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer ml-auto"
                      >
                        <span>Launch Live Console</span>
                        <ArrowRight size={13} className="stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                )}

                {/* ── STATE 2: Weather Risk & Port Bottleneck Radar ───────── */}
                {activeStage === 2 && (
                  <div className="relative z-10 flex-1 flex flex-col justify-between animate-in fade-in duration-300">
                    <div className="flex items-center justify-between pb-3 border-b border-[#1b3e34]">
                      <div>
                        <span className="text-[10px] font-mono text-orange-400 uppercase">EARLY WARNING RADAR</span>
                        <div className="font-display font-black text-lg text-white">PROACTIVE RISK INTERCEPTION</div>
                      </div>
                      <div className="px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 text-[10px] font-mono font-bold">
                        2 THREATS NEUTRALIZED
                      </div>
                    </div>

                    {/* Warning Alerts Interface */}
                    <div className="space-y-2.5 my-auto">
                      <div className="bg-[#241108] p-3 rounded-2xl border border-orange-500/40 flex items-start gap-3">
                        <div className="w-6 h-6 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center text-xs mt-0.5">
                          ⚠️
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-orange-200">TYPHOON PACIFIC CORRIDOR // LEVEL 4</span>
                            <span className="text-[9px] font-mono text-orange-400 font-bold">T-MINUS 36H</span>
                          </div>
                          <p className="text-[11px] text-orange-200/70 mt-0.5">
                            Automated course deflection shifted 14 vessels 210 nautical miles south. Zero cargo exposure.
                          </p>
                        </div>
                      </div>

                      <div className="bg-[#1e130a] p-3 rounded-2xl border border-amber-500/40 flex items-start gap-3">
                        <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs mt-0.5">
                          ⚓
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-amber-200">PORT ROTTERDAM BERTH DWELL SPIKE</span>
                            <span className="text-[9px] font-mono text-emerald-400 font-bold">RESOLVED VIA ANTWERP</span>
                          </div>
                          <p className="text-[11px] text-amber-200/70 mt-0.5">
                            AI pre-booked rail slot in Antwerp before dockworkers strike took effect.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Threat Mitigation Stats */}
                    <div className="grid grid-cols-3 gap-2 pt-2">
                      <div className="bg-[#0b211c] p-2 rounded-xl text-center border border-[#1b3e34]">
                        <div className="text-[9px] font-mono text-[#7ca69a]">DELAY PREVENTED</div>
                        <div className="text-base font-display font-black text-emerald-400">72.5 HRS</div>
                      </div>
                      <div className="bg-[#0b211c] p-2 rounded-xl text-center border border-[#1b3e34]">
                        <div className="text-[9px] font-mono text-[#7ca69a]">CLAIMS AVOIDED</div>
                        <div className="text-base font-display font-black text-white">$210,000</div>
                      </div>
                      <div className="bg-[#0b211c] p-2 rounded-xl text-center border border-[#1b3e34]">
                        <div className="text-[9px] font-mono text-[#7ca69a]">ON-TIME GUARANTEE</div>
                        <div className="text-base font-display font-black text-[#a8e63d]">99.82%</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STATE 3: Multi-Agent Fleet Orchestration Mesh ──────── */}
                {activeStage === 3 && (
                  <div className="relative z-10 flex-1 flex flex-col justify-between animate-in fade-in duration-300">
                    <div className="flex items-center justify-between pb-3 border-b border-[#1b3e34]">
                      <div>
                        <span className="text-[10px] font-mono text-[#a8e63d] uppercase">MULTI-AGENT DISPATCH ENGINE</span>
                        <div className="font-display font-black text-lg text-white">AUTONOMOUS ORCHESTRATION</div>
                      </div>
                      <div className="px-2.5 py-1 rounded-full bg-[#1b3e34] text-[#a8e63d] text-[10px] font-mono font-bold">
                        AGENTS ACTIVE: 32
                      </div>
                    </div>

                    {/* Real-time Agent Decision Stream */}
                    <div className="space-y-2 my-auto font-mono text-[11px]">
                      <div className="bg-[#08201a] p-2.5 rounded-xl border border-[#1b3e34] flex items-center justify-between">
                        <span className="text-white">AGENT #07 [AIR CARGO SPOT ALLOCATION]</span>
                        <span className="text-emerald-400 font-bold">+$14,200 RECOVERY</span>
                      </div>
                      <div className="bg-[#08201a] p-2.5 rounded-xl border border-[#1b3e34] flex items-center justify-between">
                        <span className="text-white">AGENT #14 [CUSTOMS PRE-CLEARANCE DUISBURG]</span>
                        <span className="text-[#a8e63d] font-bold">APPROVED // 0 SEC WAIT</span>
                      </div>
                      <div className="bg-[#08201a] p-2.5 rounded-xl border border-[#1b3e34] flex items-center justify-between">
                        <span className="text-white">AGENT #22 [LAST-MILE AUTONOMOUS FLEET SYNC]</span>
                        <span className="text-emerald-400 font-bold">98.9% CAPACITY DOCKED</span>
                      </div>
                    </div>

                    {/* Global Fleet Counters */}
                    <div className="grid grid-cols-4 gap-2 pt-2">
                      <div className="bg-[#0b211c] p-2 rounded-xl text-center border border-[#1b3e34]">
                        <div className="text-[8px] font-mono text-[#7ca69a]">MARITIME</div>
                        <div className="text-sm font-display font-black text-white">412 SHIPS</div>
                      </div>
                      <div className="bg-[#0b211c] p-2 rounded-xl text-center border border-[#1b3e34]">
                        <div className="text-[8px] font-mono text-[#7ca69a]">FREIGHT FLIGHTS</div>
                        <div className="text-sm font-display font-black text-white">188 DAILY</div>
                      </div>
                      <div className="bg-[#0b211c] p-2 rounded-xl text-center border border-[#1b3e34]">
                        <div className="text-[8px] font-mono text-[#7ca69a]">RAIL CORRIDORS</div>
                        <div className="text-sm font-display font-black text-white">1,420 MILES</div>
                      </div>
                      <div className="bg-[#0b211c] p-2 rounded-xl text-center border border-[#1b3e34]">
                        <div className="text-[8px] font-mono text-[#7ca69a]">AUTONOMY</div>
                        <div className="text-sm font-display font-black text-[#a8e63d]">LVL 4 MESH</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STATE 4: Unified Command Center. Complete Sync ─────── */}
                {activeStage === 4 && (
                  <div className="relative z-10 flex-1 flex flex-col justify-between animate-in fade-in duration-300">
                    <div className="flex items-center justify-between pb-3 border-b border-[#1b3e34]">
                      <div>
                        <span className="text-[10px] font-mono text-emerald-400 uppercase">UNIFIED PIPELINE OS</span>
                        <div className="font-display font-black text-lg text-white">END-TO-END SUPPLY CHAIN SYNC</div>
                      </div>
                      <div className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold">
                        99.98% OPERATIONAL
                      </div>
                    </div>

                    {/* 3-Step Lifecycle Pipeline */}
                    <div className="grid grid-cols-3 gap-2.5 my-auto">
                      <div className="bg-[#09221b] p-3.5 rounded-2xl border border-[#1b3e34] text-center">
                        <div className="w-7 h-7 mx-auto rounded-full bg-white/10 flex items-center justify-center text-xs mb-2">🔀</div>
                        <div className="text-[10px] font-mono text-[#a8e63d] uppercase font-bold">1. PLAN</div>
                        <div className="text-xs font-bold text-white mt-1">Autonomous Allocation</div>
                        <div className="text-[9px] font-mono text-[#7ca69a] mt-0.5">Zero Human Delay</div>
                      </div>

                      <div className="bg-[#09221b] p-3.5 rounded-2xl border border-[#1b3e34] text-center">
                        <div className="w-7 h-7 mx-auto rounded-full bg-white/10 flex items-center justify-center text-xs mb-2">🎯</div>
                        <div className="text-[10px] font-mono text-[#a8e63d] uppercase font-bold">2. TRACK</div>
                        <div className="text-xs font-bold text-white mt-1">Satellite Telemetry</div>
                        <div className="text-[9px] font-mono text-[#7ca69a] mt-0.5">Sub-Second Refresh</div>
                      </div>

                      <div className="bg-[#09221b] p-3.5 rounded-2xl border border-[#1b3e34] text-center">
                        <div className="w-7 h-7 mx-auto rounded-full bg-white/10 flex items-center justify-center text-xs mb-2 text-emerald-400">✓</div>
                        <div className="text-[10px] font-mono text-[#a8e63d] uppercase font-bold">3. DELIVER</div>
                        <div className="text-xs font-bold text-white mt-1">Smart Custody Proof</div>
                        <div className="text-[9px] font-mono text-[#7ca69a] mt-0.5">Instant Settlement</div>
                      </div>
                    </div>

                    {/* Enterprise Impact Scoreboard */}
                    <div className="grid grid-cols-3 gap-2 pt-2">
                      <div className="bg-[#0b211c] p-2.5 rounded-xl text-center border border-[#1b3e34]">
                        <div className="text-[9px] font-mono text-[#7ca69a]">RESILIENCE INDEX</div>
                        <div className="text-base font-display font-black text-emerald-400">99.8%</div>
                      </div>
                      <div className="bg-[#0b211c] p-2.5 rounded-xl text-center border border-[#1b3e34]">
                        <div className="text-[9px] font-mono text-[#7ca69a]">COST AVOIDED</div>
                        <div className="text-base font-display font-black text-white">$4.8M YTD</div>
                      </div>
                      <div className="bg-[#0b211c] p-2.5 rounded-xl text-center border border-[#1b3e34]">
                        <div className="text-[9px] font-mono text-[#7ca69a]">CARBON OFFSET</div>
                        <div className="text-base font-display font-black text-[#a8e63d]">-412 TONS</div>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* ── DASHBOARD BOTTOM ACTION BAR: REAL FUNCTIONAL TRIGGERS ── */}
              <div className="px-5 py-3 bg-[#051412] border-t border-[#1b3e34]/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-[10px] font-mono text-[#7ca69a]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-ping" />
                  <span>AI MESH: CONNECTED</span>
                  <span className="opacity-40">•</span>
                  <span>NEONDB SYNCED</span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenAiAssistant && onOpenAiAssistant('Analyze real-time bottlenecks and predict transit delays for current shipments')}
                    className="px-3 py-1.5 rounded-full bg-[#ff5500]/15 hover:bg-[#ff5500]/25 border border-[#ff5500]/40 text-[#ff7733] hover:text-white font-display font-black text-[10px] tracking-wider uppercase transition-all hover:scale-105 cursor-pointer flex items-center gap-1.5"
                  >
                    <span>✦ Ask Gemini AI</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenPublicMap && onOpenPublicMap()}
                    className="px-3 py-1.5 rounded-full bg-[#0e3328] hover:bg-[#124233] border border-[#10b981]/40 text-[#34d399] font-display font-black text-[10px] tracking-wider uppercase transition-all hover:scale-105 cursor-pointer"
                  >
                    Public Map
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenApiHub && onOpenApiHub()}
                    className="px-3 py-1.5 rounded-full bg-[#1a0f0a] hover:bg-[#2e1810] border border-[#ff5500]/40 text-[#ff7733] font-display font-black text-[10px] tracking-wider uppercase transition-all hover:scale-105 cursor-pointer"
                  >
                    API Hub
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenDashboard && onOpenDashboard('command-center')}
                    className="px-3 py-1.5 rounded-full bg-[#0d3429] hover:bg-[#124234] border border-[#1b5c47] text-white font-display font-black text-[10px] tracking-wider uppercase transition-all hover:scale-105 cursor-pointer"
                  >
                    Open Dashboard
                  </button>

                  <button
                    type="button"
                    onClick={onOpenDemo}
                    className="px-3.5 py-1.5 rounded-full bg-[#a8e63d] hover:bg-[#bcf94f] text-black font-display font-black text-[10px] tracking-wider uppercase transition-transform hover:scale-105 cursor-pointer shadow-md"
                  >
                    Launch Live Console &rarr;
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>



      </div>
    </section>
  );
}
