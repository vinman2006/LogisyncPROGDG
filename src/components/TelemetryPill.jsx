import React, { useState } from 'react';
import { X, Sparkles, TrendingUp, AlertTriangle } from 'lucide-react';

export default function TelemetryPill({ onOpenDemo }) {
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  if (dismissed) {
    return (
      <button
        onClick={() => setDismissed(false)}
        className="fixed bottom-5 left-5 z-40 px-3 py-1.5 rounded-full bg-[#051715]/90 border border-[#c2ebfa]/20 text-[10px] font-mono tracking-widest text-[#9fc2cf] hover:text-[#c2ebfa] transition-all cursor-pointer backdrop-blur-md"
      >
        + SHOW LIVE TELEMETRY
      </button>
    );
  }

  return (
    <aside aria-label="System Updates" className="fixed bottom-5 left-4 sm:left-6 md:left-8 z-40 max-w-sm sm:max-w-md select-none">
      {/* Reference-exact pill style: white rounded pill with dark text */}
      <div className="flex items-center gap-2.5 bg-[#f2f5f6] text-[#071f1c] px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full shadow-2xl shadow-black/60 border border-white/60 transition-transform duration-200 hover:scale-[1.02]">
        {/* Black "UPDATE" / "INTELLIGENCE" pill tag */}
        <span className="bg-[#071f1c] text-[#f2f5f6] text-[9px] sm:text-[10px] font-black tracking-widest px-2 py-0.5 rounded-full uppercase font-sans">
          UPDATE
        </span>

        {/* Dynamic update message */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs sm:text-[13px] font-bold tracking-tight hover:text-[#ff5500] transition-colors truncate cursor-pointer text-left"
        >
          Autonomous Route Engine v4.8 Live.
        </button>

        {/* Close Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setDismissed(true);
          }}
          aria-label="Dismiss announcement"
          className="p-1 rounded-full hover:bg-black/10 text-[#071f1c]/70 hover:text-[#071f1c] transition-colors cursor-pointer ml-1"
        >
          <X size={13} className="stroke-[2.5]" />
        </button>
      </div>

      {/* Expandable micro-card when clicking the pill */}
      {expanded && (
        <div className="mt-2 p-4 rounded-2xl bg-[#051715]/95 border border-[#c2ebfa]/20 backdrop-blur-xl text-[#c2ebfa] shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#c2ebfa]/10">
            <span className="text-[10px] font-mono tracking-widest text-[#ff5500] font-bold flex items-center gap-1.5">
              <Sparkles size={12} /> REAL-TIME AI TELEMETRY
            </span>
            <span className="text-[10px] text-[#86aab8]">SYNCED 2S AGO</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-lg bg-[#071f1c]/80 border border-[#c2ebfa]/10">
              <div className="text-[10px] text-[#86aab8]">ACTIVE NODES</div>
              <div className="text-base font-bold font-display text-white">128,490</div>
            </div>
            <div className="p-2 rounded-lg bg-[#071f1c]/80 border border-[#c2ebfa]/10">
              <div className="text-[10px] text-[#86aab8]">DELAYS AVOIDED</div>
              <div className="text-base font-bold font-display text-[#ff5500]">94.2%</div>
            </div>
          </div>

          <button
            onClick={() => {
              setExpanded(false);
              onOpenDemo();
            }}
            className="w-full mt-3 py-1.5 text-center text-[11px] font-bold tracking-widest uppercase bg-[#ff5500] text-black rounded-lg hover:bg-[#ff6d1f] transition-colors cursor-pointer"
          >
            Launch Command Dashboard &rarr;
          </button>
        </div>
      )}
    </aside>
  );
}
