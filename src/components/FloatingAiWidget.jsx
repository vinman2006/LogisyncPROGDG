import React, { useEffect, useRef } from 'react';
import { Sparkles, MessageSquare } from 'lucide-react';
import { gsap } from 'gsap';

export default function FloatingAiWidget({ onOpen }) {
  const ref = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Entrance: slide up with spring
    gsap.fromTo(el,
      { y: 80, opacity: 0, scale: 0.8 },
      { y: 0, opacity: 1, scale: 1, duration: 0.8, delay: 1.2, ease: 'back.out(1.7)' }
    );

    // Breathing/pulsing idle animation
    gsap.to(el, {
      y: -4,
      duration: 2.5,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
      delay: 2,
    });

    // Rotating glow ring
    if (ringRef.current) {
      gsap.to(ringRef.current, {
        rotation: 360,
        duration: 4,
        ease: 'none',
        repeat: -1,
      });
    }
  }, []);

  const handleMouseEnter = () => {
    gsap.to(ref.current, { scale: 1.08, duration: 0.3, ease: 'back.out(1.4)' });
  };

  const handleMouseLeave = () => {
    gsap.to(ref.current, { scale: 1, duration: 0.4, ease: 'elastic.out(1, 0.5)' });
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2 select-none">
      <button
        ref={ref}
        type="button"
        onClick={onOpen}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-label="Open LogiSyncPRO Gemini AI Assistant"
        className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#051713]/90 hover:bg-[#08221c] border border-[#10b981]/50 hover:border-[#10b981] text-white shadow-[0_10px_35px_rgba(0,0,0,0.6),0_0_30px_rgba(16,185,129,0.15)] backdrop-blur-md transition-all duration-200 cursor-pointer btn-ripple"
      >
        {/* Animated rotating gradient ring */}
        <span
          ref={ringRef}
          className="absolute -inset-0.5 rounded-full pointer-events-none"
          style={{
            background: 'conic-gradient(from 0deg, #10b981, #06b6d4, #6366f1, #ff5500, #10b981)',
            opacity: 0.35,
            filter: 'blur(4px)',
          }}
        />

        {/* Inner content wrapper */}
        <div className="relative flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#0c3227] border border-[#1b5c47] flex items-center justify-center">
            <Sparkles size={13} className="text-[#ff5500]" />
          </div>

          <div className="flex flex-col text-left">
            <span className="text-[11px] font-display font-black tracking-wide uppercase text-white flex items-center gap-1.5">
              <span>LogiSync AI</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] status-dot-live" />
            </span>
            <span className="text-[9px] font-mono text-[#7ea597] -mt-0.5">
              Gemini Powered
            </span>
          </div>
        </div>

        <div className="relative ml-1 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[#a0cdbe] group-hover:text-white transition-colors">
          <MessageSquare size={10} />
        </div>
      </button>
    </div>
  );
}
