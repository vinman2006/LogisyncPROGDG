import React, { useState } from 'react';
import { Mail, ArrowRight, Globe, ChevronDown } from 'lucide-react';

// ─── 3D ISOMETRIC LOGISYNC CUBE MARK ─────────────────────────────────────────
const LogiSyncCubeMark = () => (
  <div className="relative flex items-center justify-center w-9 h-9 shrink-0">
    <svg viewBox="0 0 36 36" className="w-9 h-9 drop-shadow-[0_0_10px_rgba(255,85,0,0.5)]" fill="none">
      {/* Top glowing apex beacon */}
      <circle cx="18" cy="4.5" r="2.5" fill="#ff7700" className="animate-pulse" />
      {/* Outer Hexagon */}
      <path
        d="M18 7.5L29.5 14.5V28.5L18 35.5L6.5 28.5V14.5L18 7.5Z"
        stroke="#ff5500"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      {/* Inner Isometric Triad */}
      <path
        d="M18 19.5L29.5 14.5M18 19.5L6.5 14.5M18 19.5V35.5"
        stroke="#ff5500"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      {/* Top Face Soft Glow Fill */}
      <path
        d="M18 9L27.5 14.5L18 19.5L8.5 14.5L18 9Z"
        fill="#ff5500"
        fillOpacity="0.32"
      />
      {/* Left Face */}
      <path
        d="M8.5 16.5L18 21.5V33.5L8.5 27.5V16.5Z"
        fill="#ff5500"
        fillOpacity="0.18"
      />
      {/* Right Face */}
      <path
        d="M18 21.5L27.5 16.5V27.5L18 33.5V21.5Z"
        fill="#ff5500"
        fillOpacity="0.25"
      />
    </svg>
  </div>
);

// ─── SOCIAL MEDIA SVGS (Exact Crisp Vector Icons) ────────────────────────────
const SocialIconGitHub = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
    <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
  </svg>
);

const SocialIconLinkedIn = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2m1.4 9.74V10.13H5.06v8.37h2.8z" />
  </svg>
);

const SocialIconX = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const SocialIconYouTube = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const SocialIconInstagram = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

