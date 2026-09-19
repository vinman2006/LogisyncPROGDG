import React from 'react';

export default function LogiSyncLogo({ className = "h-9", showBadge = true }) {
  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none group ${className}`}>
      {/* 1. Hexagonal Transit Emblem (Icon) */}
      <div className="relative w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0 flex items-center justify-center">
        <svg
          viewBox="0 0 44 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full transform transition-transform duration-500 group-hover:scale-105"
        >
          <defs>
            <filter id="logo-beacon-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <linearGradient id="logo-cube-top" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff7b33" />
              <stop offset="100%" stopColor="#e84c00" />
            </linearGradient>

            <linearGradient id="logo-cube-left" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c73c00" />
              <stop offset="100%" stopColor="#942a00" />
            </linearGradient>

            <linearGradient id="logo-cube-right" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e85207" />
              <stop offset="100%" stopColor="#b33400" />
            </linearGradient>

            <linearGradient id="logo-hex-border" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e0f4fd" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#8ecfe8" stopOpacity="0.65" />
            </linearGradient>
          </defs>

          {/* Outer Hexagon with crisp icy-cyan stroke */}
          <polygon
            points="22,4 39,13.8 39,33.4 22,43.2 5,33.4 5,13.8"
            fill="#051715"
            stroke="url(#logo-hex-border)"
            strokeWidth="2.4"
            strokeLinejoin="round"
          />

          {/* 3D Isometric Cargo Cube */}
          {/* Top Face */}
          <polygon
            points="22,11.5 33.5,18 22,24.5 10.5,18"
            fill="url(#logo-cube-top)"
          />
          {/* Left Face */}
          <polygon
            points="10.5,18 22,24.5 22,36 10.5,29.5"
            fill="url(#logo-cube-left)"
          />
          {/* Right Face */}
          <polygon
            points="22,24.5 33.5,18 33.5,29.5 22,36"
            fill="url(#logo-cube-right)"
          />

          {/* Glowing Satellite Beacon at Top-Right */}
          <circle
            cx="38.5"
            cy="7.5"
            r="4.8"
            fill="#ff5500"
            filter="url(#logo-beacon-glow)"
          />
          <circle
            cx="38.5"
            cy="7.5"
            r="2.2"
            fill="#fff6eb"
          />
        </svg>
      </div>

      {/* 2. Wordmark: LogiSyncPRO */}
      <div className="flex items-center tracking-tight">
        <span 
          className="font-display font-black text-xl sm:text-2xl text-[#c5eaf8] tracking-tight transition-colors group-hover:text-white"
          style={{ letterSpacing: '-0.04em' }}
        >
          LogiSync
        </span>
        <span 
          className="font-display font-black text-xl sm:text-2xl text-[#ff5500] tracking-tight ml-0.5"
          style={{ letterSpacing: '-0.02em' }}
        >
          PRO
        </span>
      </div>
    </div>
  );
}
