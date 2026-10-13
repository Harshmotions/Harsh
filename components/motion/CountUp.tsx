'use client';

import { useEffect, useRef } from 'react';
import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from 'framer-motion';

/**
 * Counts a stat like "400+" or "3M+" up from 0 when it scrolls into view.
 * Server-renders the final value, so no-JS visitors and crawlers see the real number.
 */
export default function CountUp({ value }: { value: string }) {
  const match = value.match(/^(\d+)(.*)$/);
  const target = match ? Number(match[1]) : 0;
  const suffix = match ? match[2] : value;

  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const reduceMotion = useReducedMotion();
  const count = useMotionValue(target);
  const text = useTransform(count, (v) => `${Math.round(v)}${suffix}`);

  useEffect(() => {
    if (!inView || reduceMotion || !target) return;
    count.set(0);
    const controls = animate(count, target, { duration: 1.6, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [inView, reduceMotion, target, count]);

  if (!match) return <span>{value}</span>;
  return <motion.span ref={ref}>{text}</motion.span>;
}
