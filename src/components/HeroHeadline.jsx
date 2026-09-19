import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export default function HeroHeadline({ onOpenDrawer }) {
  const headlineLines = ['THE FUTURE', 'OF GLOBAL', 'LOGISTICS.'];

  return (
    <section className="relative z-20 flex flex-col items-center justify-center min-h-[85vh] sm:min-h-[88vh] px-4 sm:px-6 pt-24 pb-12 text-center select-none">
      {/* Massive Bold Hero Typography */}
      <div className="flex flex-col items-center justify-center w-full max-w-7xl mx-auto my-2">
        <h1 className="hero-headline flex flex-col items-center tracking-tighter leading-[0.84] sm:leading-[0.86] text-center w-full">
          {headlineLines.map((line, idx) => (
            <span
              key={idx}
              className={`inline-block w-full transition-all duration-300 transform hover:scale-[1.01] ${
                idx === 0 ? 'text-white' : 'text-[#c5eaf8]'
              }`}
              style={{
                fontSize: 'clamp(3.2rem, 11.8vw, 9.8rem)',
                fontFamily: "'Unbounded', sans-serif",
                fontWeight: 900,
                letterSpacing: '-0.045em',
                lineHeight: 0.88,
              }}
            >
              {line}
            </span>
          ))}
        </h1>
      </div>

      {/* Primary CTA */}
      <div className="mt-8 sm:mt-11 flex items-center justify-center z-30">
        <button
          onClick={onOpenDrawer}
          className="pill-btn-white px-8 sm:px-11 py-3.5 sm:py-4 rounded-full text-xs sm:text-sm font-extrabold tracking-widest uppercase flex items-center gap-2.5 cursor-pointer group shadow-xl"
        >
          <span>ENTER LOGISYNC</span>
          <ArrowUpRight
            size={16}
            className="stroke-[3] text-black transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1"
          />
        </button>
      </div>
    </section>
  );
}
