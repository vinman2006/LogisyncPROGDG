import React from 'react';
import { Sparkles } from 'lucide-react';

export default function FloatingAiWidget({ onOpen }) {
  return (
    <div className="fixed bottom-6 right-6 z-40 select-none">
      <button
        type="button"
        onClick={onOpen}
        aria-label="Open LogiSync AI Assistant"
        className="group flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#0c101d]/85 hover:bg-[#141a2e] border border-white/10 hover:border-white/20 text-white shadow-md backdrop-blur-md transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
      >
        <Sparkles size={13} className="text-[#a5b4fc] group-hover:text-white transition-colors" />
        <span className="text-xs font-medium tracking-wide text-white/80 group-hover:text-white transition-colors">
          LogiSync AI
        </span>
      </button>
    </div>
  );
}
