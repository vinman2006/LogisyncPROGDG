import React from 'react';
import { X, ArrowRight, Sparkles, Cpu, Globe, Zap } from 'lucide-react';

export default function IntelligenceDrawer({ isOpen, onClose, onOpenDemo, onOpenAiAssistant }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity animate-in fade-in duration-300 cursor-pointer"
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-xl bg-[#061a17] border-l border-[#c2ebfa]/15 text-[#c2ebfa] h-full overflow-y-auto p-6 sm:p-10 flex flex-col justify-between shadow-2xl z-10 animate-in slide-in-from-right duration-300">
        <div>
          {/* Drawer Header */}
          <div className="flex items-center justify-between pb-6 border-b border-[#c2ebfa]/10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff5500] shadow-[0_0_10px_#ff5500]" />
              <span className="text-xs font-mono font-bold tracking-widest text-[#9fc2cf] uppercase">
                COMMAND CAPABILITIES // 2026
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close command drawer"
              className="w-9 h-9 rounded-full bg-[#08221f] border border-[#c2ebfa]/20 flex items-center justify-center text-[#c2ebfa] hover:border-[#ff5500] hover:text-[#ff5500] transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Drawer Title */}
          <div className="my-8">
            <h2 className="text-3xl sm:text-4xl font-display font-black tracking-tight text-white leading-none uppercase">
              DECENTRALIZED <br />
              <span className="text-[#ff5500]">LOGISTICS AI.</span>
            </h2>
            <p className="mt-3 text-sm text-[#9fc2cf] leading-relaxed">
              LogiSync Pro orchestrates millions of global freight movements simultaneously. High-throughput neural models continuously predict bottlenecks, bypass maritime congestion, and auto-dispatch alternative multimodal transit.
            </p>
          </div>

          {/* Modular Feature Pills: Clickable to query AI */}
          <div className="space-y-3 my-8">
            {[
              {
                id: 'neural',
                icon: <Cpu size={18} className="text-[#ff5500]" />,
                num: '01',
                title: 'Neural Dynamic Rerouting',
                desc: 'Continuous real-time optimization predicting port strikes, weather events, and customs bottlenecks 72 hours in advance.',
                query: 'How does LogiSyncPRO neural rerouting predict customs and port strikes 72 hours in advance?'
              },
              {
                id: 'global',
                icon: <Globe size={18} className="text-[#ff5500]" />,
                num: '02',
                title: 'Global Multimodal Mesh',
                desc: 'Unified visibility across Ocean, Air, Rail, and Intermodal drayage fleets under a single low-latency cryptographic telemetry stream.',
                query: 'Explain the multimodal mesh coordination across Ocean, Air, and Rail in LogiSyncPRO.'
              },
              {
                id: 'speed',
                icon: <Zap size={18} className="text-[#ff5500]" />,
                num: '03',
                title: 'Autonomous Freight Clearing',
                desc: 'Smart contract bill of ladings with automated customs documentation and instant demurrage dispute reconciliation.',
                query: 'How does automated smart contract customs documentation avoid demurrage fees in maritime transport?'
              },
            ].map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onClose();
                  if (onOpenAiAssistant) onOpenAiAssistant(item.query);
                }}
                className="p-4 rounded-2xl bg-[#082420]/80 border border-[#c2ebfa]/10 hover:border-[#ff5500]/50 transition-all cursor-pointer group hover:scale-[1.01]"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2.5">
                    {item.icon}
                    <h3 className="font-display font-bold text-sm tracking-wide text-white group-hover:text-[#ff7733] transition-colors">
                      {item.title}
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#ff5500] opacity-80">
                    {item.num}
                  </span>
                </div>
                <p className="text-xs text-[#8cb0be] pl-7 leading-relaxed">
                  {item.desc}
                </p>
                <div className="mt-2 pl-7 flex items-center gap-1 text-[10px] font-mono text-[#ff5500] opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Ask AI about this capability &rarr;</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Drawer Actions */}
        <div className="pt-6 border-t border-[#c2ebfa]/10 flex flex-col gap-3">
          {onOpenAiAssistant && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAiAssistant();
              }}
              className="w-full py-3.5 px-6 rounded-full bg-[#ff5500] text-black font-display font-black text-xs tracking-wider uppercase flex items-center justify-center gap-2 hover:bg-[#ff6924] transition-all cursor-pointer shadow-lg shadow-[#ff5500]/20 hover:scale-[1.02]"
            >
              <Sparkles size={15} />
              <span>LAUNCH GEMINI AI ASSISTANT</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenDemo();
            }}
            className="w-full py-3 px-6 rounded-full bg-[#082420] border border-[#c2ebfa]/20 text-white font-display font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 hover:border-[#ff5500] transition-all cursor-pointer"
          >
            <span>LAUNCH SIMULATION CONSOLE</span>
            <ArrowRight size={14} className="stroke-[2.5]" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-6 rounded-full bg-transparent text-[#9fc2cf] font-mono text-xs tracking-wider hover:text-white transition-colors cursor-pointer text-center"
          >
            Return to Page
          </button>
        </div>
      </div>
    </div>
  );
}
