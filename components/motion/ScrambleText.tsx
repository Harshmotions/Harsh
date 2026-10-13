'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useReplayInView } from '@/components/motion/useReplayInView';

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=/<>';

interface ScrambleTextProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  /** Seconds to wait after the trigger before decoding. */
  delay?: number;
  /** Seconds the decode takes, left to right. */
  duration?: number;
  /** 'view' decodes when scrolled into view, 'mount' straight away. */
  trigger?: 'view' | 'mount';
  /** Decode again whenever the pointer enters. */
  replayOnHover?: boolean;
}

/**
 * Small label that decodes itself: characters cycle through random glyphs and
 * lock in from left to right. The real text is server-rendered and is what
 * screen readers get; only the visible copy is scrambled.
 */
export default function ScrambleText({
  text,
  className,
  style,
  delay = 0,
  duration = 0.8,
  trigger = 'view',
  replayOnHover = false,
}: ScrambleTextProps) {
  const [ref, inView] = useReplayInView<HTMLSpanElement>('-40px');
  const out = useRef<HTMLSpanElement>(null);
  const frame = useRef(0);
  const reduceMotion = useReducedMotion();

  const run = useCallback(() => {
    const el = out.current;
    if (!el) return;
    cancelAnimationFrame(frame.current);
    const start = performance.now();
    let lastSwap = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / (duration * 1000));
      // Glyphs change at ~25fps; faster than that reads as noise rather than decoding
      if (now - lastSwap > 40 || p === 1) {
        lastSwap = now;
        const locked = Math.floor(p * text.length);
        let s = '';
        for (let i = 0; i < text.length; i++) {
          const c = text[i];
          s += i < locked || c === ' ' || c === '·' ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0];
        }
        el.textContent = s;
      }
      if (p < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
  }, [text, duration]);

  useEffect(() => {
    if (reduceMotion || (trigger === 'view' && !inView)) return;
    // On mount, also wait out the first-visit intro if it is covering the page
    const intro =
      trigger === 'mount'
        ? parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--intro')) || 0
        : 0;
    const t = window.setTimeout(run, (delay + intro) * 1000);
    return () => {
      window.clearTimeout(t);
      cancelAnimationFrame(frame.current);
    };
  }, [inView, trigger, delay, run, reduceMotion]);

  return (
    <span
      ref={ref}
      className={className}
      style={style}
      onMouseEnter={replayOnHover && !reduceMotion ? run : undefined}
    >
      <span className="sr-only">{text}</span>
      <span ref={out} aria-hidden="true">
        {text}
      </span>
    </span>
  );
}
