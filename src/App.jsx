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
import Footer from './components/Footer';
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
          onOpenAiAssistant={(query) => handleOpenAiAssistant(query)}
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

      {/* ─── HERO SECTION with Sticky Scroll-Driven Logistics Conveyor ───── */}
      <div className="relative">
        <HeroShipmentStream 
          onOpenDashboard={handleOpenLogin}
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

      {/* ─── FOOTER (MATCHING USER'S EXACT DESIGN) ────────────────────── */}
      <Footer
        onOpenDashboard={handleOpenDashboard}
        onOpenAiAssistant={handleOpenAiAssistant}
        onOpenApiHub={() => {
          setCurrentView('api-hub');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenTransitMap={() => {
          setCurrentView('public-map');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

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
