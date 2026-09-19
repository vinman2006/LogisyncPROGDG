import React, { useState, useEffect, useRef } from 'react';
import { ArrowUpRight, LogIn, LogOut, ChevronDown, User, Navigation, MapPin, Network, Sparkles } from 'lucide-react';
import LogiSyncLogo from './LogiSyncLogo';
import CommandMenuModal from './CommandMenuModal';
import { useAuth } from '../context/AuthContext';
import { gsap } from 'gsap';

export default function Navbar({ 
  onOpenDemo, 
  onOpenLogin, 
  onOpenOnboarding, 
  onOpenDashboard, 
  onOpenPublicMap, 
  onOpenApiHub,
  onOpenAiAssistant
}) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { user, logout, onboardingProfile } = useAuth();
  const headerRef = useRef(null);

  const profileName = onboardingProfile?.name || user?.displayName || user?.email?.split('@')[0] || 'User';

  useEffect(() => {
    // GSAP navbar entrance animation
    gsap.fromTo(headerRef.current,
      { y: -80, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', delay: 0.1 }
    );

    // Scroll handler for blur/border on scroll
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        ref={headerRef}
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 px-4 sm:px-6 lg:px-12 py-4 sm:py-5 ${
          scrolled
            ? 'bg-[#060a14]/92 backdrop-blur-xl border-b border-white/8 shadow-lg shadow-black/40 py-3.5'
            : 'bg-transparent'
        }`}
      >
        <div className="w-full flex items-center justify-between">
          {/* Left: LogiSyncPRO Brand Mark */}
          <div 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="cursor-pointer"
          >
            <LogiSyncLogo />
          </div>

          {/* Right: AI Assistant + Auth Status + Get Started CTA + Hamburger Menu Button */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Authenticated User Profile Pill */}
            {user && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs transition-all cursor-pointer shadow-sm"
                >
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={profileName} 
                      className="w-6 h-6 rounded-full object-cover border border-emerald-400"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-emerald-700 flex items-center justify-center text-white text-[10px] font-bold">
                      {profileName[0].toUpperCase()}
                    </div>
                  )}
                  <span className="max-w-[100px] truncate hidden sm:inline font-medium">
                    {profileName}
                  </span>
                  <ChevronDown size={14} className="text-white/70" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setUserDropdownOpen(false)} 
                    />
                    <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-[#09221b] border border-[#1b4337] shadow-2xl p-2.5 z-50 text-white animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-3 py-2 border-b border-[#1b4337]/70 mb-1.5">
                        <div className="font-bold text-xs truncate">{profileName}</div>
                        <div className="text-[11px] text-[#7ca69a] truncate">{user.email}</div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          if (onOpenDashboard) {
                            onOpenDashboard('command-center');
                          }
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs hover:bg-white/10 text-left transition-colors cursor-pointer text-[#c2ebfa]"
                      >
                        <User size={14} />
                        <span>Command Dashboard</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          if (onOpenAiAssistant) {
                            onOpenAiAssistant();
                          }
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs hover:bg-white/10 text-left transition-colors cursor-pointer text-[#ff7733]"
                      >
                        <Sparkles size={14} className="text-[#ff5500]" />
                        <div className="flex items-center justify-between w-full">
                          <span>Gemini AI Assistant</span>
                          <span className="text-[9px] font-mono font-bold bg-[#ff5500]/20 text-[#ff5500] border border-[#ff5500]/40 px-1.5 py-0.5 rounded-full">AI</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          if (onOpenDashboard) {
                            onOpenDashboard('package-locations');
                          }
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs hover:bg-white/10 text-left transition-colors cursor-pointer text-emerald-300"
                      >
                        <Navigation size={14} className="text-emerald-400" />
                        <div className="flex items-center justify-between w-full">
                          <span>Private Fleet Tracker</span>
                          <span className="text-[9px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-700/60 px-1.5 py-0.5 rounded-full">FLEET</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          if (onOpenPublicMap) {
                            onOpenPublicMap();
                          } else if (onOpenDashboard) {
                            onOpenDashboard('public-transit-map');
                          }
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs hover:bg-white/10 text-left transition-colors cursor-pointer text-[#10b981]"
                      >
                        <MapPin size={14} className="text-[#10b981]" />
                        <div className="flex items-center justify-between w-full">
                          <span>Public Transit Map</span>
                          <span className="text-[9px] font-mono font-bold bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40 px-1.5 py-0.5 rounded-full">PUBLIC</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          if (onOpenApiHub) {
                            onOpenApiHub();
                          } else if (onOpenDashboard) {
                            onOpenDashboard('api-hub');
                          }
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs hover:bg-white/10 text-left transition-colors cursor-pointer text-[#ff5500]"
                      >
                        <Network size={14} className="text-[#ff5500]" />
                        <div className="flex items-center justify-between w-full">
                          <span>API &amp; Interop Hub</span>
                          <span className="text-[9px] font-mono font-bold bg-[#ff5500]/20 text-[#ff5500] border border-[#ff5500]/40 px-1.5 py-0.5 rounded-full">CONNECT</span>
                        </div>
                      </button>

                      {onOpenOnboarding && (
                        <button
                          type="button"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onOpenOnboarding();
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs hover:bg-emerald-500/20 text-emerald-300 text-left transition-colors cursor-pointer"
                        >
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Workspace Setup (8 Steps)</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={async () => {
                          setUserDropdownOpen(false);
                          await logout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs hover:bg-rose-500/20 text-rose-300 text-left transition-colors cursor-pointer mt-1"
                      >
                        <LogOut size={14} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Get Started CTA - Redirects directly to authentication */}
            <button
              type="button"
              onClick={() => {
                if (user && onOpenDashboard) {
                  onOpenDashboard();
                } else if (onOpenLogin) {
                  onOpenLogin();
                }
              }}
              className="flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-full bg-white hover:bg-[#f0f4ff] text-[#0d0738] text-xs font-bold font-display uppercase tracking-wider transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md"
            >
              <span>{user ? 'Dashboard' : 'Get Started'}</span>
              <ArrowUpRight size={13} className="stroke-[2.5]" />
            </button>

            {/* Minimal 2-Bar Hamburger Menu Icon */}
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open Navigation Directory Modal"
              aria-expanded={menuOpen}
              className="w-10 h-10 rounded-full border border-white/20 hover:border-white/60 bg-[#0c052e]/90 hover:bg-[#180d54] flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 group shadow-md"
            >
              <span className="w-4 h-[2px] bg-white rounded-full transition-all group-hover:w-5" />
              <span className="w-4 h-[2px] bg-white rounded-full transition-all group-hover:w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* ── EXPANSIVE COMMAND CENTER MEGA-MENU MODAL ───────────────────────── */}
      <CommandMenuModal 
        isOpen={menuOpen} 
        onClose={() => setMenuOpen(false)} 
        onOpenDemo={onOpenDemo}
        onOpenDashboard={onOpenDashboard}
        onOpenPublicMap={onOpenPublicMap}
        onOpenApiHub={onOpenApiHub}
        onOpenOnboarding={onOpenOnboarding}
        onOpenAiAssistant={onOpenAiAssistant}
        onOpenLogin={onOpenLogin}
      />
    </>
  );
}
