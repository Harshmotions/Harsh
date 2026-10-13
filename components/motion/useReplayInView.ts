'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Like framer-motion's useInView, but with replay rules that feel natural on scroll:
 * - turns true once the element is `margin` inside the viewport;
 * - stays true while you scroll back up past it, so nothing plays backwards in view;
 * - turns false again only once the element is fully below the viewport (you have
 *   scrolled up away from it), so it plays again the next time you scroll down to it.
 * The reset happens off-screen, so any "hide" transition is never seen.
 */
export function useReplayInView<T extends Element = HTMLElement>(margin = '-60px') {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const show = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setInView(true);
      },
      { rootMargin: `${margin} 0px ${margin} 0px` },
    );
    const rearm = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting && e.boundingClientRect.top > 0) setInView(false);
    });
    show.observe(el);
    rearm.observe(el);
    return () => {
      show.disconnect();
      rearm.disconnect();
    };
  }, [margin]);

  return [ref, inView] as const;
}

/** Shared easing for every reveal: a quick start and a long, soft settle. */
export const EASE_SETTLE = [0.16, 1, 0.3, 1] as const;
