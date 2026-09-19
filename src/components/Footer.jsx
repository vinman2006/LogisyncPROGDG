import React, { useState } from 'react';
import { Mail, ArrowRight, Globe, ChevronDown, X, ExternalLink, Sparkles, Check } from 'lucide-react';

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

// ─── FOOTER INFO MODAL CONTENT SPECIFICATIONS ────────────────────────────────
const FOOTER_MODAL_DATA = {
  careers: {
    title: 'Careers at LogiSyncPRO',
    badge: 'ENGINEERING & OPS',
    subtitle: 'Build the world’s most responsive multi-modal logistics platform.',
    description: 'We are hiring systems engineers, machine learning scientists, and logistics network architects across remote and regional hub locations.',
    items: [
      { title: 'Staff Distributed Systems Engineer (Rust / Elixir)', meta: 'Telemetry & Event Stream', tag: 'Remote' },
      { title: 'Logistics AI Research Scientist (Python / PyTorch)', meta: 'Predictive Neural Dispatch', tag: 'Hybrid' },
      { title: 'Senior Product Designer & Design Systems', meta: 'Design & Interaction', tag: 'Remote' },
      { title: 'Global Maritime Solutions Architect', meta: 'Carrier Integration & AIS', tag: 'Dubai / Mumbai' }
    ],
    actionText: 'Apply with Gemini AI',
    actionQuery: 'Tell me about career openings, interview stages, and how to submit an application for engineering or operations roles at LogiSyncPRO.'
  },
  blog: {
    title: 'LogiSyncPRO Engineering Blog',
    badge: 'RESEARCH & TECH',
    subtitle: 'Deep dives on distributed telemetry, neural dispatching, and zero-variance cold chains.',
    description: 'Explore our latest architecture whitepapers and engineering postmortems on global supply chain optimization.',
    items: [
      { title: 'Predictive Port Congestion Bypass with Heuristic Neural Models', meta: 'Machine Learning • 8 min read', tag: 'AI' },
      { title: 'Benchmarking NeonDB PostgreSQL for 10M Real-Time Sensor Telemetry Packets', meta: 'Database Architecture • 6 min read', tag: 'Postgres' },
      { title: 'Eliminating Maritime Demurrage with Automated Smart Bills of Lading', meta: 'Supply Chain Operations • 5 min read', tag: 'Operations' }
    ],
    actionText: 'Discuss Research with AI',
    actionQuery: 'Summarize key engineering breakthroughs and logistics innovations from the LogiSyncPRO engineering blog.'
  },
  news: {
    title: 'Press & Logistics News',
    badge: 'PLATFORM RELEASES',
    subtitle: 'Official announcements, enterprise partnerships, and network rollouts.',
    description: 'Stay updated on platform milestones, multi-modal network activations, and enterprise certifications.',
    items: [
      { title: 'LogiSyncPRO Deploys Multi-Agent Autonomous Dispatch Across Asia-Pacific', meta: 'Press Release • October 2026', tag: 'New' },
      { title: 'Intermodal Rail-to-Ocean Visibility Network Integrated with GS1 EPCIS 2.0', meta: 'Partnership • September 2026', tag: 'Network' },
      { title: 'LogiSyncPRO Achieves ISO 27001 & SOC 2 Type II Cryptographic Compliance', meta: 'Security • August 2026', tag: 'Security' }
    ],
    actionText: 'View API & Integration Hub',
    actionType: 'api-hub'
  },
  contact: {
    title: 'Enterprise Support & Sales',
    badge: '24/7 GLOBAL NOC',
    subtitle: 'Direct channels for enterprise accounts, freight forwarders, and carrier networks.',
    description: 'Our global logistics engineering and operations team is available around the clock to support enterprise deployments.',
    items: [
      { title: 'Global Enterprise Sales Desk', meta: 'enterprise@logisyncpro.com', tag: '+1 (800) 564-4796' },
      { title: '24/7 Live Telemetry Dispatch Desk', meta: 'noc@logisyncpro.com', tag: 'Direct Line' },
      { title: 'Developer & Webhook Support', meta: 'api-support@logisyncpro.com', tag: 'REST & Webhooks' }
    ],
    actionText: 'Ask Gemini Assistant',
    actionQuery: 'I would like to contact LogiSyncPRO enterprise sales and customer support for high-volume freight logistics.'
  },
  privacy: {
    title: 'Privacy & Data Governance Charter',
    badge: 'GDPR / CCPA / ISO 27701',
    subtitle: 'Cryptographic data isolation and zero third-party telemetry monetization.',
    description: 'LogiSyncPRO strictly protects your freight, cargo manifests, and fleet telemetry with enterprise role-based encryption and tamper-evident audit logs.',
    items: [
      { title: 'NeonDB Cryptographic Isolation', meta: 'Tenant data strictly segregated in private Postgres schemas', tag: 'Compliant' },
      { title: 'GPS Telemetry Anonymization', meta: 'Driver identities decoupled from public coordinate streams', tag: 'Protected' },
      { title: 'Immutable Audit Trail', meta: 'All custody handoffs recorded in append-only cryptographic event tables', tag: 'Verified' }
    ],
    actionText: 'Review Security Specifications',
    actionQuery: 'Explain LogiSyncPRO data protection policies, GDPR compliance, and encryption standards.'
  },
  terms: {
    title: 'Terms of Service & SLA',
    badge: 'ENTERPRISE SLA 99.99%',
    subtitle: 'Operational guarantees, automated demurrage mitigation, and carrier terms.',
    description: 'Our Master Services Agreement delivers clear operational standards, high API availability guarantees, and automated delay reconciliation.',
    items: [
      { title: '99.99% High Availability Guarantee', meta: 'Carrier dispatch API and tracking streams backed by service credits', tag: '99.99%' },
      { title: 'Demurrage Arbitration Protocol', meta: 'Algorithmic delay attribution across ports and customs facilities', tag: 'Guaranteed' },
      { title: 'Multi-Modal Carrier Clearing', meta: 'Standardized custody transitions governed by GS1 EPCIS 2.0 specs', tag: 'Standard' }
    ],
    actionText: 'Ask Terms Details',
    actionQuery: 'What are the Service Level Agreements and Terms of Service governing LogiSyncPRO freight transactions?'
  },
  cookies: {
    title: 'Cookie & Local Storage Policy',
    badge: 'STRICT PRIVACY',
    subtitle: 'Zero third-party trackers, zero advertising pixels.',
    description: 'We only utilize essential local storage and session cookies required for NeonDB authentication and map viewport rendering.',
    items: [
      { title: 'Session Authentication Storage', meta: 'Encrypted token storage for authorized workspace operations', tag: 'Essential' },
      { title: 'Map Viewport Preferences', meta: 'Local caching of vector map coordinates and zoom levels', tag: 'Functional' },
      { title: 'Zero Advertising Trackers', meta: 'No behavioral targeting, third-party analytics pixels, or ad networks', tag: 'Strict' }
    ],
    actionText: 'Got It, Close',
    actionType: 'close'
  },
  sitemap: {
    title: 'LogiSyncPRO Platform Directory',
    badge: 'PLATFORM SITEMAP',
    subtitle: 'Direct navigation to all application views and telemetry consoles.',
    description: 'Explore our complete command infrastructure, public maps, and developer endpoints.',
    items: [
      { title: 'Command Center Dashboard', meta: 'Live fleet telemetry, active shipments, and corridor control', tag: 'Go &rarr;', nav: 'command-center' },
      { title: 'OpenStreetMap Package Tracker', meta: 'Satellite and street-level package delivery GPS tracking', tag: 'Go &rarr;', nav: 'package-locations' },
      { title: 'Public Transit Corridors Map', meta: 'Global maritime, air, and rail corridor visualization', tag: 'Go &rarr;', nav: 'public-map' },
      { title: 'API Hub & GS1 EPCIS Specifications', meta: 'Interactive REST API testing and webhook event simulator', tag: 'Go &rarr;', nav: 'api-hub' }
    ],
    actionText: 'Open Command Center',
    actionType: 'command-center'
  }
};

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
  const [activeInfoModal, setActiveInfoModal] = useState(null);

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
                <button
                  type="button"
                  onClick={() => setActiveInfoModal('careers')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Careers
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveInfoModal('blog')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Blog
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveInfoModal('news')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  News
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveInfoModal('contact')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Contact
                </button>
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
            <button
              type="button"
              onClick={() => setActiveInfoModal('privacy')}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Privacy
            </button>
            <button
              type="button"
              onClick={() => setActiveInfoModal('terms')}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Terms
            </button>
            <button
              type="button"
              onClick={() => setActiveInfoModal('cookies')}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Cookies
            </button>
            <button
              type="button"
              onClick={() => setActiveInfoModal('sitemap')}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Sitemap
            </button>

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

      {/* ─── FOOTER INFORMATION / COMPLIANCE MODAL ───────────────────────── */}
      {activeInfoModal && FOOTER_MODAL_DATA[activeInfoModal] && (() => {
        const modal = FOOTER_MODAL_DATA[activeInfoModal];
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none">
            <div
              onClick={() => setActiveInfoModal(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer"
            />
            <div className="relative w-full max-w-xl bg-[#061424] border border-[#1e3456] rounded-3xl p-6 sm:p-8 text-slate-200 shadow-2xl z-10 animate-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff5500] animate-pulse" />
                  <span className="text-[10px] font-mono tracking-widest text-[#ff7733] font-bold uppercase">
                    {modal.badge}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveInfoModal(null)}
                  aria-label="Close modal"
                  className="w-8 h-8 rounded-full bg-[#0d2038] hover:bg-[#18365c] border border-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Title & Subtitle */}
              <div className="pt-4 pb-3">
                <h3 className="text-xl sm:text-2xl font-display font-black text-white tracking-tight">
                  {modal.title}
                </h3>
                <p className="text-xs text-[#ff7733] font-medium mt-0.5">
                  {modal.subtitle}
                </p>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {modal.description}
                </p>
              </div>

              {/* Items List */}
              <div className="space-y-2 py-3">
                {modal.items.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      if (item.nav) {
                        setActiveInfoModal(null);
                        if (item.nav === 'public-map') onOpenTransitMap?.();
                        else if (item.nav === 'api-hub') onOpenApiHub?.();
                        else onOpenDashboard?.(item.nav);
                      }
                    }}
                    className={`p-3 rounded-2xl bg-[#091b30] border border-[#1b3456]/80 flex items-center justify-between gap-3 ${
                      item.nav ? 'cursor-pointer hover:border-[#ff5500]/50 hover:bg-[#0e2744] transition-all' : ''
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">
                        {item.meta}
                      </div>
                    </div>
                    <span className="shrink-0 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-[#ff7733] font-semibold">
                      {item.tag}
                    </span>
                  </div>
                ))}
              </div>

              {/* Modal Footer Buttons */}
              <div className="pt-4 mt-2 border-t border-white/10 flex items-center justify-between gap-3">
                {modal.actionQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      const q = modal.actionQuery;
                      setActiveInfoModal(null);
                      if (onOpenAiAssistant) onOpenAiAssistant(q);
                    }}
                    className="flex-1 py-2.5 px-4 rounded-full bg-gradient-to-r from-[#ff6b00] to-[#ff5500] hover:from-[#ff7700] hover:to-[#ff4400] text-slate-950 text-xs font-bold font-display uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-[#ff5500]/20 hover:scale-[1.02]"
                  >
                    <Sparkles size={13} className="text-slate-950" />
                    <span>{modal.actionText}</span>
                  </button>
                )}

                {modal.actionType === 'api-hub' && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveInfoModal(null);
                      if (onOpenApiHub) onOpenApiHub();
                    }}
                    className="flex-1 py-2.5 px-4 rounded-full bg-[#ff5500] hover:bg-[#ff6924] text-slate-950 text-xs font-bold font-display uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
                  >
                    <span>{modal.actionText}</span>
                    <ArrowRight size={13} />
                  </button>
                )}

                {modal.actionType === 'command-center' && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveInfoModal(null);
                      if (onOpenDashboard) onOpenDashboard('command-center');
                    }}
                    className="flex-1 py-2.5 px-4 rounded-full bg-[#ff5500] hover:bg-[#ff6924] text-slate-950 text-xs font-bold font-display uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
                  >
                    <span>{modal.actionText}</span>
                    <ArrowRight size={13} />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setActiveInfoModal(null)}
                  className="py-2.5 px-5 rounded-full bg-[#0a182c] hover:bg-[#102440] border border-white/10 text-xs font-mono text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </footer>
  );
}
