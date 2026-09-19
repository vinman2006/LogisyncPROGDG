import React, { useState } from 'react';
import { X, Navigation, CheckCircle2, AlertOctagon, TrendingDown, Clock, Shield, RefreshCw } from 'lucide-react';

const CORRIDORS = [
  {
    id: 'pac',
    name: 'Trans-Pacific Corridors (Shanghai → Long Beach)',
    cargo: '8,420 TEU • High-Value Electronics',
    status: 'OPTIMAL',
    savings: '19.4 hrs saved',
    risk: 'Low (Weather neutralized)',
    transitDays: '11.4 Days',
    carbonReduction: '-16.2%',
  },
  {
    id: 'eur',
    name: 'Rotterdam Continental Rail & Barge (Rotterdam → Munich)',
    cargo: '1,200 TEU • Automotive Components',
    status: 'REROUTED',
    savings: '8.2 hrs saved',
    risk: 'Rhine Low-Water Bypass Active',
    transitDays: '36 Hours',
    carbonReduction: '-22.5%',
  },
  {
    id: 'atl',
    name: 'Trans-Atlantic Maritime (Antwerp → Newark)',
    cargo: '4,150 TEU • Pharmaceutical Cold-Chain',
    status: 'REAL-TIME TELEMETRY',
    savings: '14.1 hrs saved',
    risk: 'Zero Temperature Variance',
    transitDays: '8.1 Days',
    carbonReduction: '-12.8%',
  },
];

export default function DemoModal({ isOpen, onClose }) {
  const [selectedCorridor, setSelectedCorridor] = useState(CORRIDORS[0]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimized, setOptimized] = useState(false);

  if (!isOpen) return null;

  const handleSimulate = () => {
    setIsOptimizing(true);
    setOptimized(false);
    setTimeout(() => {
      setIsOptimizing(false);
      setOptimized(true);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 cursor-pointer"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-[#061c19] border border-[#c2ebfa]/20 rounded-3xl p-6 sm:p-8 text-[#c2ebfa] shadow-2xl z-10 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#c2ebfa]/10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5500] animate-ping-slow" />
            <h3 className="font-display font-black text-sm sm:text-base tracking-wider text-white uppercase">
              AUTONOMOUS DISPATCH CONSOLE
            </h3>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full bg-[#092b26] border border-[#c2ebfa]/20 flex items-center justify-center text-[#c2ebfa] hover:text-[#ff5500] hover:border-[#ff5500] transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Corridor Selector */}
        <div className="my-5">
          <label className="block text-[11px] font-mono tracking-widest text-[#86aab8] uppercase mb-2">
            Select Active Global Corridor
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {CORRIDORS.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setSelectedCorridor(c);
                  setOptimized(false);
                }}
                className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                  selectedCorridor.id === c.id
                    ? 'bg-[#ff5500]/15 border-[#ff5500] text-white'
                    : 'bg-[#082420] border-[#c2ebfa]/10 text-[#9fc2cf] hover:border-[#c2ebfa]/30'
                }`}
              >
                <div className="text-[10px] font-mono font-bold text-[#ff5500] uppercase mb-1">
                  {c.id.toUpperCase()} ROUTE
                </div>
                <div className="text-xs font-bold leading-snug line-clamp-2">
                  {c.name}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Simulation Output Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#041412] border border-[#c2ebfa]/15 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Navigation size={16} className="text-[#ff5500]" />
              <span className="text-xs font-bold font-mono text-white">
                {selectedCorridor.cargo}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-extrabold bg-[#092b26] text-[#c2ebfa] border border-[#c2ebfa]/20">
              {selectedCorridor.status}
            </span>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
            <div className="p-3 rounded-xl bg-[#08221e] border border-[#c2ebfa]/10">
              <div className="text-[10px] font-mono text-[#86aab8] flex items-center justify-center gap-1">
                <Clock size={11} /> ESTIMATED TRANSIT
              </div>
              <div className="text-base sm:text-lg font-black font-display text-white mt-1">
                {selectedCorridor.transitDays}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#08221e] border border-[#c2ebfa]/10">
              <div className="text-[10px] font-mono text-[#86aab8] flex items-center justify-center gap-1">
                <TrendingDown size={11} className="text-[#ff5500]" /> TIME SAVED
              </div>
              <div className="text-base sm:text-lg font-black font-display text-[#ff5500] mt-1">
                {selectedCorridor.savings}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#08221e] border border-[#c2ebfa]/10">
              <div className="text-[10px] font-mono text-[#86aab8] flex items-center justify-center gap-1">
                <Shield size={11} className="text-emerald-400" /> CO2 REDUCTION
              </div>
              <div className="text-base sm:text-lg font-black font-display text-emerald-400 mt-1">
                {selectedCorridor.carbonReduction}
              </div>
            </div>
          </div>

          {/* Risk Mitigation Assessment */}
          <div className="flex items-center gap-2 text-xs text-[#9fc2cf] bg-[#08221e]/60 p-3 rounded-xl border border-[#c2ebfa]/10">
            <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
            <span>
              <strong className="text-white">AI Assessment:</strong> {selectedCorridor.risk}. Automated predictive dispatch protocol activated.
            </span>
          </div>
        </div>

        {/* Action Trigger */}
        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            onClick={handleSimulate}
            disabled={isOptimizing}
            className="flex-1 py-3.5 px-6 rounded-full bg-[#ff5500] hover:bg-[#ff6924] text-black font-display font-black text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={isOptimizing ? 'animate-spin' : ''} />
            <span>{isOptimizing ? 'RUNNING NEURAL RECALCULATION...' : 'EXECUTE NEURAL OPTIMIZATION'}</span>
          </button>

          <button
            onClick={onClose}
            className="py-3.5 px-5 rounded-full bg-transparent border border-[#c2ebfa]/20 text-xs font-mono text-[#9fc2cf] hover:text-white transition-colors cursor-pointer"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
