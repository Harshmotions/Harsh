'use client';

import { useEffect } from 'react';
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion';
import { EASE_SETTLE, useReplayInView } from '@/components/motion/useReplayInView';

/**
 * Counts a stat like "400+" or "3M+" up from 0 when it scrolls into view.
 * Server-renders the final value, so no-JS visitors and crawlers see the real number.
 */
export default function CountUp({ value }: { value: string }) {
  const match = value.match(/^(\d+)(.*)$/);
  const target = match ? Number(match[1]) : 0;
  const suffix = match ? match[2] : value;

  const [ref, inView] = useReplayInView<HTMLSpanElement>();
  const reduceMotion = useReducedMotion();
  const count = useMotionValue(target);
  const text = useTransform(count, (v) => `${Math.round(v)}${suffix}`);

  useEffect(() => {
    if (!inView || reduceMotion || !target) return;
    count.set(0);
    const controls = animate(count, target, { duration: 2, ease: EASE_SETTLE });
    return () => controls.stop();
  }, [inView, reduceMotion, target, count]);

  if (!match) return <span>{value}</span>;
  return <motion.span ref={ref}>{text}</motion.span>;
}
