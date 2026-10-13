'use client';

import { motion, type Variants } from 'framer-motion';

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
  show: (delay: number) => ({ transition: { staggerChildren: 0.07, delayChildren: delay } }),
};

const word: Variants = {
  hidden: { y: '110%' },
  show: { y: '0%', transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] } },
};

const tags = { h1: motion.h1, h2: motion.h2, h3: motion.h3, p: motion.p };

/**
 * Editorial heading reveal: each word rises out of its own mask as the heading
 * scrolls into view. Screen readers get the plain sentence once.
 */
export default function RevealText({ text, as = 'h2', className, style, delay = 0 }: RevealTextProps) {
  const Tag = tags[as];
  const words = text.split(/\s+/).filter(Boolean);

  return (
    <Tag
      className={className}
      style={style}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-80px' }}
      variants={container}
      custom={delay}
    >
      <span className="sr-only">{text}</span>
      {words.map((w, i) => (
        <span key={i} aria-hidden="true">
          {/* Padding + negative margin keep descenders (g, y, p) inside the mask */}
          <span className="inline-block overflow-hidden align-bottom pb-[0.14em] -mb-[0.14em]">
            <motion.span className="inline-block" variants={word}>
              {w}
            </motion.span>
          </span>
          {i < words.length - 1 && ' '}
        </span>
      ))}
    </Tag>
  );
}
