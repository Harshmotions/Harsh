'use client';

import { useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

/* ─────────────────────────────────────────────────────────────────────────────
   GlowWord — cursor-reactive neon bloom for a single inline word.

   Layer stack (inside the filter, inner → outer):
     1. White hot core   — appears only when cursor is within PROXIMITY_PX
     2. Tight warm bloom — #FFF8A8, always breathing, flares on proximity
     3. Mid amber bloom  — #D4A84B, main neon colour
     4. Wide halo        — soft amber, volumetric spread
     5. Far diffusion    — near-invisible ambient spill

   Each layer's x/y shadow offset tracks the cursor direction so the
   light source feels like it's *beside* the word, not just in front.

   Breathing is driven by a requestAnimationFrame loop (not CSS keyframes)
   so it can be cleanly combined with the reactive spring values at runtime.
───────────────────────────────────────────────────────────────────────────── */

const PROXIMITY_PX    = 150;   // px radius at which cursor starts activating glow
const BREATH_PERIOD   = 2600;  // ms for one full breath cycle
const BREATH_MIN      = 0.18;  // resting glow floor (0–1)
const BREATH_RANGE    = 0.24;  // swing above floor

export default function GlowWord({ children }: { children: React.ReactNode }) {
  const wordRef = useRef<HTMLSpanElement>(null);
  const rafRef  = useRef<number>(0);

  /* ── Raw motion values ───────────────────────────────────────────────── */
  const rawProx   = useMotionValue(0);              // 0–1, cursor proximity
  const rawBreath = useMotionValue(BREATH_MIN);     // 0–1, breathing oscillation
  const rawOX     = useMotionValue(0);              // shadow x-offset toward cursor
  const rawOY     = useMotionValue(0);              // shadow y-offset toward cursor

  /* ── Springs — physics feel ──────────────────────────────────────────── */
  const prox   = useSpring(rawProx,   { stiffness: 80,  damping: 18, mass: 0.8 });
  const breath = useSpring(rawBreath, { stiffness: 22,  damping: 10, mass: 1.2 });
  const ox     = useSpring(rawOX,     { stiffness: 60,  damping: 15, mass: 0.8 });
  const oy     = useSpring(rawOY,     { stiffness: 60,  damping: 15, mass: 0.8 });

  /* ── Breathing loop ──────────────────────────────────────────────────── */
  useEffect(() => {
    let start: number | null = null;

    const tick = (ts: number) => {
      if (!start) start = ts;
      const phase = ((ts - start) % BREATH_PERIOD) / BREATH_PERIOD; // 0 → 1
      rawBreath.set(BREATH_MIN + BREATH_RANGE * (0.5 + 0.5 * Math.sin(phase * 2 * Math.PI)));
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [rawBreath]);

  /* ── Cursor proximity tracking ───────────────────────────────────────── */
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const el = wordRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = e.clientX - cx;
      const dy   = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      const p    = Math.max(0, 1 - dist / PROXIMITY_PX);

      rawProx.set(p);

      // Directional offset: up to 5px, scaled by proximity
      if (p > 0.02 && dist > 0) {
        rawOX.set((dx / dist) * p * 5);
        rawOY.set((dy / dist) * p * 5);
      } else {
        rawOX.set(0);
        rawOY.set(0);
      }
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, [rawProx, rawOX, rawOY]);

  /* ── Layered bloom filter ────────────────────────────────────────────── */
  const glowFilter = useTransform(
    [prox, breath, ox, oy],
    ([p, b, x, y]: number[]) => {
      // Proximity overrides breath intensity; blend at low proximity
      const base = Math.max(b, p * 0.9);
      const f    = (n: number) => n.toFixed(2);

      const layers: string[] = [];

      // 1. White-hot core — only when cursor enters radius
      if (p > 0.04) {
        const r = (1 + p * 5).toFixed(1);
        const a = (p * 0.88).toFixed(3);
        layers.push(`drop-shadow(${f(x * 0.2)}px ${f(y * 0.2)}px ${r}px rgba(255,255,255,${a}))`);
      }

      // 2. Tight warm bloom
      {
        const r = (3  + base * 12).toFixed(1);
        const a = (0.32 + base * 0.55).toFixed(3);
        layers.push(`drop-shadow(${f(x * 0.4)}px ${f(y * 0.4)}px ${r}px rgba(255,248,168,${a}))`);
      }

      // 3. Mid amber bloom
      {
        const r = (10 + base * 22).toFixed(1);
        const a = (0.38 + base * 0.50).toFixed(3);
        layers.push(`drop-shadow(${f(x * 0.6)}px ${f(y * 0.6)}px ${r}px rgba(212,168,75,${a}))`);
      }

      // 4. Wide halo
      {
        const r = (22 + base * 34).toFixed(1);
        const a = (0.18 + base * 0.28).toFixed(3);
        layers.push(`drop-shadow(${f(x * 0.8)}px ${f(y * 0.8)}px ${r}px rgba(212,168,75,${a}))`);
      }

      // 5. Far atmospheric diffusion
      {
        const r = (42 + base * 50).toFixed(1);
        const a = (0.07 + base * 0.10).toFixed(3);
        layers.push(`drop-shadow(${f(x)}px ${f(y)}px ${r}px rgba(212,168,75,${a}))`);
      }

      return layers.join(' ');
    },
  );

  return (
    <motion.span
      ref={wordRef}
      style={{
        /* ── Gradient text — identical to the original Hero span ── */
        background:             'linear-gradient(to bottom, #D4A84B 0%, #FFF0A8 100%)',
        WebkitBackgroundClip:   'text',
        WebkitTextFillColor:    'transparent',
        backgroundClip:         'text',
        /* ── Dynamic bloom ── */
        filter: glowFilter,
        display: 'inline',
      }}
    >
      {children}
    </motion.span>
  );
}
