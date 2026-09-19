import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * AnimatedSection — wrapper that reveals children on scroll with GSAP
 * Supports: fade-up, fade-left, fade-right, scale-in, clip-reveal
 */
export function AnimatedSection({
  children,
  className = '',
  animation = 'fade-up',
  delay = 0,
  duration = 0.8,
  stagger = 0,
  start = 'top 88%',
  style = {},
}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const targets = stagger > 0 ? Array.from(el.children) : el;

    const fromVars = {
      'fade-up':    { y: 50, opacity: 0, filter: 'blur(5px)' },
      'fade-down':  { y: -40, opacity: 0, filter: 'blur(4px)' },
      'fade-left':  { x: -60, opacity: 0, filter: 'blur(4px)' },
      'fade-right': { x: 60, opacity: 0, filter: 'blur(4px)' },
      'scale-in':   { scale: 0.85, opacity: 0, filter: 'blur(6px)' },
      'clip-reveal':{ clipPath: 'inset(0 100% 0 0)', opacity: 1 },
    }[animation] || { y: 40, opacity: 0 };

    const toVars = {
      'fade-up':    { y: 0, opacity: 1, filter: 'blur(0px)' },
      'fade-down':  { y: 0, opacity: 1, filter: 'blur(0px)' },
      'fade-left':  { x: 0, opacity: 1, filter: 'blur(0px)' },
      'fade-right': { x: 0, opacity: 1, filter: 'blur(0px)' },
      'scale-in':   { scale: 1, opacity: 1, filter: 'blur(0px)' },
      'clip-reveal':{ clipPath: 'inset(0 0% 0 0)', opacity: 1 },
    }[animation] || { y: 0, opacity: 1 };

    const tween = gsap.fromTo(targets, fromVars, {
      ...toVars,
      duration,
      delay,
      stagger,
      ease: animation === 'clip-reveal' ? 'power4.inOut' : 'power3.out',
      scrollTrigger: {
        trigger: el,
        start,
        toggleActions: 'play none none none',
      },
    });

    return () => {
      tween.kill();
      ScrollTrigger.getAll().forEach(t => {
        if (t.vars?.trigger === el) t.kill();
      });
    };
  }, [animation, delay, duration, stagger, start]);

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}

/**
 * AnimatedCounter — GSAP-powered number counter on scroll-in
 */
export function AnimatedCounter({ end, prefix = '', suffix = '', duration = 2.2, className = '' }) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  const triggered = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !triggered.current) {
          triggered.current = true;
          const obj = { val: 0 };
          gsap.to(obj, {
            val: end,
            duration,
            ease: 'power2.out',
            onUpdate: () => setValue(Math.round(obj.val)),
          });
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}{value.toLocaleString()}{suffix}
    </span>
  );
}

/**
 * MagneticButton — magnetic pull effect on hover
 */
export function MagneticButton({ children, strength = 0.35, className = '', onClick, type = 'button' }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMove = (e) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      gsap.to(el, {
        x: (e.clientX - cx) * strength,
        y: (e.clientY - cy) * strength,
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    const handleLeave = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
    };

    el.addEventListener('mousemove', handleMove);
    el.addEventListener('mouseleave', handleLeave);
    return () => {
      el.removeEventListener('mousemove', handleMove);
      el.removeEventListener('mouseleave', handleLeave);
    };
  }, [strength]);

  return (
    <button ref={ref} type={type} className={className} onClick={onClick}>
      {children}
    </button>
  );
}

/**
 * GlowCard — card with animated gradient glow that follows mouse cursor
 */
export function GlowCard({ children, className = '', glowColor = '#10b981' }) {
  const ref = useRef(null);

  const handleMouseMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    el.style.setProperty('--glow-x', `${x}px`);
    el.style.setProperty('--glow-y', `${y}px`);
    el.style.setProperty('--glow-color', glowColor);
  };

  return (
    <div
      ref={ref}
      className={`glow-card ${className}`}
      onMouseMove={handleMouseMove}
    >
      {children}
    </div>
  );
}

/**
 * TextReveal — staggered word-by-word reveal animation
 */
export function TextReveal({ text, className = '', delay = 0 }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const words = el.querySelectorAll('.word');

    gsap.fromTo(
      words,
      { y: '100%', opacity: 0 },
      {
        y: '0%',
        opacity: 1,
        duration: 0.7,
        stagger: 0.06,
        delay,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
      }
    );
  }, [delay]);

  return (
    <div ref={ref} className={className} aria-label={text}>
      {text.split(' ').map((word, i) => (
        <span
          key={i}
          className="inline-block overflow-hidden"
          style={{ marginRight: '0.25em' }}
        >
          <span className="word inline-block">{word}</span>
        </span>
      ))}
    </div>
  );
}

/**
 * FloatingOrb — ambient animated gradient orb for background depth
 */
export function FloatingOrb({ size = 600, color = '#10b981', x = '20%', y = '30%', speed = 8, opacity = 0.12 }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    gsap.to(el, {
      x: `+=${Math.random() * 60 - 30}`,
      y: `+=${Math.random() * 60 - 30}`,
      duration: speed,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
    });
  }, [speed]);

  return (
    <div
      ref={ref}
      className="absolute pointer-events-none rounded-full"
      style={{
        width: size,
        height: size,
        left: x,
        top: y,
        background: `radial-gradient(circle, ${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
        transform: 'translate(-50%, -50%)',
        filter: 'blur(80px)',
        zIndex: 0,
      }}
    />
  );
}

/**
 * PulseRing — animated pulsing ring for live status indicators
 */
export function PulseRing({ color = '#10b981', size = 12 }) {
  return (
    <span className="relative inline-flex" style={{ width: size, height: size }}>
      <span
        className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping"
        style={{ background: color }}
      />
      <span
        className="relative inline-flex rounded-full"
        style={{ width: size, height: size, background: color }}
      />
    </span>
  );
}
