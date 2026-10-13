'use client';

import { motion } from 'framer-motion';
import { EASE_SETTLE, useReplayInView } from '@/components/motion/useReplayInView';

const tags = { p: motion.p, div: motion.div };

interface RevealProps {
  children: React.ReactNode;
  as?: keyof typeof tags;
  className?: string;
  style?: React.CSSProperties;
  /** Distance in px it rises from. */
  y?: number;
  duration?: number;
  delay?: number;
  margin?: string;
}

/** Fades and rises into place when scrolled to; replays after you scroll up away from it. */
export default function Reveal({
  children,
  as = 'div',
  className,
  style,
  y = 16,
  duration = 1,
  delay = 0,
  margin = '-60px',
}: RevealProps) {
  const [ref, inView] = useReplayInView<HTMLElement>(margin);
  const Tag = tags[as];
  return (
    <Tag
      // Both tags are block elements; the ref type only differs nominally
      ref={ref as React.Ref<HTMLParagraphElement & HTMLDivElement>}
      className={className}
      style={style}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration, delay, ease: EASE_SETTLE }}
    >
      {children}
    </Tag>
  );
}
