'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

interface ImageTrailProps {
  images: string[];
  /** Element whose area the pointer has to be over (the hero section). */
  targetRef: React.RefObject<HTMLElement | null>;
}

const POOL = 26;
const SPACING = 105; // px of pointer travel between frames

// Life of one frame, in ms: it opens, keeps drifting with the cursor's momentum,
// then shrinks away to nothing.
const OPEN = 520;
const CLOSE_AT = 1350;
const CLOSE = 650;

// With the cursor on the move, frames arrive faster than they expire. Past this
// many open at once, the oldest starts shrinking early (and a bit quicker) so it
// always zooms out; an image element is only reused once its frame has fully closed.
const MAX_OPEN = 12;
const CLOSE_EARLY = 420;

// How much of the cursor's speed a frame inherits, and how fast that momentum fades
const CARRY = 0.42;
const FRICTION_MS = 520; // time constant of the exponential slow-down

const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

interface Frame {
  el: HTMLImageElement;
  born: number;
  x: number;
  y: number;
  vx: number; // px per ms
  vy: number;
  tilt: number;
  closeAt: number; // when it starts shrinking
  closeDur: number;
}

/**
 * Frames from real projects that open along the cursor's path. Each one picks up
 * the cursor's velocity and keeps drifting the way it was going, slowing down
 * smoothly, so a quick flick throws frames further than a slow glide. After a
 * short hold it shrinks to zero. Desktop (mouse) only; the images load the first
 * time the pointer enters, so they never compete with the page load.
 */
export default function ImageTrail({ images, targetRef }: ImageTrailProps) {
  const pool = useRef<(HTMLImageElement | null)[]>([]);
  const [active, setActive] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const target = targetRef.current;
    if (!target || images.length === 0 || reduceMotion) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const live: Frame[] = [];
    let lastSpawn: { x: number; y: number } | null = null;
    let prev: { x: number; y: number; t: number } | null = null;
    let vx = 0;
    let vy = 0;
    // A shuffled deck of every frame: each one shows once before any repeats, and a new deck
    // never starts with the frame that just showed
    let deck: string[] = [];
    let lastSrc = '';
    const nextImage = () => {
      if (deck.length === 0) {
        deck = [...images];
        for (let i = deck.length - 1; i > 0; i--) {
          const j = (Math.random() * (i + 1)) | 0;
          [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        if (deck.length > 1 && deck[deck.length - 1] === lastSrc) [deck[0], deck[deck.length - 1]] = [deck[deck.length - 1], deck[0]];
      }
      lastSrc = deck.pop()!;
      return lastSrc;
    };
    let z = 1;
    let raf = 0;
    let lastTick = 0;

    const render = (f: Frame, now: number) => {
      const age = now - f.born;
      // Shrinks from whatever size it had reached, so an early close never jumps
      let scale = age < OPEN ? easeOutExpo(age / OPEN) : 1;
      if (now >= f.closeAt) scale *= 1 - easeInOutCubic(Math.min(1, (now - f.closeAt) / f.closeDur));
      // Tilt eases back towards level as the frame loses momentum
      const speed = Math.hypot(f.vx, f.vy);
      const rot = f.tilt * Math.min(1, 0.35 + speed * 1.2);
      f.el.style.transform = `translate3d(${f.x}px, ${f.y}px, 0) translate(-50%, -50%) scale(${scale}) rotate(${rot}deg)`;
    };

    const tick = (now: number) => {
      const dt = Math.min(48, now - (lastTick || now));
      lastTick = now;
      const decay = Math.exp(-dt / FRICTION_MS);
      for (let i = live.length - 1; i >= 0; i--) {
        const f = live[i];
        f.x += f.vx * dt;
        f.y += f.vy * dt;
        f.vx *= decay;
        f.vy *= decay;
        if (now >= f.closeAt + f.closeDur) {
          f.el.style.opacity = '0';
          live.splice(i, 1);
        } else {
          render(f, now);
        }
      }
      raf = live.length ? requestAnimationFrame(tick) : 0;
      if (!raf) lastTick = 0;
    };

    const onEnter = () => setActive(true);

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const rect = target.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const now = performance.now();

      // Smoothed cursor velocity (px/ms)
      if (prev) {
        const dt = Math.max(1, now - prev.t);
        vx = vx * 0.6 + ((x - prev.x) / dt) * 0.4;
        vy = vy * 0.6 + ((y - prev.y) / dt) * 0.4;
      }
      prev = { x, y, t: now };

      if (!lastSpawn) {
        lastSpawn = { x, y };
        return;
      }
      if (Math.hypot(x - lastSpawn.x, y - lastSpawn.y) < SPACING) return;
      lastSpawn = { x, y };

      // Too many open: send the oldest still-open frames on their way out early
      const open = live.filter((f) => now < f.closeAt);
      for (let i = 0; i <= open.length - MAX_OPEN; i++) {
        open[i].closeAt = now;
        open[i].closeDur = CLOSE_EARLY;
      }
      // Only ever use an element whose frame has finished; never cut one off
      const el = pool.current.find((img) => img && !live.some((f) => f.el === img));
      if (!el) return;

      el.src = nextImage();
      el.style.zIndex = String(z++);
      el.style.opacity = '1';
      // Cap the throw so a violent flick doesn't fling frames off screen
      const cap = 2.6;
      const k = Math.min(1, cap / Math.max(0.001, Math.hypot(vx, vy)));
      const f: Frame = {
        el,
        born: now,
        x,
        y,
        vx: vx * k * CARRY,
        vy: vy * k * CARRY,
        tilt: Math.max(-14, Math.min(14, vx * 9)) + (Math.random() - 0.5) * 5,
        closeAt: now + CLOSE_AT,
        closeDur: CLOSE,
      };
      live.push(f);
      render(f, now);
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const onLeave = () => {
      lastSpawn = null;
      prev = null;
      vx = 0;
      vy = 0;
    };

    target.addEventListener('pointerenter', onEnter);
    target.addEventListener('pointermove', onMove);
    target.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
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
            width: 'clamp(120px, 10vw, 156px)',
            aspectRatio: '1 / 1',
            borderRadius: 14,
            opacity: 0,
            transform: 'scale(0)',
            boxShadow: '0 18px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(147,197,253,0.18)',
            willChange: 'transform',
          }}
        />
      ))}
    </div>
  );
}
