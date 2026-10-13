'use client';

import { Fragment, useEffect } from 'react';
import { useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useSpring } from 'framer-motion';
import { useReplayInView } from '@/components/motion/useReplayInView';

interface ScrollHighlightTextProps {
  paragraphs: string[];
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Paragraphs that assemble and "light up" word by word as they scroll through
 * the viewport: the lines start spread out and close up, each word sliding in
 * while it goes from muted slate (still readable, 5.5:1 contrast) to full white.
 *
 * One scroll value is written to a CSS variable (--p); each word's colour and
 * position are computed in CSS from its own start point (--s), with an ease-out
 * curve — see .scroll-word in globals.css — so there's no per-word work in JS.
 *
 * The value only moves forward and trails the scroll on a soft spring, so words
 * glide in and settle rather than tracking the wheel 1:1. Scrolling back up leaves
 * the text as it is; once it is below the screen it resets to play again.
 */
export default function ScrollHighlightText({ paragraphs, className, style }: ScrollHighlightTextProps) {
  const [ref, inView] = useReplayInView<HTMLDivElement>('0px');
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.5'] });

  const furthest = useMotionValue(0);
  const progress = useSpring(furthest, { stiffness: 38, damping: 16, mass: 1, restDelta: 0.0005 });
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (v > furthest.get()) furthest.set(v);
  });
  useMotionValueEvent(progress, 'change', (v) => {
    if (!reduceMotion) ref.current?.style.setProperty('--p', v.toFixed(4));
  });
  useEffect(() => {
    if (inView) return;
    furthest.jump(0);
    progress.jump(0);
    ref.current?.style.setProperty('--p', '0');
  }, [inView, furthest, progress, ref]);

  // Each word starts pushed right in proportion to how far along its line it sits, so
  // a line reads as spread out rather than jumbled. Rightwards only: words settle left
  // to right, so a waiting word always sits clear of the ones already in place.
  // Measured from layout (offsetLeft ignores transforms), again on width changes.
  useEffect(() => {
    const root = ref.current;
    if (!root || reduceMotion) return;
    const measure = () => {
      root.querySelectorAll<HTMLElement>('.scroll-word').forEach((w) => {
        w.style.setProperty('--dx', `${(w.offsetLeft * 0.45).toFixed(1)}px`);
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    return () => ro.disconnect();
  }, [reduceMotion, ref]);

  const split = paragraphs.map((p) => p.split(/\s+/).filter(Boolean));
  const total = split.reduce((n, words) => n + words.length, 0);
  // Index of each paragraph's first word across the whole text
  const firstIndex = split.map((_, pi) => split.slice(0, pi).reduce((n, w) => n + w.length, 0));

  return (
    <div ref={ref} className="relative" style={{ '--p': reduceMotion ? 1 : 0 } as React.CSSProperties}>
      {split.map((words, pi) => (
        <p key={pi} className={className} style={style}>
          {words.map((w, wi) => (
            <Fragment key={wi}>
              <span
                className="scroll-word"
                style={{ '--s': (((firstIndex[pi] + wi) / total) * 0.7).toFixed(4) } as React.CSSProperties}
              >
                {w}
              </span>
              {wi < words.length - 1 && ' '}
            </Fragment>
          ))}
        </p>
      ))}
    </div>
  );
}
