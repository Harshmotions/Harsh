'use client';

import { motion, type Variants } from 'framer-motion';
import { EASE_SETTLE, useReplayInView } from '@/components/motion/useReplayInView';

const container: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.14 } } };
const rise: Variants = {
  hidden: { y: '105%' },
  show: { y: '0%', transition: { duration: 1.5, ease: EASE_SETTLE } },
};

// Same three-part treatment as the nav logo, fading out towards the bottom edge
const fade = (from: string) => ({
  backgroundImage: `linear-gradient(180deg, ${from} 0%, ${from} 55%, rgba(6,11,20,0) 100%)`,
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  color: 'transparent',
});

const WORDS = [
  { text: 'motion', style: { fontFamily: 'var(--font-sora)', fontWeight: 800, letterSpacing: '-0.04em', ...fade('#4F8EF7') } },
  { text: 'by', style: { fontFamily: 'var(--font-playfair)', fontStyle: 'italic' as const, fontWeight: 400, ...fade('rgba(240,237,232,0.85)') } },
  { text: 'harsh', style: { fontFamily: 'var(--font-sora)', fontWeight: 400, letterSpacing: '-0.04em', ...fade('#F0EDE8') } },
];

/** Oversized footer logotype that rises into view. Decorative: the real name is in the footer logo above. */
export default function FooterWordmark() {
  const [ref, inView] = useReplayInView<HTMLDivElement>('-40px');
  return (
    <motion.div
      ref={ref}
      aria-hidden="true"
      // The wordmark is ~7.4em wide, so font-size = container width / 7.6 fills the
      // content width edge to edge (container padding: 24px phones, 48px md+, max 1184px)
      className="flex items-baseline justify-center select-none pointer-events-none whitespace-nowrap text-[length:calc((100vw-48px)/7.6)] md:text-[length:min(calc((100vw-96px)/7.6),155px)]"
      style={{ lineHeight: 0.9, gap: '0.06em' }}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      variants={container}
    >
      {WORDS.map((w) => (
        <span key={w.text} className="inline-block shrink-0 overflow-hidden pb-[0.16em] -mb-[0.16em] pr-[0.06em]">
          <motion.span className="inline-block" variants={rise} style={w.style}>
            {w.text}
          </motion.span>
        </span>
      ))}
    </motion.div>
  );
}
