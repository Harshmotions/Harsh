'use client';

import { useRef } from 'react';
import { useMotionValueEvent, useReducedMotion, useScroll } from 'framer-motion';

interface ScrollHighlightTextProps {
  paragraphs: string[];
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Paragraphs that "light up" word by word as they scroll through the viewport:
 * muted slate (still readable, 5.5:1 contrast) to full white.
 *
 * One scroll value is written to a CSS variable (--p); each word's colour is
 * computed in CSS from its own start point (--s) — see .scroll-word in
 * globals.css — so there's no per-word animation work in JS.
 */
export default function ScrollHighlightText({ paragraphs, className, style }: ScrollHighlightTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.5'] });

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (!reduceMotion) ref.current?.style.setProperty('--p', v.toFixed(4));
  });

  const split = paragraphs.map((p) => p.split(/\s+/).filter(Boolean));
  const total = split.reduce((n, words) => n + words.length, 0);
  // Index of each paragraph's first word across the whole text
  const firstIndex = split.map((_, pi) => split.slice(0, pi).reduce((n, w) => n + w.length, 0));

  return (
    <div ref={ref} style={{ '--p': reduceMotion ? 1 : 0 } as React.CSSProperties}>
      {split.map((words, pi) => (
        <p key={pi} className={className} style={style}>
          {words.map((w, wi) => (
            <span
              key={wi}
              className="scroll-word"
              style={{ '--s': (((firstIndex[pi] + wi) / total) * 0.85).toFixed(4) } as React.CSSProperties}
            >
              {wi < words.length - 1 ? `${w} ` : w}
            </span>
          ))}
        </p>
      ))}
    </div>
  );
}
