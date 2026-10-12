'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';

// Module-level ref so modal components can call lenisInstance.stop() / .start()
// without needing a React context.
export let lenisInstance: Lenis | null = null;

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const lenis = new Lenis({
      duration: prefersReducedMotion ? 0 : 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: !prefersReducedMotion,
      syncTouch: false, // never mimic smooth on touch devices
      autoRaf: true,
    });

    lenisInstance = lenis;
    // Also expose on window for dev tooling (screenshots, debugging)
    (window as unknown as { __lenis: Lenis }).__lenis = lenis;

    return () => {
      lenis.destroy();
      lenisInstance = null;
    };
  }, []);

  return <>{children}</>;
}
