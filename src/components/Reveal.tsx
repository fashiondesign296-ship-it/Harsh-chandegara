'use client';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/** Scroll-triggered reveal. Skipped entirely when the visitor prefers reduced motion. */
export default function Reveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !ref.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const tween = gsap.fromTo(ref.current, { autoAlpha: 0, y: 36 },
      { autoAlpha: 1, y: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: ref.current, start: 'top 85%', once: true } });
    return () => { tween.scrollTrigger?.kill(); tween.kill(); };
  }, []);
  return <div ref={ref} className={className}>{children}</div>;
}
