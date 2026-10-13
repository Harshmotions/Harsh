'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

interface ImageTrailProps {
  images: string[];
  /** Element whose area the pointer has to be over (the hero section). */
  targetRef: React.RefObject<HTMLElement | null>;
}

const POOL = 12;
const SPACING = 110; // px of pointer travel between frames

/**
 * Frames from real projects that open up along the cursor's path and drift
 * after it before closing again. Desktop (mouse) only; the images load the
 * first time the pointer enters, so they never compete with the page load.
 */
export default function ImageTrail({ images, targetRef }: ImageTrailProps) {
  const pool = useRef<(HTMLImageElement | null)[]>([]);
  const [active, setActive] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const target = targetRef.current;
    if (!target || images.length === 0 || reduceMotion) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    let last: { x: number; y: number } | null = null;
    let slot = 0;
    let shown = 0;
    let z = 1;

    const onEnter = () => setActive(true);

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const rect = target.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (!last) {
        last = { x, y };
        return;
      }
      const dx = x - last.x;
      const dy = y - last.y;
      if (Math.hypot(dx, dy) < SPACING) return;
      last = { x, y };

      const el = pool.current[slot];
      slot = (slot + 1) % POOL;
      if (!el) return;
      el.src = images[shown++ % images.length];
      el.style.zIndex = String(z++);

      // Lean into the direction of travel, then drift on along it while closing
      const tilt = Math.max(-12, Math.min(12, dx * 0.08)) + (Math.random() - 0.5) * 6;
      const at = (ox: number, oy: number, s: number, r: number) =>
        `translate3d(${x + ox}px, ${y + oy}px, 0) translate(-50%, -50%) scale(${s}) rotate(${r}deg)`;
      el.getAnimations().forEach((a) => a.cancel());
      el.animate(
        [
          { transform: at(0, 0, 0.7, tilt * 1.6), clipPath: 'inset(50% 50% 50% 50% round 14px)', opacity: 1 },
          { transform: at(dx * 0.15, dy * 0.15, 1, tilt), clipPath: 'inset(0% 0% 0% 0% round 14px)', opacity: 1, offset: 0.28 },
          { transform: at(dx * 0.45, dy * 0.45, 1, tilt * 0.6), clipPath: 'inset(0% 0% 0% 0% round 14px)', opacity: 1, offset: 0.62 },
          { transform: at(dx * 0.7, dy * 0.7 + 24, 0.86, tilt * 0.4), clipPath: 'inset(50% 50% 50% 50% round 14px)', opacity: 0.6 },
        ],
        { duration: 1400, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'forwards' },
      );
    };

    const onLeave = () => {
      last = null;
    };

    target.addEventListener('pointerenter', onEnter);
    target.addEventListener('pointermove', onMove);
    target.addEventListener('pointerleave', onLeave);
    return () => {
      target.removeEventListener('pointerenter', onEnter);
      target.removeEventListener('pointermove', onMove);
      target.removeEventListener('pointerleave', onLeave);
    };
  }, [images, targetRef, reduceMotion]);

  // Warm the cache once the pointer is in the hero, so frames open instantly
  useEffect(() => {
    if (!active) return;
    images.forEach((src) => {
      const img = new Image();
      img.decoding = 'async';
      img.src = src;
    });
  }, [active, images]);

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 5 }}>
      {Array.from({ length: POOL }, (_, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={i}
          ref={(el) => {
            pool.current[i] = el;
          }}
          alt=""
          decoding="async"
          className="absolute top-0 left-0 object-cover"
          style={{
            width: 'clamp(130px, 11vw, 170px)',
            aspectRatio: '4 / 5',
            borderRadius: 14,
            opacity: 0,
            boxShadow: '0 18px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(147,197,253,0.18)',
            willChange: 'transform',
          }}
        />
      ))}
    </div>
  );
}
