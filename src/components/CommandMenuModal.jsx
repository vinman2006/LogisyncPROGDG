import React, { useEffect } from 'react';
import { X, ArrowRight, ArrowUpRight, Globe, Sparkles, Navigation, MapPin, Network, GitBranch, Cpu, ShieldCheck } from 'lucide-react';
import LogiSyncLogo from './LogiSyncLogo';

export default function CommandMenuModal({ 
  isOpen, 
  onClose, 
  onOpenDemo,
  onOpenDashboard,
  onOpenPublicMap,
  onOpenApiHub,
  onOpenOnboarding,
  onOpenAiAssistant,
  onOpenLogin
}) {
  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const navigateTo = (actionFn, ...args) => {
    onClose();
    if (actionFn) {
      actionFn(...args);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 lg:p-10 overflow-y-auto">
      {/* Dimmed Blurred Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity animate-in fade-in duration-200 cursor-pointer"
      />

      {/* Main Rounded Modal Container */}
      <div 
        className="relative z-10 w-full max-w-[1440px] bg-[#f5f6e8] text-[#112520] rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 lg:p-10 shadow-[0_30px_90px_rgba(0,0,0,0.45)] border border-black/10 overflow-hidden animate-in zoom-in-95 duration-200 select-none my-auto"
      >
        {/* ── 1. MODAL TOP HEADER BAR ────────────────────────────────────── */}
        <div className="flex items-center justify-between pb-6 sm:pb-8 border-b border-black/10">
          {/* Brand Mark */}
          <div onClick={onClose} className="cursor-pointer">
            <LogiSyncLogo />
          </div>

          {/* Center Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-7 text-xs sm:text-sm font-bold text-[#253934]">
            <button 
              type="button"
              onClick={() => navigateTo(onOpenDashboard, 'command-center')} 
              className="hover:text-[#10b981] transition-colors cursor-pointer"
            >
              Command Center
            </button>
            <button 
              type="button"
              onClick={() => navigateTo(onOpenApiHub)} 
              className="hover:text-[#ff5500] transition-colors cursor-pointer flex items-center gap-1"
            >
              <Network size={14} className="text-[#ff5500]" />
              <span>API Hub</span>
            </button>
            <button 
              type="button"
              onClick={() => navigateTo(onOpenPublicMap)} 
              className="hover:text-[#10b981] transition-colors cursor-pointer flex items-center gap-1"
            >
              <MapPin size={14} className="text-[#10b981]" />
              <span>Public Map</span>
            </button>
            <button 
              type="button"
              onClick={() => navigateTo(onOpenAiAssistant)} 
              className="hover:text-[#ff5500] transition-colors cursor-pointer flex items-center gap-1 text-[#ff5500]"
            >
              <Sparkles size={14} />
              <span>AI Assistant</span>
            </button>
            <button 
              type="button"
              onClick={() => navigateTo(onOpenDemo)} 
              className="hover:text-black transition-colors cursor-pointer"
            >
              Simulation Console
            </button>
          </nav>

          {/* Right: Language Selector & Circular Close Button */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#253934] px-3 py-1.5 rounded-full hover:bg-black/5 cursor-pointer transition-colors">
              <Globe size={15} />
              <span>Global Mesh (EN)</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className="w-10 h-10 rounded-full bg-black/5 hover:bg-black/10 active:scale-95 flex items-center justify-center text-[#112520] transition-all cursor-pointer"
            >
              <X size={20} className="stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* ── 2. MAIN 3-COLUMN LAYOUT ───────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 pt-6 sm:pt-8 items-stretch">

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* COLUMN 1: Command Center Dark Showcase Card (4 cols)            */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-4 rounded-[28px] sm:rounded-[32px] bg-[#0d221c] text-white p-6 sm:p-7 flex flex-col justify-between shadow-xl">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-[#7ca69a] uppercase block mb-1 font-bold">
                REAL-TIME INTELLIGENCE
              </span>
              <h3 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight leading-[0.92] text-white mb-2">
                COMMAND <br />
                CENTER
              </h3>
              <p className="text-xs text-[#8cb6a7] leading-relaxed mb-5">
                Control every shipment, audit events, and carrier assignment in real time from one unified console.
              </p>

              {/* Embedded Operating App Dashboard Mockup */}
              <div className="rounded-2xl bg-[#071916] border border-[#1b3e34] overflow-hidden shadow-2xl p-3.5">
                {/* Mock Window Bar */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#1b3e34]/70">
                  <div className="flex items-center gap-1.5 text-[9px] font-mono text-white font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff5500]" />
                    <span>LogiSyncPRO Control</span>
                  </div>
                  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#0e2a22] border border-[#a8e63d]/30 text-[8px] font-mono text-[#a8e63d]">
                    <span className="w-1 h-1 rounded-full bg-[#a8e63d] animate-ping" />
                    NeonDB Live
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-2">
                  {/* Left Mini Sidebar */}
                  <div className="col-span-4 space-y-1 text-[8px] font-mono text-[#7ca69a]">
                    <div className="bg-[#12392f] text-white px-2 py-1 rounded-md font-bold flex items-center gap-1">
                      <span>●</span> Overview
                    </div>
                    <div className="px-2 py-0.5">Shipments</div>
                    <div className="px-2 py-0.5">Fleet Map</div>
                    <div className="px-2 py-0.5">Public Transit</div>
                    <div className="px-2 py-0.5">API Hub</div>
                    <div className="px-2 py-0.5">Audit Events</div>
                  </div>

                  {/* Right Map & Telemetry Details */}
                  <div className="col-span-8 flex flex-col justify-between">
                    <div className="h-16 bg-[#09201a] rounded-lg relative overflow-hidden flex items-center justify-center mb-2">
                      <svg className="w-full h-full" viewBox="0 0 160 60" fill="none">
                        <path d="M 20 45 Q 70 15 140 30" stroke="#a8e63d" strokeWidth="1.5" strokeDasharray="3 2" />
                        <circle cx="20" cy="45" r="3" fill="#a8e63d" />
                        <circle cx="140" cy="30" r="3" fill="#38bdf8" />
                      </svg>
                      <div className="absolute bottom-1 left-2 text-[7px] font-mono text-[#a8e63d]">
                        #LS7843 IN TRANSIT // NAGPUR → MUMBAI
                      </div>
                    </div>

                    {/* 4 Stats Grid */}
                    <div className="grid grid-cols-4 gap-1 text-center bg-[#09201a] p-1.5 rounded-lg border border-[#1b3e34]">
                      <div>
                        <div className="text-[10px] font-display font-black text-white">248</div>
                        <div className="text-[6px] font-mono text-[#7ca69a]">Active</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-display font-black text-amber-400">36</div>
                        <div className="text-[6px] font-mono text-[#7ca69a]">Delayed</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-display font-black text-emerald-400">1,892</div>
                        <div className="text-[6px] font-mono text-[#7ca69a]">Delivered</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-display font-black text-white">99.8%</div>
                        <div className="text-[6px] font-mono text-[#7ca69a]">On Time</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Action: Real Open Dashboard Button */}
            <button
              type="button"
              onClick={() => navigateTo(onOpenDashboard, 'command-center')}
              className="mt-5 w-full py-3.5 rounded-2xl bg-[#dcf6a8] hover:bg-[#cef092] text-black font-extrabold text-xs tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-md"
            >
              <span>OPEN COMMAND CENTER</span>
              <ArrowRight size={16} className="stroke-[3]" />
            </button>
          </div>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* COLUMN 2: 4 Horizontal Interactive Feature Cards (5 cols)       */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-3.5 sm:gap-4">

            {/* CARD 01: TRACK */}
            <div 
              onClick={() => navigateTo(onOpenDashboard, 'package-locations')}
              className="group rounded-2xl sm:rounded-3xl bg-[#dcf6c8] hover:bg-[#d2f3bc] p-4 sm:p-5 flex items-center justify-between transition-all hover:scale-[1.01] hover:shadow-lg cursor-pointer"
            >
              <div className="max-w-[65%]">
                <span className="text-[10px] font-mono font-bold text-[#45634d] block">01 // LIVE MESH</span>
                <h4 className="font-display font-black text-lg sm:text-xl uppercase tracking-tight text-[#112520] leading-none my-1">
                  TRACK FLEET
                </h4>
                <div className="text-xs font-bold text-[#1a382e]">Private Fleet GPS Tracker</div>
                <div className="text-[11px] text-[#4b6652]">Plot coordinates and routes on OpenStreetMap.</div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#1a382e] flex items-center justify-center text-[#a8e63d] shadow-md">
                  <Navigation size={22} />
                </div>
                <div className="w-9 h-9 rounded-full bg-white/70 group-hover:bg-white flex items-center justify-center text-black transition-colors shadow-sm">
                  <ArrowRight size={15} className="stroke-[2.5]" />
                </div>
              </div>
            </div>

            {/* CARD 02: OPTIMIZE */}
            <div 
              onClick={() => navigateTo(onOpenDemo)}
              className="group rounded-2xl sm:rounded-3xl bg-[#fedb88] hover:bg-[#fed376] p-4 sm:p-5 flex items-center justify-between transition-all hover:scale-[1.01] hover:shadow-lg cursor-pointer"
            >
              <div className="max-w-[65%]">
                <span className="text-[10px] font-mono font-bold text-[#5e4522] block">02 // DISPATCH</span>
                <h4 className="font-display font-black text-lg sm:text-xl uppercase tracking-tight text-[#17120a] leading-none my-1">
                  OPTIMIZE
                </h4>
                <div className="text-xs font-bold text-[#2e200c]">Autonomous Dispatch Console</div>
                <div className="text-[11px] text-[#5e4522]">Simulate neural rerouting across global corridors.</div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#2e200c] flex items-center justify-center text-[#ff7700] shadow-md">
                  <Cpu size={22} />
                </div>
                <div className="w-9 h-9 rounded-full bg-white/70 group-hover:bg-white flex items-center justify-center text-black transition-colors shadow-sm">
                  <ArrowRight size={15} className="stroke-[2.5]" />
                </div>
              </div>
            </div>

            {/* CARD 03: PREDICT WITH AI */}
            <div 
              onClick={() => navigateTo(onOpenAiAssistant, 'Predict delivery bottlenecks and evaluate cold-chain risk for active transit')}
              className="group rounded-2xl sm:rounded-3xl bg-[#fbc3b1] hover:bg-[#f7b6a2] p-4 sm:p-5 flex items-center justify-between transition-all hover:scale-[1.01] hover:shadow-lg cursor-pointer"
            >
              <div className="max-w-[65%]">
                <span className="text-[10px] font-mono font-bold text-[#633a2e] block">03 // GEMINI AI</span>
                <h4 className="font-display font-black text-lg sm:text-xl uppercase tracking-tight text-[#112520] leading-none my-1 flex items-center gap-1.5">
                  <span>PREDICT</span>
                  <Sparkles size={16} className="text-[#ff5500]" />
                </h4>
                <div className="text-xs font-bold text-[#2e150e]">Gemini Logistics AI Assistant</div>
                <div className="text-[11px] text-[#633a2e]">Ask AI to diagnose delays, cold-chain &amp; routes.</div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#2e150e] flex items-center justify-center text-[#ff5500] shadow-md">
                  <Sparkles size={22} className="animate-pulse" />
                </div>
                <div className="w-9 h-9 rounded-full bg-white/70 group-hover:bg-white flex items-center justify-center text-black transition-colors shadow-sm">
                  <ArrowRight size={15} className="stroke-[2.5]" />
                </div>
              </div>
            </div>

            {/* CARD 04: CONNECT / API HUB */}
            <div 
              onClick={() => navigateTo(onOpenApiHub)}
              className="group rounded-2xl sm:rounded-3xl bg-[#d5eef7] hover:bg-[#c3e7f3] p-4 sm:p-5 flex items-center justify-between transition-all hover:scale-[1.01] hover:shadow-lg cursor-pointer"
            >
              <div className="max-w-[65%]">
                <span className="text-[10px] font-mono font-bold text-[#204a57] block">04 // INTEROP</span>
                <h4 className="font-display font-black text-lg sm:text-xl uppercase tracking-tight text-[#112520] leading-none my-1">
                  API HUB
                </h4>
                <div className="text-xs font-bold text-[#143c49]">ERP, TMS &amp; GS1 EPCIS 2.0</div>
                <div className="text-[11px] text-[#295a6b]">Connect Pharmacy, WMS, EDI &amp; normalize data.</div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#143c49] flex items-center justify-center text-[#38bdf8] shadow-md">
                  <Network size={22} />
                </div>
                <div className="w-9 h-9 rounded-full bg-white/70 group-hover:bg-white flex items-center justify-center text-black transition-colors shadow-sm">
                  <ArrowRight size={15} className="stroke-[2.5]" />
                </div>
              </div>
            </div>

          </div>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* COLUMN 3: Navigation Directory Links (3 cols)                  */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-3 flex flex-col justify-between py-2 sm:py-3 pl-0 lg:pl-4 space-y-6">

            {/* CORE MODULES Links */}
            <div>
              <span className="text-[10px] font-mono tracking-widest text-[#718b82] uppercase block mb-3 font-bold">
                CORE MODULES
              </span>
              <ul className="space-y-2 text-sm sm:text-base font-bold text-[#112520]">
                <li>
                  <button 
                    type="button"
                    onClick={() => navigateTo(onOpenDashboard, 'command-center')}
                    className="hover:text-[#10b981] transition-colors cursor-pointer text-left block"
                  >
                    Command Center Dashboard
                  </button>
                </li>
                <li>
                  <button 
                    type="button"
                    onClick={() => navigateTo(onOpenApiHub)}
                    className="hover:text-[#ff5500] transition-colors cursor-pointer text-left block"
                  >
                    API &amp; Interop Hub (EPCIS 2.0)
                  </button>
                </li>
                <li>
                  <button 
                    type="button"
                    onClick={() => navigateTo(onOpenPublicMap)}
                    className="hover:text-[#10b981] transition-colors cursor-pointer text-left block"
                  >
                    Public Transit Map (Bus/Train/Metro)
                  </button>
                </li>
                <li>
                  <button 
                    type="button"
                    onClick={() => navigateTo(onOpenDashboard, 'transport-system')}
                    className="hover:text-[#10b981] transition-colors cursor-pointer text-left block"
                  >
                    Transport System Workflow
                  </button>
                </li>
                <li>
                  <button 
                    type="button"
                    onClick={() => navigateTo(onOpenAiAssistant)}
                    className="hover:text-[#ff5500] transition-colors cursor-pointer text-left flex items-center gap-1.5 text-[#ff5500]"
                  >
                    <Sparkles size={13} />
                    <span>Gemini AI Assistant</span>
                  </button>
                </li>
              </ul>
            </div>

            <div className="h-px bg-black/10 w-full" />

            {/* REPOSITORIES & WORKSPACE */}
            <div>
              <span className="text-[10px] font-mono tracking-widest text-[#718b82] uppercase block mb-3 font-bold">
                PLATFORM ACCESS
              </span>
              <ul className="space-y-2 text-sm sm:text-base font-bold text-[#112520]">
                <li>
                  <button 
                    type="button"
                    onClick={() => navigateTo(onOpenOnboarding)}
                    className="hover:text-[#10b981] transition-colors cursor-pointer text-left block"
                  >
                    8-Step Workspace Onboarding
                  </button>
                </li>
                <li>
                  <button 
                    type="button"
                    onClick={() => navigateTo(onOpenDemo)}
                    className="hover:text-[#ff5500] transition-colors cursor-pointer text-left block"
                  >
                    Autonomous Dispatch Simulator
                  </button>
                </li>
                <li>
                  <button 
                    type="button"
                    onClick={() => navigateTo(onOpenDashboard, 'package-locations')}
                    className="hover:text-[#10b981] transition-colors cursor-pointer text-left block"
                  >
                    Private Fleet GPS Telemetry
                  </button>
                </li>
                <li>
                  <button 
                    type="button"
                    onClick={() => navigateTo(onOpenDashboard, 'analytics')}
                    className="hover:text-[#10b981] transition-colors cursor-pointer text-left block"
                  >
                    NeonDB Postgres Analytics
                  </button>
                </li>
              </ul>
            </div>

            <div className="h-px bg-black/10 w-full" />

            {/* SUPPORT & ASSIST */}
            <div>
              <span className="text-[10px] font-mono tracking-widest text-[#718b82] uppercase block mb-3 font-bold">
                INTELLIGENCE SUPPORT
              </span>
              <ul className="space-y-2 text-sm sm:text-base font-bold text-[#112520]">
                <li>
                  <button 
                    type="button"
                    onClick={() => navigateTo(onOpenAiAssistant, 'Explain the cold-chain handling rules for temperature-sensitive biologics')}
                    className="hover:text-[#10b981] transition-colors cursor-pointer text-left block"
                  >
                    Cold-Chain Compliance Rules
                  </button>
                </li>
                <li>
                  <button 
                    type="button"
                    onClick={() => navigateTo(onOpenAiAssistant, 'How do I submit transport requests and view audit events in LogiSyncPRO?')}
                    className="hover:text-[#ff5500] transition-colors cursor-pointer text-left block"
                  >
                    AI System Tour &amp; Help
                  </button>
                </li>
              </ul>
            </div>

          </div>

        </div>

        {/* ── 3. MODAL BOTTOM CALLOUT BAR ────────────────────────────────── */}
        <div className="border-t border-black/10 pt-6 sm:pt-8 mt-6 sm:mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-display font-black text-xl sm:text-2xl text-[#112520] tracking-tight">
              Ready to move smarter with LogiSyncPRO?
            </h4>
            <p className="text-xs sm:text-sm text-[#5c7c73] mt-0.5">
              Live NeonDB synchronization • Gemini AI Assistant • Multimodal routing mesh.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigateTo(onOpenAiAssistant)}
              className="px-5 py-3 rounded-full bg-[#ff5500] hover:bg-[#ff6924] text-black font-bold text-xs tracking-wider uppercase flex items-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <Sparkles size={14} />
              <span>Ask Gemini AI</span>
            </button>

            <button
              type="button"
              onClick={() => navigateTo(onOpenDashboard, 'command-center')}
              className="px-7 sm:px-8 py-3.5 rounded-full bg-[#0a231e] hover:bg-[#123932] active:scale-95 text-white font-bold text-xs tracking-wider uppercase flex items-center gap-2 transition-all shadow-lg hover:shadow-xl cursor-pointer"
            >
              <span>LAUNCH DASHBOARD</span>
              <ArrowRight size={15} className="stroke-[3]" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
