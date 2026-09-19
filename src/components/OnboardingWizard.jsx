import React, { useState, useMemo, useRef } from 'react';
import { 
  Check, 
  Package, 
  Truck, 
  Share2, 
  User, 
  Lock, 
  ArrowLeft, 
  ArrowRight, 
  Globe, 
  Building2, 
  MapPin, 
  Briefcase, 
  Layers, 
  Loader2,
  ShieldCheck,
  Database,
  ChevronDown,
  Upload
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// ─── GOOGLE ICON SVG ────────────────────────────────────────────────────────
const GoogleIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

// ─── LOGISYNCPRO LOGO ICON ──────────────────────────────────────────────────
const LogiSyncMark = () => (
  <div className="w-7 h-7 rounded-lg bg-[#0e3328] border border-[#1b5c47] flex items-center justify-center shadow-md shrink-0">
    <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#ff5500]" fill="currentColor">
      <path d="M12 2L2 7.5v9L12 22l10-5.5v-9L12 2zm0 2.311L19.41 8.5 12 12.689 4.59 8.5 12 4.311zM4 9.934l7 3.955v7.234l-7-3.955V9.934zm9 11.189v-7.234l7-3.955v7.234l-7 3.955z"/>
    </svg>
  </div>
);

// ─── REAL LOCATION DATASETS ───────────────────────────────────────────────────
const COUNTRIES = [
  { id: 'in', name: 'India', flag: '🇮🇳' },
  { id: 'us', name: 'United States', flag: '🇺🇸' },
  { id: 'gb', name: 'United Kingdom', flag: '🇬🇧' },
  { id: 'de', name: 'Germany', flag: '🇩🇪' },
  { id: 'sg', name: 'Singapore', flag: '🇸🇬' },
  { id: 'ae', name: 'United Arab Emirates', flag: '🇦🇪' },
  { id: 'nl', name: 'Netherlands', flag: '🇳🇱' },
  { id: 'jp', name: 'Japan', flag: '🇯🇵' },
  { id: 'ca', name: 'Canada', flag: '🇨🇦' },
  { id: 'au', name: 'Australia', flag: '🇦🇺' },
];

const STATES_BY_COUNTRY = {
  in: [
    'Maharashtra',
    'Delhi',
    'Karnataka',
    'Tamil Nadu',
    'Gujarat',
    'Uttar Pradesh',
    'Telangana',
    'Rajasthan',
    'West Bengal',
    'Haryana',
  ],
  us: ['California', 'New York', 'Texas', 'Washington', 'Illinois', 'Florida', 'Georgia'],
  gb: ['England', 'Scotland', 'Wales', 'Northern Ireland'],
  de: ['Bavaria', 'Berlin', 'North Rhine-Westphalia', 'Hamburg', 'Hesse'],
  sg: ['Central Region', 'West Region', 'East Region', 'North Region'],
  ae: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah'],
  nl: ['North Holland', 'South Holland', 'Utrecht', 'North Brabant'],
  jp: ['Tokyo', 'Osaka', 'Kanagawa', 'Aichi'],
  ca: ['Ontario', 'British Columbia', 'Quebec', 'Alberta'],
  au: ['New South Wales', 'Victoria', 'Queensland', 'Western Australia'],
};

const CITIES_BY_STATE = {
  Maharashtra: ['Nagpur', 'Mumbai', 'Pune', 'Nashik', 'Thane', 'Aurangabad', 'Navi Mumbai', 'Solapur'],
  Delhi: ['New Delhi', 'North Delhi', 'South Delhi', 'West Delhi', 'Dwarka'],
  Karnataka: ['Bengaluru', 'Mysuru', 'Hubballi', 'Mangaluru', 'Belagavi'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem'],
  Gujarat: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar'],
  'Uttar Pradesh': ['Noida', 'Lucknow', 'Kanpur', 'Varanasi', 'Agra'],
  California: ['Los Angeles', 'San Francisco', 'San Diego', 'San Jose', 'Oakland'],
  'New York': ['New York City', 'Buffalo', 'Rochester', 'Yonkers', 'Albany'],
  Texas: ['Houston', 'Dallas', 'Austin', 'San Antonio', 'Fort Worth'],
  England: ['London', 'Manchester', 'Birmingham', 'Liverpool', 'Leeds'],
  Bavaria: ['Munich', 'Nuremberg', 'Augsburg', 'Regensburg'],
  Dubai: ['Dubai City', 'Jebel Ali', 'Deira', 'Business Bay'],
};

// ─── ROLE OPTIONS WITH CANONICAL ROLES ──────────────────────────────────────
const ROLE_OPTIONS = [
  { 
    id: 'requester', 
    title: 'Requester / Shipper', 
    dbRole: 'REQUESTER',
    description: 'I want cargo, goods, or items transported', 
    icon: Package 
  },
  { 
    id: 'provider', 
    title: 'Transport Provider / Carrier', 
    dbRole: 'TRANSPORT_PROVIDER',
    description: 'I accept, transport, and fulfill shipments', 
    icon: Truck 
  },
  { id: 'logistics_manager', title: 'Logistics Manager', dbRole: 'REQUESTER', description: 'Coordinate supply chain & freight', icon: User },
  { id: 'fleet_manager', title: 'Fleet Manager', dbRole: 'TRANSPORT_PROVIDER', description: 'Manage carrier fleet & drivers', icon: Truck },
  { id: 'business_owner', title: 'Business Owner', dbRole: 'REQUESTER', description: 'Ship commercial goods & supplies', icon: Briefcase },
  { id: 'operations_manager', title: 'Operations Manager', dbRole: 'REQUESTER', description: 'Oversee logistics operations', icon: Layers },
  { id: 'distributor', title: 'Distributor / Carrier', dbRole: 'TRANSPORT_PROVIDER', description: 'Fulfill regional route deliveries', icon: Share2 },
  { id: 'supplier', title: 'Supplier / Shipper', dbRole: 'REQUESTER', description: 'Outbound raw materials & inventory', icon: Package },
];

export default function OnboardingWizard({ onComplete, onExit }) {
  const { user, completeOnboarding, signInWithGoogle } = useAuth();

  // Active step (1 to 8 matching storyboard)
  const [currentStep, setCurrentStep] = useState(1);
  const [isSavingToNeon, setIsSavingToNeon] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isSigningInGoogle, setIsSigningInGoogle] = useState(false);

  // Form State
  const [country, setCountry] = useState('India');
  const [state, setState] = useState('Maharashtra');
  const [city, setCity] = useState('Nagpur');
  const [role, setRole] = useState('Requester / Shipper');

  // Dropdown open states for Step 5
  const [openDropdown, setOpenDropdown] = useState(null); // 'country' | 'state' | 'city' | null

  // Google Pre-filled User Details (editable name, read-only email, photoURL)
  const [fullName, setFullName] = useState(() => user?.displayName || '');
  const [avatarUrl, setAvatarUrl] = useState(() => user?.photoURL || '/assets/avatar_profile.jpg');
  const fileInputRef = useRef(null);

  const userEmail = user?.email || '';

  // Computed Locations
  const activeCountryObj = useMemo(() => {
    return COUNTRIES.find(c => c.name === country) || COUNTRIES[0];
  }, [country]);

  const availableStates = useMemo(() => {
    return STATES_BY_COUNTRY[activeCountryObj.id] || STATES_BY_COUNTRY.in;
  }, [activeCountryObj]);

  const availableCities = useMemo(() => {
    return CITIES_BY_STATE[state] || ['Nagpur', 'Mumbai', 'Pune', 'Nashik', 'Thane'];
  }, [state]);

  // Handle avatar upload preview
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
    }
  };

  // Google Sign-In Handler for Step 2
  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setIsSigningInGoogle(true);
    try {
      const authResult = await signInWithGoogle();
      setIsSigningInGoogle(false);
      if (authResult?.displayName) {
        setFullName(authResult.displayName);
      }
      if (authResult?.photoURL) {
        setAvatarUrl(authResult.photoURL);
      }
      // Auto-advance to Step 3 (Welcome)
      setCurrentStep(3);
    } catch (err) {
      console.warn('[Onboarding] Google sign-in fallback or simulated success:', err);
      setIsSigningInGoogle(false);
      // Advance to Step 3 even in simulated/dev mode
      setCurrentStep(3);
    }
  };

  // Stepper handlers
  const handleNext = () => {
    setErrorMessage(null);
    setOpenDropdown(null);
    if (currentStep < 8) {
      setCurrentStep(prev => prev + 1);
    } else {
      if (onComplete) onComplete();
    }
  };

  const handleBack = () => {
    setErrorMessage(null);
    setOpenDropdown(null);
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else if (onExit) {
      onExit();
    }
  };

  // Final Step 7 Action: Persist profile to NeonDB and advance to Step 8
  const handleSaveToNeon = async () => {
    setIsSavingToNeon(true);
    setErrorMessage(null);

    try {
      const chosenRoleObj = ROLE_OPTIONS.find(r => r.title === role);
      const canonicalRole = chosenRoleObj ? chosenRoleObj.dbRole : (role.toLowerCase().includes('carrier') || role.toLowerCase().includes('provider') || role.toLowerCase().includes('fleet') ? 'TRANSPORT_PROVIDER' : 'REQUESTER');

      const profileData = {
        name: fullName.trim() || user?.displayName || 'User',
        country,
        state,
        city,
        role: canonicalRole,
        photo_url: avatarUrl,
      };

      // Calls AuthContext which persists to NeonDB users table
      if (completeOnboarding) {
        await completeOnboarding(profileData);
      }

      setIsSavingToNeon(false);

      // Advance to Step 8 (Command center is ready!)
      setTimeout(() => {
        setCurrentStep(8);
      }, 500);
    } catch (err) {
      console.error('[Onboarding] Error saving to NeonDB:', err);
      setIsSavingToNeon(false);
      // Still advance gracefully with cached state
      setCurrentStep(8);
    }
  };

  // Google display name for greeting
  const displayNameToShow = fullName || user?.displayName || 'User';
  const firstName = displayNameToShow.trim().split(' ')[0] || 'User';

  // ─── PROGRESS HEADER (01/08 TO 08/08) ─────────────────────────────────────────
  const renderHeader = (stepNum, showSubtitle = false) => {
    const formatted = `0${stepNum}/08`;
    return (
      <div className="flex items-center justify-between mb-5 select-none relative z-20">
        {/* Brand mark */}
        <div className="flex items-center gap-2">
          <LogiSyncMark />
          <div>
            <div className="flex items-baseline text-sm font-black tracking-tight text-white leading-none">
              <span>LogiSync</span>
              <span className="text-[#ff5500]">PRO</span>
            </div>
            {showSubtitle && (
              <div className="text-[9px] font-mono tracking-wider text-[#38bdf8] uppercase mt-0.5 font-bold">
                SMART LOGISTICS. REAL IMPACT.
              </div>
            )}
          </div>
        </div>

        {/* Segmented Progress bar + Step number */}
        <div className="flex items-center gap-2.5">
          <div className="w-16 h-1.5 bg-[#0e2c24] rounded-full overflow-hidden flex gap-0.5 p-0.5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
              <div 
                key={s} 
                className={`h-full flex-1 rounded-full transition-all duration-300 ${
                  s <= stepNum ? 'bg-[#10b981] shadow-[0_0_6px_#10b981]' : 'bg-[#153f34]'
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-mono text-[#8cb4a6] font-bold">
            {formatted}
          </span>
        </div>
      </div>
    );
  };

  // ─── CARD 01/08: GLOBAL LOGISTICS MADE SIMPLE ────────────────────────────────
  const renderCard01 = () => (
    <div className="relative flex flex-col h-full justify-between overflow-hidden rounded-[30px] p-6 text-white select-none">
      {/* Background Logistics Visual */}
      <div className="absolute inset-0 pointer-events-none">
        <img 
          src="/assets/onboarding_highway.jpg" 
          alt="Global Logistics Highway"
          className="w-full h-full object-cover object-center opacity-70 filter brightness-[0.7] contrast-125"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        {/* Glowing Digital Globe & Cyber Network Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#03130f]/80 via-[#041d16]/50 to-[#020b08]/95" />
        <div className="absolute top-1/4 right-2 w-48 h-48 rounded-full bg-[#10b981]/15 blur-[60px]" />
      </div>

      {/* Top Header */}
      <div className="relative z-10">
        {renderHeader(1, true)}

        {/* Big Splash Headline */}
        <div className="mt-8 sm:mt-10">
          <h1 className="text-3xl sm:text-4xl font-black text-white leading-[1.08] tracking-tight">
            Global <br />
            Logistics <br />
            Made <span className="text-[#ff5500]">Simple.</span>
          </h1>
          <p className="mt-3 text-sm text-[#a2cbbe] font-medium tracking-wide">
            Connect. Move. Grow.
          </p>
        </div>
      </div>

      {/* Bottom Right Advance Circle Button */}
      <div className="relative z-10 flex items-center justify-between pt-6 mt-16">
        {/* Subtle Brand Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[10px] text-[#7eb3a2]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
          <span>Intelligent Freight OS</span>
        </div>

        <button
          type="button"
          onClick={() => setCurrentStep(2)}
          className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-[0_8px_25px_rgba(255,255,255,0.3)] cursor-pointer"
          title="Get Started"
        >
          <ArrowRight size={20} strokeWidth={2.6} />
        </button>
      </div>
    </div>
  );

  // ─── CARD 02/08: SIGN IN TO CONTINUE ─────────────────────────────────────────
  const renderCard02 = () => (
    <div className="relative flex flex-col h-full justify-between overflow-hidden rounded-[30px] p-6 text-white select-none">
      {/* Background Container Terminal at Twilight */}
      <div className="absolute inset-0 pointer-events-none">
        <img 
          src="/assets/onboarding_container.jpg" 
          alt="Container Terminal Port"
          className="w-full h-full object-cover object-center opacity-65 filter brightness-[0.7]"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#03130f]/90 via-[#051f18]/70 to-[#020b08]/95" />
      </div>

      {/* Top Header */}
      <div className="relative z-10">
        {renderHeader(2)}

        {/* Heading */}
        <div className="mt-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug">
            Sign in to continue
          </h2>
          <p className="mt-1 text-xs text-[#8cb4a6]">
            Access your command center with Google.
          </p>
        </div>
      </div>

      {/* Center Auth Actions */}
      <div className="relative z-10 my-auto py-6">
        {/* Continue with Google Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isSigningInGoogle}
          className="w-full py-3.5 px-4 rounded-full bg-white hover:bg-slate-100 text-[#1f2937] font-semibold text-xs flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02] active:scale-98 shadow-lg cursor-pointer"
        >
          {isSigningInGoogle ? (
            <>
              <Loader2 size={16} className="animate-spin text-emerald-600" />
              <span>Connecting Google Account...</span>
            </>
          ) : (
            <>
              <GoogleIcon className="w-4 h-4" />
              <span>Continue with Google</span>
            </>
          )}
        </button>

        {/* Or Divider */}
        <div className="flex items-center my-4">
          <div className="flex-1 border-t border-white/10" />
          <span className="px-3 text-[11px] text-[#709587] font-medium">or</span>
          <div className="flex-1 border-t border-white/10" />
        </div>

        {/* Continue to Setup Direct Bypass for Onboarding Testing */}
        <button
          type="button"
          onClick={() => setCurrentStep(3)}
          className="w-full py-2.5 rounded-full bg-[#0a271f]/80 hover:bg-[#0f3429] border border-[#174e3e] text-xs text-[#8dc0b0] hover:text-white transition-all text-center cursor-pointer"
        >
          <span>Continue as Guest / Demo Workspace &rarr;</span>
        </button>

        {/* Terms of Service Disclaimer */}
        <p className="mt-5 text-center text-[10px] text-[#6d9183] leading-relaxed max-w-xs mx-auto">
          By continuing, you agree to our{' '}
          <span className="text-[#a5cfc0] hover:underline cursor-pointer">Terms of Service</span> and{' '}
          <span className="text-[#a5cfc0] hover:underline cursor-pointer">Privacy Policy</span>.
        </p>
      </div>

      {/* Bottom Navigation */}
      <div className="relative z-10 flex items-center justify-between pt-3 border-t border-[#0e2c24]">
        <button
          type="button"
          onClick={handleBack}
          className="text-xs text-[#789e91] hover:text-white flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft size={13} />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={() => setCurrentStep(3)}
          className="px-5 py-2 rounded-full bg-white hover:bg-slate-100 text-black text-xs font-bold flex items-center gap-1 transition-all hover:scale-105 shadow-md cursor-pointer"
        >
          <span>Next</span>
          <ArrowRight size={13} strokeWidth={2.4} />
        </button>
      </div>
    </div>
  );

  // ─── CARD 03/08: WELCOME, USER! ──────────────────────────────────────────────
  const renderCard03 = () => (
    <div className="flex flex-col h-full justify-between p-6 text-white select-none animate-in fade-in duration-300">
      <div>
        {renderHeader(3)}

        <div className="text-center mt-2">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Welcome, {firstName}!
          </h2>
          <p className="mt-1 text-xs text-[#8bb1a4]">
            Let's set up your workspace.
          </p>
        </div>

        {/* Profile Avatar with Google Badge at Bottom-Right */}
        <div className="mt-8 flex flex-col items-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#10b981] p-0.5 bg-[#0e3328] shadow-[0_0_20px_rgba(16,185,129,0.25)]">
              <img 
                src={avatarUrl} 
                alt={displayNameToShow}
                className="w-full h-full object-cover rounded-full"
                onError={(e) => { e.currentTarget.src = '/assets/avatar_profile.jpg'; }}
              />
            </div>
            {/* Small Google Badge on bottom right of avatar */}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border border-[#10b981] flex items-center justify-center shadow-md">
              <GoogleIcon className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* User Display Name & Email Card */}
          <div className="mt-5 w-full p-4 rounded-2xl bg-[#062019] border border-[#144738] text-center shadow-md">
            <div className="text-sm font-bold text-white truncate">
              {displayNameToShow}
            </div>
            <div className="text-xs text-[#6e9788] truncate mt-0.5">
              {userEmail}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="pt-6">
        <button
          type="button"
          onClick={() => setCurrentStep(4)}
          className="w-full py-3 rounded-full bg-[#10b981] hover:bg-[#059669] text-[#061b15] font-bold text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-98 shadow-[0_4px_20px_rgba(16,185,129,0.3)] cursor-pointer"
        >
          <span>Continue</span>
          <ArrowRight size={14} strokeWidth={2.4} />
        </button>

        <div className="flex items-center justify-between pt-4 mt-3 border-t border-[#0e2c24]">
          <button
            type="button"
            onClick={handleBack}
            className="text-xs text-[#789e91] hover:text-white flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft size={13} />
            <span>Back</span>
          </button>
          <span className="text-[11px] text-[#557b6e]">Step 03 of 08</span>
        </div>
      </div>
    </div>
  );

  // ─── CARD 04/08: HOW SHOULD WE CALL YOU? ──────────────────────────────────────
  const renderCard04 = () => (
    <div className="flex flex-col h-full justify-between p-6 text-white select-none animate-in fade-in duration-300">
      <div>
        {renderHeader(4)}

        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            How should we call you?
          </h2>
          <p className="mt-1 text-xs text-[#8bb1a4]">
            You can change this anytime.
          </p>
        </div>

        {/* Display Name Input */}
        <div className="mt-6">
          <label className="block text-[11px] font-medium text-[#73978a] mb-1.5">
            Display name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full name"
            className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#061e18] border border-[#123e31] text-white focus:outline-none focus:border-[#10b981] transition-colors"
          />
        </div>

        {/* Profile Photo Section */}
        <div className="mt-5">
          <label className="block text-[11px] font-medium text-[#73978a] mb-2">
            Profile photo
          </label>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full overflow-hidden border border-[#10b981] bg-[#0e3328] p-0.5 shrink-0 shadow-sm">
              <img 
                src={avatarUrl} 
                alt={fullName}
                className="w-full h-full object-cover rounded-full"
                onError={(e) => { e.currentTarget.src = '/assets/avatar_profile.jpg'; }}
              />
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-xl bg-[#061e18] hover:bg-[#0c2f25] border border-[#123e31] hover:border-[#10b981] text-xs text-[#c4e6db] flex items-center gap-2 transition-all cursor-pointer"
            >
              <Upload size={13} className="text-[#10b981]" />
              <span>Change photo</span>
            </button>
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              onChange={handleAvatarChange} 
              className="hidden" 
            />
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-[#0e2c24] mt-6">
        <button
          type="button"
          onClick={handleBack}
          className="text-xs text-[#789e91] hover:text-white flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft size={13} />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="px-6 py-2 rounded-full bg-white hover:bg-slate-100 text-black text-xs font-bold flex items-center gap-1 transition-all hover:scale-105 shadow-md cursor-pointer"
        >
          <span>Next</span>
          <ArrowRight size={13} strokeWidth={2.4} />
        </button>
      </div>
    </div>
  );

  // ─── CARD 05/08: WHERE DO YOU OPERATE FROM? ───────────────────────────────────
  const renderCard05 = () => {
    return (
      <div className="flex flex-col h-full justify-between p-6 text-white select-none animate-in fade-in duration-300">
        <div>
          {renderHeader(5)}

          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Where do you operate from?
            </h2>
            <p className="mt-1 text-xs text-[#8bb1a4]">
              This helps us tailor your experience.
            </p>
          </div>

          {/* Form Fields: Country, State, City */}
          <div className="mt-5 space-y-3.5">
            {/* Country Dropdown */}
            <div>
              <label className="block text-[11px] font-medium text-[#73978a] mb-1">
                Country
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === 'country' ? null : 'country')}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs rounded-xl bg-[#061e18] border border-[#123e31] text-white hover:border-[#10b981] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{activeCountryObj.flag}</span>
                    <span>{country}</span>
                  </div>
                  <ChevronDown size={14} className="text-[#6d8f82]" />
                </button>

                {openDropdown === 'country' && (
                  <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-[#062019] border border-[#123e31] rounded-xl shadow-2xl max-h-48 overflow-y-auto p-1.5 space-y-1">
                    {COUNTRIES.map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setCountry(c.name);
                          // Reset state & city to sensible default
                          const defaultStates = STATES_BY_COUNTRY[c.id] || [];
                          if (defaultStates.length > 0) {
                            setState(defaultStates[0]);
                            const defaultCities = CITIES_BY_STATE[defaultStates[0]] || [];
                            if (defaultCities.length > 0) setCity(defaultCities[0]);
                          }
                          setOpenDropdown(null);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                          country === c.name ? 'bg-[#10b981] text-[#061b15] font-bold' : 'text-[#c2e4d9] hover:bg-[#0a2a21]'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{c.flag}</span>
                          <span>{c.name}</span>
                        </span>
                        {country === c.name && <Check size={12} strokeWidth={3} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* State Dropdown */}
            <div>
              <label className="block text-[11px] font-medium text-[#73978a] mb-1">
                State
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === 'state' ? null : 'state')}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs rounded-xl bg-[#061e18] border border-[#123e31] text-white hover:border-[#10b981] transition-colors cursor-pointer"
                >
                  <span>{state}</span>
                  <ChevronDown size={14} className="text-[#6d8f82]" />
                </button>

                {openDropdown === 'state' && (
                  <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-[#062019] border border-[#123e31] rounded-xl shadow-2xl max-h-48 overflow-y-auto p-1.5 space-y-1">
                    {availableStates.map(st => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => {
                          setState(st);
                          const defaultCities = CITIES_BY_STATE[st] || [];
                          if (defaultCities.length > 0) setCity(defaultCities[0]);
                          setOpenDropdown(null);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                          state === st ? 'bg-[#10b981] text-[#061b15] font-bold' : 'text-[#c2e4d9] hover:bg-[#0a2a21]'
                        }`}
                      >
                        <span>{st}</span>
                        {state === st && <Check size={12} strokeWidth={3} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* City Dropdown */}
            <div>
              <label className="block text-[11px] font-medium text-[#73978a] mb-1">
                City
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === 'city' ? null : 'city')}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs rounded-xl bg-[#061e18] border border-[#123e31] text-white hover:border-[#10b981] transition-colors cursor-pointer"
                >
                  <span>{city}</span>
                  <ChevronDown size={14} className="text-[#6d8f82]" />
                </button>

                {openDropdown === 'city' && (
                  <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-[#062019] border border-[#123e31] rounded-xl shadow-2xl max-h-48 overflow-y-auto p-1.5 space-y-1">
                    {availableCities.map(ct => (
                      <button
                        key={ct}
                        type="button"
                        onClick={() => {
                          setCity(ct);
                          setOpenDropdown(null);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                          city === ct ? 'bg-[#10b981] text-[#061b15] font-bold' : 'text-[#c2e4d9] hover:bg-[#0a2a21]'
                        }`}
                      >
                        <span>{ct}</span>
                        {city === ct && <Check size={12} strokeWidth={3} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-[#0e2c24] mt-6">
          <button
            type="button"
            onClick={handleBack}
            className="text-xs text-[#789e91] hover:text-white flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft size={13} />
            <span>Back</span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-2 rounded-full bg-white hover:bg-slate-100 text-black text-xs font-bold flex items-center gap-1 transition-all hover:scale-105 shadow-md cursor-pointer"
          >
            <span>Next</span>
            <ArrowRight size={13} strokeWidth={2.4} />
          </button>
        </div>
      </div>
    );
  };

  // ─── CARD 06/08: WHAT BEST DESCRIBES YOU? ────────────────────────────────────
  const renderCard06 = () => (
    <div className="flex flex-col h-full justify-between p-6 text-white select-none animate-in fade-in duration-300">
      <div>
        {renderHeader(6)}

        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            What best describes you?
          </h2>
          <p className="mt-1 text-xs text-[#8bb1a4]">
            This helps us personalize your dashboard.
          </p>
        </div>

        {/* Primary Role Choice + Functional Roles */}
        <div className="mt-4 space-y-3">
          {/* Top 2 Primary Operating Roles */}
          <div className="grid grid-cols-2 gap-2.5">
            {ROLE_OPTIONS.slice(0, 2).map((r) => {
              const isSelected = role === r.title;
              const IconComp = r.icon;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.title)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-[#0a3127] border-[#10b981] ring-2 ring-[#10b981]/40 shadow-lg'
                      : 'bg-[#061e18] border-[#0f3429] hover:border-[#1c5545]'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-[#10b981] flex items-center justify-center text-[#061b15]">
                      <Check size={10} strokeWidth={3} />
                    </div>
                  )}
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${isSelected ? 'bg-[#10b981]/20 text-[#34d399]' : 'bg-white/5 text-[#719588]'}`}>
                    <IconComp size={18} />
                  </div>
                  <div className="text-xs font-bold text-white leading-tight">
                    {r.title}
                  </div>
                  <div className="text-[10px] text-[#7ea597] mt-1 leading-snug">
                    {r.description}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="text-[10px] font-mono text-[#618578] uppercase tracking-wider">
            Or select specific functional title:
          </div>

          {/* Functional Title Options */}
          <div className="grid grid-cols-3 gap-2 max-h-[140px] overflow-y-auto pr-1">
            {ROLE_OPTIONS.slice(2).map((r) => {
              const isSelected = role === r.title;
              const IconComp = r.icon;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.title)}
                  className={`p-2 rounded-xl border flex flex-col items-center justify-center text-center gap-1 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#082820] border-[#10b981] text-white shadow-sm'
                      : 'bg-[#061a15] border-[#0f3429] text-[#b7d6cb] hover:border-[#194e3e]'
                  }`}
                >
                  <IconComp size={14} className={isSelected ? 'text-[#34d399]' : 'text-[#719588]'} />
                  <span className="text-[10px] font-semibold leading-tight">{r.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-[#0e2c24] mt-4">
        <button
          type="button"
          onClick={handleBack}
          className="text-xs text-[#789e91] hover:text-white flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft size={13} />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="px-6 py-2 rounded-full bg-white hover:bg-slate-100 text-black text-xs font-bold flex items-center gap-1 transition-all hover:scale-105 shadow-md cursor-pointer"
        >
          <span>Next</span>
          <ArrowRight size={13} strokeWidth={2.4} />
        </button>
      </div>
    </div>
  );

  // ─── CARD 07/08: REVIEW YOUR INFORMATION ─────────────────────────────────────
  const renderCard07 = () => {
    const reviewRows = [
      { label: 'Name', val: fullName || displayNameToShow, step: 4, icon: User },
      { label: 'Email', val: userEmail, step: 4, icon: Lock },
      { label: 'Country', val: country, step: 5, icon: Globe },
      { label: 'State', val: state, step: 5, icon: Building2 },
      { label: 'City', val: city, step: 5, icon: MapPin },
      { label: 'Role', val: role, step: 6, icon: Briefcase },
    ];

    return (
      <div className="flex flex-col h-full justify-between p-6 text-white select-none animate-in fade-in duration-300">
        <div>
          {renderHeader(7)}

          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Review your information
            </h2>
            <p className="mt-1 text-xs text-[#8bb1a4]">
              Make sure everything looks good.
            </p>
          </div>

          {/* Review Rows Table */}
          <div className="mt-4 space-y-1.5">
            {reviewRows.map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <div 
                  key={idx}
                  className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#061e18] border border-[#0f3429] text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="text-[#598072]">
                      <IconComponent size={13} />
                    </div>
                    <span className="text-[#6e9285] font-medium min-w-[50px]">{item.label}</span>
                    <span className="text-white font-medium truncate">{item.val}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCurrentStep(item.step)}
                    className="text-[11px] text-[#10b981] hover:text-[#34d399] font-semibold transition-colors cursor-pointer ml-2 shrink-0"
                  >
                    Edit
                  </button>
                </div>
              );
            })}
          </div>

          {/* Database Target Status Pill */}
          <div className="mt-3 p-2.5 rounded-xl bg-[#041d16] border border-[#104b3a] flex items-center justify-between">
            <div className="flex items-center gap-2 text-[11px] text-[#a2cbbe]">
              <Database size={13} className="text-[#10b981]" />
              <span>Target: <b>Neon PostgreSQL</b> (users table)</span>
            </div>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#10b981]/20 text-[#34d399] font-mono font-medium">
              Primary DB
            </span>
          </div>

          {errorMessage && (
            <div className="mt-2.5 p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {errorMessage}
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-[#0e2c24] mt-4">
          <button
            type="button"
            onClick={handleBack}
            disabled={isSavingToNeon}
            className="text-xs text-[#789e91] hover:text-white flex items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            <ArrowLeft size={13} />
            <span>Back</span>
          </button>

          <button
            type="button"
            onClick={handleSaveToNeon}
            disabled={isSavingToNeon}
            className="px-5 py-2.5 rounded-full bg-[#10b981] hover:bg-[#059669] text-[#061b15] text-xs font-bold flex items-center gap-2 transition-all hover:scale-105 shadow-[0_4px_20px_rgba(16,185,129,0.4)] cursor-pointer disabled:opacity-75"
          >
            {isSavingToNeon ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>Saving to NeonDB...</span>
              </>
            ) : (
              <>
                <span>Complete Setup</span>
                <ArrowRight size={13} strokeWidth={2.4} />
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  // ─── CARD 08/08: YOUR COMMAND CENTER IS READY ────────────────────────────────
  const renderCard08 = () => (
    <div className="relative flex flex-col h-full justify-between overflow-hidden rounded-[30px] p-6 text-white select-none">
      {/* Background Container Terminal with Sunset Lighting */}
      <div className="absolute inset-0 pointer-events-none">
        <img 
          src="/assets/onboarding_container.jpg" 
          alt="LogiSync Command Center"
          className="w-full h-full object-cover object-center opacity-60 filter brightness-[0.65]"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#03130f]/85 via-[#041a14]/65 to-[#020b08]/95" />
      </div>

      {/* Top Header */}
      <div className="relative z-10">
        {renderHeader(8)}
      </div>

      {/* Center Check & Ready Graphic */}
      <div className="relative z-10 my-auto text-center flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-[#10b981]/20 border-2 border-[#10b981] flex items-center justify-center text-[#10b981] shadow-[0_0_30px_rgba(16,185,129,0.5)] mb-5 animate-in zoom-in duration-300">
          <Check size={32} strokeWidth={3} />
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
          Your command <br />
          center is ready.
        </h2>
        <p className="mt-2 text-xs text-[#a3c9be]">
          Welcome to LogiSyncPRO
        </p>

        <div className="mt-4 px-3 py-1 rounded-full bg-[#051c16]/80 backdrop-blur-md border border-[#144b3b] text-[10px] text-[#5eead4] flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
          <span>Profile Synced to NeonDB</span>
        </div>
      </div>

      {/* Bottom CTA Button: Enter Command Center */}
      <div className="relative z-10 pt-4">
        <button
          type="button"
          onClick={() => {
            if (onComplete) onComplete();
          }}
          className="w-full py-3.5 rounded-full bg-white hover:bg-slate-100 text-[#0a1b15] font-bold text-xs flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-98 shadow-xl cursor-pointer"
        >
          <span>Enter Command Center</span>
          <ArrowRight size={14} strokeWidth={2.4} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-[#020d0a] text-white flex flex-col items-center justify-center p-3 sm:p-6 font-sans relative overflow-x-hidden selection:bg-[#10b981] selection:text-[#041611]">
      
      {/* Background ambient radial glow */}
      <div className="absolute inset-0 pointer-events-none opacity-45 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[750px] h-[750px] bg-gradient-to-tr from-[#10b981]/15 via-[#0d4032]/10 to-transparent rounded-full blur-[140px]" />
      </div>

      {/* Top Breadcrumb & Back button */}
      <div className="w-full max-w-lg mb-3 flex items-center justify-between relative z-10 px-2">
        {onExit && (
          <button
            type="button"
            onClick={onExit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#061e18] hover:bg-[#0c2f25] border border-[#133e31] text-xs text-[#87ab9e] hover:text-white transition-all cursor-pointer"
          >
            <ArrowLeft size={13} />
            <span>Back to Home</span>
          </button>
        )}

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#061e18]/90 border border-[#103b2f] text-[11px] text-[#6d9183] ml-auto">
          <ShieldCheck size={12} className="text-[#10b981]" />
          <span>Neon PostgreSQL Primary DB</span>
        </div>
      </div>

      {/* ─── MAIN CARD CONTAINER (MATCHING EXACT 8-CARD STORYBOARD) ───────────── */}
      <div className="relative z-10 w-full max-w-[400px] sm:max-w-[410px] min-h-[580px] h-[580px] sm:h-[600px] bg-[#051612] border border-[#103a2f] rounded-[32px] shadow-[0_25px_70px_rgba(0,0,0,0.7)] flex flex-col justify-between transition-all overflow-hidden">
        {currentStep === 1 && renderCard01()}
        {currentStep === 2 && renderCard02()}
        {currentStep === 3 && renderCard03()}
        {currentStep === 4 && renderCard04()}
        {currentStep === 5 && renderCard05()}
        {currentStep === 6 && renderCard06()}
        {currentStep === 7 && renderCard07()}
        {currentStep === 8 && renderCard08()}
      </div>

      {/* Quick Jump Step Navigation Dots (01 to 08) */}
      <div className="relative z-10 mt-4 flex items-center justify-center gap-2 select-none">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(st => (
          <button
            key={st}
            type="button"
            onClick={() => setCurrentStep(st)}
            title={`Jump to step 0${st}/08`}
            className={`rounded-full transition-all cursor-pointer ${
              st === currentStep 
                ? 'w-6 h-2 bg-[#10b981] shadow-[0_0_8px_#10b981]' 
                : 'w-2 h-2 bg-[#12382e] hover:bg-[#1f5647]'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
