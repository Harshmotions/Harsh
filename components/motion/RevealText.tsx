'use client';

import { motion, type Variants } from 'framer-motion';
import { EASE_SETTLE, useReplayInView } from '@/components/motion/useReplayInView';

interface RevealTextProps {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'p';
  className?: string;
  style?: React.CSSProperties;
  /** Seconds before the first word starts. */
  delay?: number;
}

const container: Variants = {
  hidden: {},
  show: (delay: number) => ({ transition: { staggerChildren: 0.08, delayChildren: delay } }),
};

const word: Variants = {
  hidden: { y: '110%', rotate: 4 },
  show: { y: '0%', rotate: 0, transition: { duration: 1.3, ease: EASE_SETTLE } },
};

const tags = { h1: motion.h1, h2: motion.h2, h3: motion.h3, p: motion.p };

/**
 * Editorial heading reveal: each word rises out of its own mask as the heading
 * scrolls into view. Screen readers get the plain sentence once.
 */
export default function RevealText({ text, as = 'h2', className, style, delay = 0 }: RevealTextProps) {
  const Tag = tags[as];
  const words = text.split(/\s+/).filter(Boolean);
  const [ref, inView] = useReplayInView<HTMLHeadingElement>('-80px');

  return (
    <Tag
      className={className}
      style={style}
      // All four tags are block text elements; the ref type only differs nominally
      ref={ref as React.Ref<HTMLHeadingElement & HTMLParagraphElement>}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      variants={container}
      custom={delay}
    >
      <span className="sr-only">{text}</span>
      {words.map((w, i) => (
        <span key={i} aria-hidden="true">
          {/* Padding + negative margin keep descenders (g, y, p) inside the mask */}
          <span className="inline-block overflow-hidden align-bottom pb-[0.14em] -mb-[0.14em]">
            <motion.span className="inline-block origin-bottom-left" variants={word}>
              {w}
            </motion.span>
          </span>
          {i < words.length - 1 && ' '}
        </span>
      ))}
    </Tag>
  );
}
