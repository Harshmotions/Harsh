'use client';

import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion';

interface ScrollHighlightTextProps {
  paragraphs: string[];
  className?: string;
  style?: React.CSSProperties;
}

function Word({ text, progress, range }: { text: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.18, 1]);
  return <motion.span style={{ opacity }}>{text}</motion.span>;
}

/**
 * Paragraphs that "light up" word by word as they scroll through the viewport.
 * The text is always real, selectable text; only its opacity changes.
 */
export default function ScrollHighlightText({ paragraphs, className, style }: ScrollHighlightTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.5'] });

  const split = paragraphs.map((p) => p.split(/\s+/).filter(Boolean));
  const total = split.reduce((n, words) => n + words.length, 0);
  // Index of each paragraph's first word across the whole text
  const firstIndex = split.map((_, pi) => split.slice(0, pi).reduce((n, w) => n + w.length, 0));

  if (reduceMotion) {
    return (
      <div ref={ref}>
        {paragraphs.map((p, i) => (
          <p key={i} className={className} style={style}>
            {p}
          </p>
        ))}
      </div>
    );
  }

  return (
    <div ref={ref}>
      {split.map((words, pi) => (
        <p key={pi} className={className} style={style}>
          {words.map((w, wi) => {
            const start = ((firstIndex[pi] + wi) / total) * 0.85;
            return (
              <Word
                key={wi}
                text={wi < words.length - 1 ? `${w} ` : w}
                progress={scrollYProgress}
                range={[start, start + 0.15]}
              />
            );
          })}
        </p>
      ))}
    </div>
  );
}
