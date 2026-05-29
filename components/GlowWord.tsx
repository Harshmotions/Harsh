'use client';

import { useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

/* ─────────────────────────────────────────────────────────────────────────────
   GlowWord — neon-sign bloom effect for a single inline word.

   Visual model (from outer to inner):
     ∞. Downward light pool  — always on, casts "floor light" below the word
     5. Far atmospheric haze — wide amber cloud, very subtle
     4. Wide halo            — main volumetric spread
     3. Mid amber bloom      — primary neon colour
     2. Tight warm bloom     — bright amber-white right at letterform edges
     1. White edge glow      — the "tube" surface, near-white hot

   Text is near-white (#FFFBF0) — colour comes from the bloom, not the fill.
   Breathing oscillates the whole stack; cursor proximity flares it.
───────────────────────────────────────────────────────────────────────────── */

const PROXIMITY_PX  = 160;
const BREATH_PERIOD = 2400;   // ms per cycle
const BREATH_MIN    = 0.30;   // resting floor  (higher = always-visible glow)
const BREATH_RANGE  = 0.40;   // swing amplitude (bigger = more dramatic pulse)

export default function GlowWord({ children }: { children: React.ReactNode }) {
  const wordRef = useRef<HTMLSpanElement>(null);
  const rafRef  = useRef<number>(0);

  /* ── Raw motion values ───────────────────────────────────────────────── */
  const rawProx   = useMotionValue(0);
  const rawBreath = useMotionValue(BREATH_MIN);
  const rawOX     = useMotionValue(0);
  const rawOY     = useMotionValue(0);

  /* ── Springs ─────────────────────────────────────────────────────────── */
  const prox   = useSpring(rawProx,   { stiffness: 75,  damping: 18, mass: 0.8 });
  const breath = useSpring(rawBreath, { stiffness: 18,  damping: 9,  mass: 1.4 });
  const ox     = useSpring(rawOX,     { stiffness: 55,  damping: 14, mass: 0.9 });
  const oy     = useSpring(rawOY,     { stiffness: 55,  damping: 14, mass: 0.9 });

  /* ── Breathing RAF loop ──────────────────────────────────────────────── */
  useEffect(() => {
    let start: number | null = null;
    const tick = (ts: number) => {
      if (!start) start = ts;
      const phase = ((ts - start) % BREATH_PERIOD) / BREATH_PERIOD;
      rawBreath.set(BREATH_MIN + BREATH_RANGE * (0.5 + 0.5 * Math.sin(phase * 2 * Math.PI)));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [rawBreath]);

  /* ── Cursor proximity ────────────────────────────────────────────────── */
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const el = wordRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      const p = Math.max(0, 1 - dist / PROXIMITY_PX);
      rawProx.set(p);
      if (p > 0.02 && dist > 0) {
        rawOX.set((dx / dist) * p * 6);
        rawOY.set((dy / dist) * p * 6);
      } else {
        rawOX.set(0);
        rawOY.set(0);
      }
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, [rawProx, rawOX, rawOY]);

  /* ── 6-layer neon bloom filter ───────────────────────────────────────── */
  const glowFilter = useTransform(
    [prox, breath, ox, oy],
    ([p, b, x, y]: number[]) => {
      // Proximity flares breath on top
      const t = Math.min(1, Math.max(b, b + p * 0.85));
      const f = (n: number) => n.toFixed(2);

      // ── Layer 1: white tube edge ──────────────────────────────────────
      const l1r = (1.5 + t * 4).toFixed(1);
      const l1a = (0.70 + t * 0.30).toFixed(3);
      const l1 = `drop-shadow(${f(x * 0.15)}px ${f(y * 0.15)}px ${l1r}px rgba(255,255,255,${l1a}))`;

      // ── Layer 2: tight warm bloom (#FFF8A0) ───────────────────────────
      const l2r = (4 + t * 14).toFixed(1);
      const l2a = (0.55 + t * 0.42).toFixed(3);
      const l2 = `drop-shadow(${f(x * 0.3)}px ${f(y * 0.3)}px ${l2r}px rgba(255,248,160,${l2a}))`;

      // ── Layer 3: mid amber (#D4A84B) ──────────────────────────────────
      const l3r = (12 + t * 26).toFixed(1);
      const l3a = (0.50 + t * 0.45).toFixed(3);
      const l3 = `drop-shadow(${f(x * 0.55)}px ${f(y * 0.55)}px ${l3r}px rgba(212,168,75,${l3a}))`;

      // ── Layer 4: wide halo ────────────────────────────────────────────
      const l4r = (28 + t * 42).toFixed(1);
      const l4a = (0.28 + t * 0.32).toFixed(3);
      const l4 = `drop-shadow(${f(x * 0.75)}px ${f(y * 0.75)}px ${l4r}px rgba(212,168,75,${l4a}))`;

      // ── Layer 5: far atmospheric haze ─────────────────────────────────
      const l5r = (55 + t * 65).toFixed(1);
      const l5a = (0.10 + t * 0.14).toFixed(3);
      const l5 = `drop-shadow(${f(x)}px ${f(y)}px ${l5r}px rgba(184,132,30,${l5a}))`;

      // ── Layer 6: downward light pool (always on, floor illumination) ──
      // Fixed downward offset, scales with glow intensity
      const l6y  = (16 + t * 30).toFixed(1);
      const l6r  = (30 + t * 55).toFixed(1);
      const l6a  = (0.18 + t * 0.22).toFixed(3);
      const l6 = `drop-shadow(0px ${l6y}px ${l6r}px rgba(212,168,75,${l6a}))`;

      return [l1, l2, l3, l4, l5, l6].join(' ');
    },
  );

  return (
    <motion.span
      ref={wordRef}
      style={{
        /* Near-white "neon tube" — colour is in the bloom, not the fill */
        color: '#FFFBF0',
        WebkitTextFillColor: '#FFFBF0',
        filter: glowFilter,
        display: 'inline',
      }}
    >
      {children}
    </motion.span>
  );
}
