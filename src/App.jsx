import React, { useState } from 'react';
import Navbar from './components/Navbar';
import HeroShipmentStream from './components/HeroShipmentStream';
import FeatureGridSection from './components/FeatureGridSection';
import IntelligenceDrawer from './components/IntelligenceDrawer';
import DemoModal from './components/DemoModal';
import LogiSyncLogo from './components/LogiSyncLogo';
import LoginPage from './components/LoginPage';
import OnboardingWizard from './components/OnboardingWizard';
import CommandCenterDashboard from './components/CommandCenterDashboard';
import PublicTransitMap from './components/PublicTransitMap';
import ApiHubDashboard from './components/ApiHubDashboard';
import LogiSyncAiAssistant from './components/LogiSyncAiAssistant';
import FloatingAiWidget from './components/FloatingAiWidget';
import { AuthProvider, useAuth } from './context/AuthContext';
import { checkUserExistsInNeon } from './services/neonService';
import SmoothScrollProvider from './components/SmoothScrollProvider';
import ThreeJsBackground from './components/ThreeJsBackground';
import { AnimatedSection, AnimatedCounter, MagneticButton, FloatingOrb, PulseRing } from './components/AnimatedComponents';

function AppContent() {
  const { user, onboardingProfile } = useAuth();
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'login' | 'onboarding' | 'dashboard' | 'public-map' | 'api-hub'
  const [dashboardTab, setDashboardTab] = useState('command-center');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [aiInitialQuery, setAiInitialQuery] = useState('');

  const handleOpenDrawer = () => setIsDrawerOpen(true);
  const handleOpenDemo = () => setIsDemoOpen(true);

  const handleOpenAiAssistant = (query = '') => {
    setAiInitialQuery(query || '');
    setIsAiAssistantOpen(true);
  };

  const handleOpenOnboarding = () => {
    setCurrentView('onboarding');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenDashboard = (tab = 'command-center') => {
    setDashboardTab(tab);
    setCurrentView('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenLogin = async () => {
    if (user) {
      // Check if user has an existing NeonDB profile
      const neonCheck = await checkUserExistsInNeon(user.uid);
      if (neonCheck.exists && neonCheck.user) {
        // Returning user with NeonDB profile -> directly navigate to command center
        setCurrentView('dashboard');
      } else {
        // First-time user without NeonDB profile -> open welcoming onboarding
        setCurrentView('onboarding');
      }
    } else {
      setCurrentView('login');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = async (authenticatedUser) => {
    const uidToCheck = authenticatedUser?.uid || user?.uid;
    if (uidToCheck) {
      try {
        const neonCheck = await checkUserExistsInNeon(uidToCheck);
        if (neonCheck.exists && neonCheck.user) {
          // Returning user: profile exists in NeonDB -> direct to Command Center
          setCurrentView('dashboard');
          return;
        }
      } catch (err) {
        console.warn('[App] Error during post-login NeonDB lookup:', err);
      }
    }

    // First-time user detected: launch welcoming onboarding experience
    setCurrentView('onboarding');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOnboardingComplete = () => {
    // Once saved to NeonDB, open LogiSyncPRO Command Center
    setCurrentView('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If user opens login view, render the dedicated LogiSyncPRO Google Login Page
  if (currentView === 'login') {
    return (
      <div className="page-in">
        <LoginPage 
          onBackToLanding={() => setCurrentView('landing')} 
          onLoginSuccess={handleLoginSuccess} 
        />
      </div>
    );
  }

  // If user is completing onboarding, render the 8-step wizard
  if (currentView === 'onboarding') {
    return (
      <div className="page-in">
        <OnboardingWizard
          onComplete={handleOnboardingComplete}
          onExit={() => setCurrentView('landing')}
        />
      </div>
    );
  }

  // If user opens Command Center Dashboard
  if (currentView === 'dashboard') {
    return (
      <div className="page-in">
        <CommandCenterDashboard
          initialTab={dashboardTab}
          onExitToLanding={() => setCurrentView('landing')}
          onOpenOnboarding={handleOpenOnboarding}
          onOpenAiAssistant={() => handleOpenAiAssistant()}
        />
      </div>
    );
  }

  // If user opens standalone Public Transit Map
  if (currentView === 'public-map') {
    return (
      <div className="page-in">
        <PublicTransitMap
          onExitToLanding={() => setCurrentView('landing')}
          onBack={() => setCurrentView('landing')}
        />
      </div>
    );
  }

  // If user opens standalone API & Interoperability Hub
  if (currentView === 'api-hub') {
    return (
      <div className="page-in">
        <ApiHubDashboard
          onExitToLanding={() => setCurrentView('landing')}
          onBack={() => setCurrentView('landing')}
        />
      </div>
    );
  }


  return (
    <SmoothScrollProvider>
    <div className="relative bg-[#0a0d1a] text-[#c7d5fd] selection:bg-[#ff5500] selection:text-black min-h-screen noise-overlay">

      {/* ─── Floating ambient orbs for background depth ───────────────────── */}
      <FloatingOrb size={700} color="#10b981" x="15%" y="20%" speed={10} opacity={0.07} />
      <FloatingOrb size={500} color="#6366f1" x="75%" y="10%" speed={13} opacity={0.06} />
      <FloatingOrb size={600} color="#ff5500" x="90%" y="60%" speed={9} opacity={0.05} />
      <FloatingOrb size={450} color="#06b6d4" x="5%" y="75%" speed={12} opacity={0.06} />

      {/* ─── FIXED NAVBAR ─────────────────────────────────────────────────── */}
      <Navbar 
        onOpenDrawer={handleOpenDrawer} 
        onOpenDemo={handleOpenDemo} 
        onOpenLogin={handleOpenLogin}
        onOpenOnboarding={handleOpenOnboarding}
        onOpenDashboard={handleOpenDashboard}
        onOpenAiAssistant={() => handleOpenAiAssistant()}
        onOpenPublicMap={() => {
          setCurrentView('public-map');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenApiHub={() => {
          setCurrentView('api-hub');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* ─── HERO SECTION with Three.js particle background ───────────────── */}
      <div className="relative overflow-hidden">
        <ThreeJsBackground />
        <HeroShipmentStream 
          onOpenDashboard={handleOpenDashboard}
          onOpenAiAssistant={() => handleOpenAiAssistant()}
          onOpenPublicMap={() => {
            setCurrentView('public-map');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenApiHub={() => {
            setCurrentView('api-hub');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenOnboarding={handleOpenOnboarding}
          onOpenDemo={handleOpenDemo}
        />
      </div>

      {/* ─── LIVE PLATFORM CAPABILITIES & FEATURES TICKER BAR ─────────────── */}
      <div className="relative z-10 border-y border-white/10 bg-[#060a14]/85 backdrop-blur-md overflow-hidden select-none">
        <div className="flex items-center gap-0 marquee-track py-3.5">
          {[...Array(2)].map((_, outer) => (
            <div key={outer} className="flex items-center gap-0 flex-shrink-0">
              {[
                {
                  tag: 'AUTONOMOUS AI',
                  title: 'Gemini Dispatch Assistant',
                  color: '#ff5500',
                  icon: '✦',
                  action: () => handleOpenAiAssistant(),
                },
                {
                  tag: 'CLOUD LEDGER',
                  title: 'NeonDB PostgreSQL Live Sync',
                  color: '#00e599',
                  icon: '◈',
                  action: () => handleOpenDashboard('overview'),
                },
                {
                  tag: 'LIVE TELEMETRY',
                  title: 'OpenStreetMap GPS Tracking',
                  color: '#06b6d4',
                  icon: '◉',
                  action: () => {
                    setCurrentView('public-map');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  },
                },
                {
                  tag: 'INTEROPERABILITY',
                  title: 'GS1 EPCIS 2.0 & REST API Hub',
                  color: '#a78bfa',
                  icon: '⚡',
                  action: () => {
                    setCurrentView('api-hub');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  },
                },
                {
                  tag: 'COLD CHAIN',
                  title: 'Pharma IoT Sensor Telemetry',
                  color: '#38bdf8',
                  icon: '❄',
                  action: () => handleOpenDashboard('cold-chain'),
                },
                {
                  tag: 'NATIVE MOBILE',
                  title: 'Android Jetpack Compose APK',
                  color: '#10b981',
                  icon: '📱',
                  action: () => handleOpenDemo(),
                },
                {
                  tag: 'VERIFICATION',
                  title: 'Cryptographic Audit Trail',
                  color: '#f59e0b',
                  icon: '🛡',
                  action: () => handleOpenDashboard('audit'),
                },
                {
                  tag: 'MULTI-MODAL',
                  title: 'Autonomous Freight Matching',
                  color: '#ec4899',
                  icon: '⇄',
                  action: () => handleOpenDashboard('overview'),
                },
              ].map((feat, i) => (
                <div 
                  key={`${outer}-${i}`} 
                  onClick={feat.action}
                  className="flex items-center gap-6 px-7 flex-shrink-0 cursor-pointer group hover:bg-white/[0.04] py-1 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span 
                      className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold transition-transform group-hover:scale-110"
                      style={{ 
                        background: `${feat.color}18`, 
                        color: feat.color,
                        border: `1px solid ${feat.color}40`,
                        boxShadow: `0 0 10px ${feat.color}20`
                      }}
                    >
                      {feat.icon}
                    </span>
                    <div className="flex flex-col text-left">
                      <span 
                        className="text-[9px] font-mono uppercase tracking-widest font-bold" 
                        style={{ color: feat.color }}
                      >
                        {feat.tag}
                      </span>
                      <span className="text-xs sm:text-sm font-display font-bold text-white group-hover:text-[#daf2fd] transition-colors whitespace-nowrap">
                        {feat.title}
                      </span>
                    </div>
                  </div>
                  <span className="text-white/10 text-lg font-mono">/</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ─── METAMASK-STYLE PINNED FEATURE SHOWCASE / COMMAND CENTER ──────── */}
      <AnimatedSection animation="fade-up" delay={0.1} stagger={0}>
        <FeatureGridSection 
          onOpenDemo={handleOpenDemo} 
          onOpenLogin={handleOpenLogin} 
          onOpenDashboard={handleOpenDashboard}
          onOpenAiAssistant={handleOpenAiAssistant}
          onOpenApiHub={() => {
            setCurrentView('api-hub');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenPublicMap={() => {
            setCurrentView('public-map');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      </AnimatedSection>

      {/* ─── ANIMATED PLATFORM STATS SECTION ──────────────────────────────── */}
      <AnimatedSection
        animation="fade-up"
        stagger={0.12}
        className="relative z-10 py-20 px-6 sm:px-10 lg:px-16"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <AnimatedSection animation="clip-reveal">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 mb-4">
                <PulseRing color="#10b981" size={8} />
                <span className="text-emerald-400 text-xs font-mono uppercase tracking-widest">Live Platform Stats</span>
              </div>
            </AnimatedSection>
            <h2 className="text-3xl sm:text-5xl font-display font-black text-white mb-3 neon-text-green">
              Architected for Enterprise Logistics
            </h2>
            <p className="text-[#6e80b2] text-base max-w-xl mx-auto">
              Real-world performance specifications of the LogiSyncPRO autonomous infrastructure
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Sub-Second Cloud Sync', display: '< 100ms', color: '#10b981', icon: '⚡' },
              { label: 'GS1 EPCIS 2.0 Compliant', display: '100%', color: '#06b6d4', icon: '🌐' },
              { label: 'Cold-Chain IoT Precision', display: '±0.1°C', color: '#38bdf8', icon: '❄️' },
              { label: 'Audit Trail Security', display: '256-bit', color: '#ff5500', icon: '🛡️' },
            ].map((stat, i) => (
              <div
                key={i}
                className="glow-card hover-lift relative p-6 rounded-2xl border border-white/8 bg-white/[0.03] backdrop-blur-sm text-center"
                style={{ '--glow-color': stat.color }}
              >
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-3xl sm:text-4xl font-display font-black mb-1 animated-border" style={{ color: stat.color }}>
                  {stat.display}
                </div>
                <div className="text-xs font-mono text-[#6e80b2] uppercase tracking-widest mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ─── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="relative bg-[#060a14] border-t border-white/10 py-16 px-6 sm:px-10 lg:px-16 text-[#c7d5fd] overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 pb-12 border-b border-white/10">
          <div>
            <LogiSyncLogo />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => handleOpenAiAssistant()}
              className="px-6 py-3 rounded-full bg-[#ff5500] hover:bg-[#ff6924] text-black font-display font-black text-xs uppercase tracking-wider cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-md flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-black animate-ping" />
              <span>Ask Gemini AI</span>
            </button>
            <button
              type="button"
              onClick={() => handleOpenDashboard('command-center')}
              className="pill-btn-white px-7 py-3 rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer transition-all hover:scale-105 active:scale-95"
            >
              LAUNCH COMMAND CENTER
            </button>
            <button
              type="button"
              onClick={handleOpenOnboarding}
              className="pill-btn-dark px-7 py-3 rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>SETUP WORKSPACE (8 STEPS)</span>
            </button>
            {!user && (
              <button
                type="button"
                onClick={handleOpenLogin}
                className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold uppercase tracking-wider cursor-pointer transition-all"
              >
                SIGN IN
              </button>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#6e80b2]">
          <div>© 2026 LOGISYNC PRO TECHNOLOGIES INC. ALL RIGHTS RESERVED.</div>
          <div className="flex items-center gap-4">
            <button 
              type="button"
              onClick={() => {
                setCurrentView('api-hub');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }} 
              className="text-[#ff5500] hover:text-[#ff7733] transition-colors cursor-pointer flex items-center gap-1.5 font-sans font-bold"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff5500] animate-pulse" />
              <span>API &amp; Interop Hub</span>
            </button>
            <span className="text-white/20">•</span>
            <button 
              type="button"
              onClick={() => {
                setCurrentView('public-map');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }} 
              className="text-[#10b981] hover:text-[#34d399] transition-colors cursor-pointer flex items-center gap-1.5 font-sans font-bold"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
              <span>Public Transit Map</span>
            </button>
            <span className="text-white/20">•</span>
            <button 
              type="button"
              onClick={() => handleOpenAiAssistant()}
              className="hover:text-[#ff7733] transition-colors cursor-pointer flex items-center gap-1 text-[#ff7733]"
            >
              <span>Gemini AI</span>
            </button>
            <span className="text-white/20">•</span>
            <button 
              type="button"
              onClick={handleOpenOnboarding} 
              className="hover:text-emerald-400 transition-colors cursor-pointer"
            >
              8-Step Onboarding
            </button>
            <span className="text-white/20">•</span>
            <button 
              type="button"
              onClick={handleOpenLogin} 
              className="hover:text-white transition-colors cursor-pointer"
            >
              {user ? `Signed in as ${onboardingProfile?.name || user.displayName || user.email}` : 'Firebase Google Auth'}
            </button>
          </div>
        </div>
      </footer>

      {/* ─── FLOATING AI ASSISTANT TRIGGER WIDGET (BOTTOM-RIGHT) ───────────── */}
      <FloatingAiWidget onOpen={() => handleOpenAiAssistant()} />

      {/* ─── OVERLAYS & MODALS ─────────────────────────────────────────────── */}
      <LogiSyncAiAssistant
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        initialQuery={aiInitialQuery}
        onOpenDashboard={handleOpenDashboard}
        onOpenApiHub={() => {
          setCurrentView('api-hub');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenPublicMap={() => {
          setCurrentView('public-map');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      <IntelligenceDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onOpenDemo={handleOpenDemo}
        onOpenAiAssistant={handleOpenAiAssistant}
      />

      <DemoModal
        isOpen={isDemoOpen}
        onClose={() => setIsDemoOpen(false)}
      />
    </div>
    </SmoothScrollProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