export default function Footer({
  onOpenDashboard,
  onOpenAiAssistant,
  onOpenApiHub,
  onOpenTransitMap
}) {
  const [emailInput, setEmailInput] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('India (EN)');
  const [isRegionMenuOpen, setIsRegionMenuOpen] = useState(false);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setIsSubscribed(true);
    setTimeout(() => {
      setEmailInput('');
    }, 2000);
  };

  return (
    <footer className="relative bg-[#060b14] border-t border-[#132238] pt-16 pb-10 text-slate-400 overflow-hidden select-none font-sans">
      {/* Top subtle blue-orange ambient radiance */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gradient-to-b from-[#0066ff]/5 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 relative z-10">
        {/* ─── TOP COLUMNS GRID ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-14">
          
          {/* COLUMN 1: Brand, Tagline, Mission, Socials (Span 4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Logo Brand */}
            <div className="flex items-center gap-3">
              <LogiSyncCubeMark />
              <div className="flex items-baseline text-xl font-black tracking-tight text-white">
                <span>LogiSync</span>
                <span className="text-[#ff5500]">PRO</span>
              </div>
            </div>

            {/* Subtitle */}
            <div className="pt-2">
              <div className="text-[10.5px] font-mono tracking-[0.25em] text-slate-400 font-semibold uppercase leading-snug">
                MOVEMENT CREATES
                <br />
                OPPORTUNITY
              </div>
              <div className="w-8 h-[2.5px] bg-[#ff5500] my-3.5 rounded-full" />
              <p className="text-xs sm:text-sm text-slate-400 max-w-xs leading-relaxed">
                A unified platform for smarter, cleaner and more connected global logistics.
              </p>
            </div>

            {/* Social Links Row */}
            <div className="flex items-center gap-2.5 pt-2">
              {[
                { name: 'GitHub', icon: SocialIconGitHub, href: 'https://github.com/vinman2006/LogisyncPROGDG' },
                { name: 'LinkedIn', icon: SocialIconLinkedIn, href: 'https://linkedin.com' },
                { name: 'X', icon: SocialIconX, href: 'https://twitter.com' },
                { name: 'YouTube', icon: SocialIconYouTube, href: 'https://youtube.com' },
                { name: 'Instagram', icon: SocialIconInstagram, href: 'https://instagram.com' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.name}
                    className="w-9 h-9 rounded-xl bg-[#0b1322] border border-[#1e2c44] hover:border-[#ff5500]/50 hover:bg-[#ff5500]/10 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm"
                  >
                    <Icon />
                  </a>
                );
              })}
            </div>
          </div>

          {/* COLUMN 2: PRODUCT (Span 2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              PRODUCT
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-normal">
              <li>
                <button
                  type="button"
                  onClick={() => onOpenDashboard?.('command-center')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Command Center
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenDashboard?.('package-locations')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Fleet Management
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenDashboard?.('routes')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Route Optimization
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenApiHub?.()}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Integrations
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('pricing');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Pricing
                </button>
              </li>
            </ul>
          </div>

          {/* COLUMN 3: COMPANY (Span 2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              COMPANY
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-normal">
              <li>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('about');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  About
                </button>
              </li>
              <li>
                <a href="#careers" className="hover:text-white transition-colors">
                  Careers
                </a>
              </li>
              <li>
                <a href="#blog" className="hover:text-white transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#news" className="hover:text-white transition-colors">
                  News
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-white transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* COLUMN 4: RESOURCES (Span 2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              RESOURCES
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-normal">
              <li>
                <button
                  type="button"
                  onClick={() => onOpenApiHub?.()}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Documentation
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenApiHub?.()}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  API
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenTransitMap?.()}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Guides
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenDashboard?.('command-center')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Status
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenAiAssistant?.()}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Support
                </button>
              </li>
            </ul>
          </div>

          {/* COLUMN 5: STAY IN SYNC (Span 2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <div className="text-[10px] font-mono tracking-[0.25em] text-slate-400 font-semibold uppercase">
              STAY IN SYNC
            </div>
            <h4 className="text-base sm:text-lg font-bold text-white leading-snug">
              Get product updates
              <br />
              and logistics insights.
            </h4>

            {/* Email Pill Input */}
            <form onSubmit={handleNewsletterSubmit} className="pt-1">
              <div className="relative flex items-center bg-[#0b1322] border border-[#1e2c44] rounded-full p-1 focus-within:border-[#ff5500] focus-within:ring-1 focus-within:ring-[#ff5500] transition-all shadow-inner">
                <div className="pl-3 pr-2 text-slate-400 shrink-0">
                  <Mail size={15} />
                </div>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none pr-10"
                  required
                />
                <button
                  type="submit"
                  className="w-8 h-8 rounded-full bg-gradient-to-r from-[#ff6b00] to-[#ff5500] hover:from-[#ff7700] hover:to-[#ff4400] text-slate-950 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(255,85,0,0.4)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <ArrowRight size={14} className="text-slate-950 font-bold" />
                </button>
              </div>

              {isSubscribed ? (
                <p className="text-[11px] text-emerald-400 font-semibold mt-2 animate-in fade-in">
                  ✓ Thanks for subscribing!
                </p>
              ) : (
                <p className="text-[11px] text-slate-500 mt-2">
                  No spam. Just meaningful updates.
                </p>
              )}
            </form>
          </div>

        </div>

        {/* ─── ARTWORK & HORIZON HERO STRIP ──────────────────────────────────── */}
        <div className="relative w-full h-44 sm:h-56 md:h-64 rounded-3xl overflow-hidden my-4 border border-[#132238] shadow-2xl bg-[#040810]">
          {/* Background Logistics Image */}
          <img
            src="/assets/footer_global_logistics.jpg"
            alt="LogiSync Global Network"
            className="w-full h-full object-cover object-center opacity-85"
          />

          {/* Vignette Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#060b14] via-transparent to-[#060b14]/60 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#060b14] via-transparent to-[#060b14]/70 pointer-events-none" />

          {/* Right Tagline Overlay */}
          <div className="absolute right-8 sm:right-12 bottom-6 sm:bottom-10 flex flex-col items-start border-l border-slate-600/40 pl-4 z-20 backdrop-blur-xs py-1">
            <div className="text-[10px] sm:text-[11px] font-mono tracking-[0.25em] text-slate-300 uppercase leading-relaxed font-bold">
              A CLEANER
              <br />
              MORE CONNECTED
              <br />
              TOMORROW
            </div>
            <div className="w-8 h-[2px] bg-[#ff5500] mt-2 rounded-full shadow-[0_0_8px_#ff5500]" />
          </div>
        </div>

        {/* ─── BOTTOM SUB-FOOTER BAR ─────────────────────────────────────────── */}
        <div className="pt-6 border-t border-[#132238] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © 2026 LogiSyncPRO. All rights reserved.
          </div>

          <div className="flex flex-wrap items-center gap-5 sm:gap-6">
            <a href="#privacy" className="hover:text-slate-300 transition-colors">
              Privacy
            </a>
            <a href="#terms" className="hover:text-slate-300 transition-colors">
              Terms
            </a>
            <a href="#cookies" className="hover:text-slate-300 transition-colors">
              Cookies
            </a>
            <a href="#sitemap" className="hover:text-slate-300 transition-colors">
              Sitemap
            </a>

            {/* Region / Locale Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsRegionMenuOpen(!isRegionMenuOpen)}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0c1424] border border-[#1e293b] text-slate-300 hover:text-white text-xs transition-colors cursor-pointer"
              >
                <Globe size={14} className="text-slate-400" />
                <span>{selectedRegion}</span>
                <ChevronDown size={12} className="text-slate-400" />
              </button>

              {isRegionMenuOpen && (
                <div className="absolute bottom-full right-0 mb-2 w-44 bg-[#0d1628] border border-[#1e293b] rounded-2xl shadow-2xl p-1.5 z-40 text-xs animate-in fade-in zoom-in-95">
                  {['India (EN)', 'United States (EN)', 'European Union (EN)', 'Global (EN)'].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => {
                        setSelectedRegion(r);
                        setIsRegionMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                        selectedRegion === r
                          ? 'bg-[#ff5500]/20 text-[#ff7733] font-bold'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
