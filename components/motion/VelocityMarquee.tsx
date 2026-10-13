'use client';

import { useRef } from 'react';
import {
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from 'framer-motion';

interface VelocityMarqueeProps {
  items: string[];
  /** Drift speed in % of one copy per second; the sign sets the resting direction. */
  baseVelocity?: number;
}

// Keep the offset inside one copy's width so the 4 copies loop seamlessly
const wrap = (min: number, max: number, v: number) => {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
};

const COPIES = 4;

/**
 * Oversized text band that drifts on its own and speeds up / flips direction
 * with the visitor's scroll. Decorative: hidden from assistive tech.
 */
export default function VelocityMarquee({ items, baseVelocity = -3 }: VelocityMarqueeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const reduceMotion = useReducedMotion();

  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(velocity, { damping: 50, stiffness: 400 });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 4], { clamp: false });
  const x = useTransform(baseX, (v) => `${wrap(-100 / COPIES, 0, v)}%`);
  const direction = useRef(1);

  useAnimationFrame((_, delta) => {
    if (!inView || reduceMotion) return;
    let moveBy = direction.current * baseVelocity * (delta / 1000);
    const factor = velocityFactor.get();
    if (factor < 0) direction.current = -1;
    else if (factor > 0) direction.current = 1;
    moveBy += direction.current * moveBy * factor;
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="relative overflow-hidden py-10 md:py-16 select-none pointer-events-none"
      style={{
        borderTop: '1px solid var(--border)',
        maskImage: 'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)',
        WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)',
      }}
    >
      <motion.div className="flex w-max whitespace-nowrap" style={{ x }}>
        {Array.from({ length: COPIES }, (_, copy) => (
          <div key={copy} className="flex shrink-0 items-center">
            {items.map((item, i) => (
              <span key={i} className="flex items-center">
                <span
                  className="font-display font-bold px-[0.32em]"
                  style={{
                    fontSize: 'clamp(44px, 8.5vw, 132px)',
                    lineHeight: 1.05,
                    letterSpacing: '-0.035em',
                    // Alternate solid and outlined words
                    ...(i % 2 === 0
                      ? { color: 'var(--text)' }
                      : { color: 'transparent', WebkitTextStroke: '1.5px rgba(147,197,253,0.55)' }),
                  }}
                >
                  {item}
                </span>
                <span
                  className="shrink-0 rounded-full"
                  style={{
                    width: 'clamp(8px, 1.1vw, 16px)',
                    height: 'clamp(8px, 1.1vw, 16px)',
                    background: 'var(--accent)',
                    boxShadow: '0 0 18px rgba(79,142,247,0.8)',
                  }}
                />
              </span>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
