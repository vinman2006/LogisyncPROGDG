// Animation utilities using GSAP + Framer Motion
// Central animation config for LogiSyncPRO website

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextPlugin } from 'gsap/TextPlugin';

gsap.registerPlugin(ScrollTrigger, TextPlugin);

// ─── Scroll-triggered fade-in-up hook ─────────────────────────────────────
export function useScrollReveal(options = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const {
      y = 40,
      opacity = 0,
      duration = 0.7,
      delay = 0,
      stagger = 0,
      start = 'top 85%',
    } = options;

    const children = stagger > 0 ? el.children : null;
    const targets = children ? Array.from(children) : el;

    gsap.fromTo(
      targets,
      { y, opacity, filter: 'blur(4px)' },
      {
        y: 0,
        opacity: 1,
        filter: 'blur(0px)',
        duration,
        delay,
        stagger,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start,
          toggleActions: 'play none none none',
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(t => {
        if (t.trigger === el) t.kill();
      });
    };
  }, []);

  return ref;
}

// ─── Counter animation hook ───────────────────────────────────────────────
export function useCountUp(end, duration = 2, start = 0) {
  const [value, setValue] = useState(start);
  const ref = useRef(null);
  const triggered = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !triggered.current) {
          triggered.current = true;
          const obj = { val: start };
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
  }, [end, duration, start]);

  return { value, ref };
}

// ─── Magnetic button effect ───────────────────────────────────────────────
export function useMagneticEffect(strength = 0.4) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMouseMove = (e) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * strength;
      const dy = (e.clientY - cy) * strength;
      gsap.to(el, { x: dx, y: dy, duration: 0.3, ease: 'power2.out' });
    };

    const handleMouseLeave = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
    };

    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [strength]);

  return ref;
}

// ─── Parallax scroll hook ─────────────────────────────────────────────────
export function useParallax(speed = 0.2) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    gsap.to(el, {
      yPercent: speed * 100,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach(t => {
        if (t.trigger === el) t.kill();
      });
    };
  }, [speed]);

  return ref;
}

// ─── Text scramble animation ──────────────────────────────────────────────
export function useTextScramble(text, speed = 40) {
  const [displayed, setDisplayed] = useState('');
  const chars = '!<>-_\\/[]{}—=+*^?#01ABCDEFGHIJKLMNOPQRSTUVWXYZabcdef';

  useEffect(() => {
    let frame = 0;
    let resolve;
    const promise = new Promise(r => (resolve = r));

    const update = () => {
      let output = '';
      let complete = 0;
      for (let i = 0; i < text.length; i++) {
        if (frame >= (i * speed) / text.length) {
          complete++;
          output += text[i];
        } else {
          output += chars[Math.floor(Math.random() * chars.length)];
        }
      }
      setDisplayed(output);
      if (complete < text.length) {
        frame++;
        requestAnimationFrame(update);
      } else {
        resolve();
      }
    };

    requestAnimationFrame(update);
    return () => (frame = text.length * 100);
  }, [text]);

  return displayed;
}

export { gsap, ScrollTrigger };
