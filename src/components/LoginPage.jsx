import React, { useState } from 'react';
import { 
  Zap, 
  Lock, 
  Users, 
  ArrowRight, 
  BarChart3, 
  Truck, 
  AlertCircle, 
  Loader2, 
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LogiSyncLogo from './LogiSyncLogo';

export default function LoginPage({ onBackToLanding, onLoginSuccess }) {
  const { signInWithGoogle, authError, clearError, isConfigured } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [localError, setLocalError] = useState(null);

  const handleGoogleSignIn = async () => {
    setLocalError(null);
    clearError();
    setIsSigningIn(true);

    try {
      const user = await signInWithGoogle();
      setIsSigningIn(false);
      if (onLoginSuccess) {
        onLoginSuccess(user);
      }
    } catch (err) {
      setIsSigningIn(false);
      setLocalError(err.message);
    }
  };

  const displayError = localError || authError;

  return (
    <div className="min-h-screen w-full bg-[#edece6] flex items-center justify-center p-3 sm:p-6 lg:p-10 font-sans selection:bg-[#ff5500] selection:text-white">
      {/* Main Split-Card Container */}
      <div className="w-full max-w-[1380px] bg-white rounded-[32px] sm:rounded-[40px] shadow-[0_25px_70px_rgba(0,0,0,0.15)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 border border-black/5">
        
        {/* ================================================================ */}
        {/* LEFT PANEL: The Dark Holographic Logistics Command Showcase      */}
        {/* ================================================================ */}
        <div className="lg:col-span-6 bg-[#041612] text-white p-7 sm:p-10 lg:p-12 relative overflow-hidden flex flex-col justify-between rounded-t-[32px] lg:rounded-t-none lg:rounded-l-[40px]">
          
          {/* Background Ambient Glow & Contour Grid */}
          <div className="absolute inset-0 pointer-events-none opacity-40">
            <svg className="w-full h-full" viewBox="0 0 600 700" fill="none">
              <defs>
                <radialGradient id="globeGlow" cx="65%" cy="45%" r="55%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                  <stop offset="60%" stopColor="#041612" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#041612" stopOpacity="1" />
                </radialGradient>
              </defs>
              <rect width="100%" height="100%" fill="url(#globeGlow)" />
            </svg>
          </div>

          {/* Top Bar: Brand Logo + Back Button */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LogiSyncLogo />
            </div>

            {onBackToLanding && (
              <button
                onClick={onBackToLanding}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-xs text-[#8cb6a7] hover:text-white transition-all cursor-pointer border border-white/10"
              >
                <ArrowLeft size={13} />
                <span>Landing Page</span>
              </button>
            )}
          </div>

          {/* Center Showcase: Headline + Floating Badge + 3D Container & Globe Arc */}
          <div className="relative z-10 my-8 sm:my-10 flex-1 flex flex-col justify-center">
            {/* Display Headline */}
            <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-[50px] leading-[1.02] tracking-tight text-white max-w-lg mb-6">
              One Login <br />
              for a Smarter <br />
              Supply Chain
            </h1>

            {/* Central Graphic Composition */}
            <div className="relative w-full h-[260px] sm:h-[300px] flex items-center justify-center">
              {/* Floating Status Pill */}
              <div className="absolute top-2 right-6 sm:right-16 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#08221c]/90 border border-[#1b483c] shadow-lg backdrop-blur-sm animate-bounce-slow">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-medium text-[#c4e3d9]">Global shipments start with you.</span>
              </div>

              {/* Wireframe Globe Contours & Glowing Nodes */}
              <svg viewBox="0 0 450 320" className="w-full h-full" fill="none">
                {/* Globe Latitude & Longitude Arcs */}
                <path 
                  d="M 60 270 Q 200 40 400 160" 
                  stroke="#1b483c" 
                  strokeWidth="1.5" 
                  strokeDasharray="4 4" 
                />
                <path 
                  d="M 120 280 Q 250 80 430 200" 
                  stroke="#225b4b" 
                  strokeWidth="1.8" 
                />
                <path 
                  d="M 180 300 Q 300 120 440 240" 
                  stroke="#1b483c" 
                  strokeWidth="1.2" 
                />
                <path 
                  d="M 160 80 Q 260 170 340 300" 
                  stroke="#266a57" 
                  strokeWidth="1.5" 
                  strokeDasharray="5 3" 
                />

                {/* Glowing Green Coordinate Pins */}
                {/* Node 1 */}
                <g transform="translate(195, 155)">
                  <circle cx="0" cy="0" r="14" fill="#10b981" opacity="0.2" className="animate-pulse" />
                  <circle cx="0" cy="0" r="4.5" fill="#a3e635" />
                </g>
                {/* Node 2 */}
                <g transform="translate(245, 115)">
                  <circle cx="0" cy="0" r="14" fill="#10b981" opacity="0.2" className="animate-pulse" />
                  <circle cx="0" cy="0" r="4.5" fill="#a3e635" />
                </g>
                {/* Node 3 */}
                <g transform="translate(325, 175)">
                  <circle cx="0" cy="0" r="14" fill="#10b981" opacity="0.2" className="animate-pulse" />
                  <circle cx="0" cy="0" r="4.5" fill="#a3e635" />
                </g>
                {/* Node 4 (Bottom-left) */}
                <g transform="translate(150, 270)">
                  <circle cx="0" cy="0" r="12" fill="#10b981" opacity="0.2" />
                  <circle cx="0" cy="0" r="4" fill="#a3e635" />
                </g>
                {/* Node 5 (Far Right) */}
                <g transform="translate(240, 235)">
                  <circle cx="0" cy="0" r="12" fill="#10b981" opacity="0.2" />
                  <circle cx="0" cy="0" r="4" fill="#a3e635" />
                </g>
              </svg>

              {/* 3D Isometric Cargo Container with Orange Hex Mark */}
              <div className="absolute z-10 w-[240px] sm:w-[270px] h-[190px] drop-shadow-2xl">
                <svg viewBox="0 0 240 180" className="w-full h-full" fill="none">
                  <defs>
                    <linearGradient id="lTop" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#255a49" />
                      <stop offset="100%" stopColor="#143b2f" />
                    </linearGradient>
                    <linearGradient id="lSide" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#1a4739" />
                      <stop offset="100%" stopColor="#0c261e" />
                    </linearGradient>
                    <linearGradient id="lFront" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#1e5241" />
                      <stop offset="100%" stopColor="#0e2a22" />
                    </linearGradient>
                  </defs>

                  {/* Drop Shadow */}
                  <ellipse cx="120" cy="155" rx="80" ry="16" fill="#020a08" opacity="0.75" />

                  {/* Top Face */}
                  <polygon points="120,48 195,80 135,104 60,72" fill="url(#lTop)" stroke="#2b6b57" strokeWidth="0.8" />
                  <line x1="85" y1="56" x2="150" y2="84" stroke="#337862" strokeWidth="1" />
                  <line x1="100" y1="62" x2="165" y2="90" stroke="#337862" strokeWidth="1" />
                  <line x1="115" y1="69" x2="180" y2="97" stroke="#337862" strokeWidth="1" />

                  {/* Side Face with Ribs */}
                  <polygon points="60,72 135,104 135,152 60,120" fill="url(#lSide)" stroke="#1a3b2f" strokeWidth="0.8" />
                  {[72, 84, 96, 108, 120].map((x, i) => (
                    <g key={i}>
                      <line x1={x} y1={77 + i * 4.3} x2={x} y2={125 + i * 4.3} stroke="#286450" strokeWidth="2.5" />
                      <line x1={x + 3} y1={78 + i * 4.3} x2={x + 3} y2={126 + i * 4.3} stroke="#071914" strokeWidth="1.2" />
                    </g>
                  ))}

                  {/* Front Face with Doors and Logo */}
                  <polygon points="135,104 195,80 195,128 135,152" fill="url(#lFront)" stroke="#1a3b2f" strokeWidth="0.8" />
                  <line x1="165" y1="92" x2="165" y2="140" stroke="#071914" strokeWidth="2" />
                  <line x1="150" y1="98" x2="150" y2="146" stroke="#487865" strokeWidth="1.5" />
                  <line x1="180" y1="86" x2="180" y2="134" stroke="#487865" strokeWidth="1.5" />

                  {/* Orange Hex Box Emblem on Front */}
                  <g transform="translate(158, 110) scale(0.9)">
                    <polygon points="10,0 20,5.8 20,17.3 10,23.1 0,17.3 0,5.8" fill="#ea580c" />
                    <polygon points="10,2 18,6.8 18,16.3 10,21.1 2,16.3 2,6.8" fill="#ffffff" />
                    <polygon points="10,4 16,7.5 16,15 10,18.5 4,15 4,7.5" fill="#ea580c" />
                  </g>
                </svg>
              </div>
            </div>
          </div>

          {/* Bottom 3 Feature Pills */}
          <div className="relative z-10 space-y-3 pt-2">
            {/* Pill 1: Fast & Secure */}
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#092b23] border border-[#1b483c] flex items-center justify-center text-emerald-400 shrink-0">
                <Zap size={18} />
              </div>
              <div>
                <div className="font-bold text-sm text-white leading-tight">Fast & Secure</div>
                <div className="text-xs text-[#8cb6a7]">Sign in with Google in seconds</div>
              </div>
            </div>

            {/* Pill 2: Your Data, Your Control */}
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#092b23] border border-[#1b483c] flex items-center justify-center text-emerald-400 shrink-0">
                <Lock size={18} />
              </div>
              <div>
                <div className="font-bold text-sm text-white leading-tight">Your Data, Your Control</div>
                <div className="text-xs text-[#8cb6a7]">Enterprise-grade security</div>
              </div>
            </div>

            {/* Pill 3: Built for Your Team */}
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#092b23] border border-[#1b483c] flex items-center justify-center text-emerald-400 shrink-0">
                <Users size={18} />
              </div>
              <div>
                <div className="font-bold text-sm text-white leading-tight">Built for Your Team</div>
                <div className="text-xs text-[#8cb6a7]">Seamless collaboration</div>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* RIGHT PANEL: Authentic Google Authentication Form                */}
        {/* ================================================================ */}
        <div className="lg:col-span-6 bg-[#fbfaf6] p-7 sm:p-10 lg:p-14 flex flex-col justify-between relative overflow-hidden">
          
          {/* Top Right Navigation */}
          <div className="flex items-center justify-end gap-3 text-xs">
            <span className="text-gray-500">New here?</span>
            <button 
              onClick={handleGoogleSignIn}
              disabled={isSigningIn}
              className="px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-800 font-semibold shadow-xs hover:border-gray-400 hover:shadow-sm transition-all cursor-pointer"
            >
              Create an account
            </button>
          </div>

          {/* Main Form Center Area */}
          <div className="my-auto py-8 sm:py-10 max-w-md w-full mx-auto">
            {/* Monospace Welcome Tag */}
            <div className="text-[11px] font-mono tracking-widest text-[#15803d] uppercase font-bold mb-2">
              WELCOME TO LOGISYNCPRO
            </div>

            {/* Title */}
            <h2 className="font-display font-black text-3xl sm:text-4xl text-gray-900 tracking-tight leading-tight mb-2.5">
              Sign in with Google
            </h2>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed mb-8">
              Get started and access your logistics command center in one click.
            </p>

            {/* Error Message Banner */}
            {displayError && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3 animate-in fade-in duration-200">
                <AlertCircle size={17} className="text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-bold mb-0.5">Authentication Error</div>
                  <p className="text-rose-700 leading-relaxed">{displayError}</p>
                  {!isConfigured && (
                    <div className="mt-2 text-[11px] text-rose-600 bg-white/70 p-2 rounded-lg border border-rose-200">
                      Add your Firebase credentials to <code className="font-mono font-bold">.env</code> to activate live authentication.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Primary Action: Google Sign-In Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isSigningIn}
              className={`w-full py-3.5 px-5 rounded-full bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all flex items-center justify-between group cursor-pointer ${
                isSigningIn ? 'opacity-75 cursor-wait' : 'hover:scale-[1.01] active:scale-[0.99]'
              }`}
            >
              {/* Official Google Multicolor 'G' Logo */}
              <div className="w-6 h-6 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" className="w-5 h-5">
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
              </div>

              {/* Text / Loading State */}
              <span className="font-semibold text-gray-800 text-sm sm:text-base">
                {isSigningIn ? 'Signing you in...' : 'Continue with Google'}
              </span>

              {/* Arrow or Spinner */}
              <div className="w-6 h-6 flex items-center justify-center text-gray-500 group-hover:text-gray-900 group-hover:translate-x-0.5 transition-all">
                {isSigningIn ? (
                  <Loader2 size={18} className="animate-spin text-emerald-600" />
                ) : (
                  <ArrowRight size={18} />
                )}
              </div>
            </button>

            {/* Separator Divider */}
            <div className="relative my-8 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <span className="relative px-3 bg-[#fbfaf6] text-[11px] font-mono text-gray-400 font-bold uppercase tracking-widest">
                OR
              </span>
            </div>

            {/* 3 Quick Value Metric Items */}
            <div className="grid grid-cols-3 gap-3 text-center">
              {/* Item 1 */}
              <div className="flex flex-col items-center">
                <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700 mb-2">
                  <BarChart3 size={16} />
                </div>
                <span className="text-[10.5px] font-semibold text-gray-700 leading-tight">
                  Access your dashboard
                </span>
              </div>

              {/* Item 2 */}
              <div className="flex flex-col items-center">
                <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700 mb-2">
                  <Truck size={16} />
                </div>
                <span className="text-[10.5px] font-semibold text-gray-700 leading-tight">
                  Track shipments in real time
                </span>
              </div>

              {/* Item 3 */}
              <div className="flex flex-col items-center">
                <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700 mb-2">
                  <Users size={16} />
                </div>
                <span className="text-[10.5px] font-semibold text-gray-700 leading-tight">
                  Collaborate with your team
                </span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center text-[11px] text-gray-400">
            By continuing, you agree to our{' '}
            <a href="#terms" className="underline hover:text-gray-600">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#privacy" className="underline hover:text-gray-600">
              Privacy Policy
            </a>
            .
          </div>
        </div>
      </div>
    </div>
  );
}
