'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { lenisInstance } from '@/components/SmoothScroll';

// Skip the fade on the first page load: server-rendered HTML would otherwise
// sit at opacity 0 until JS hydrates — a blank screen on slow phones.
// Only client-side route changes after hydration fade in.
let hasHydrated = false;

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  useEffect(() => {
    hasHydrated = true;
  }, []);

  // When navigating from /work to /#contact, clean the hash
  // from the URL and scroll via Lenis so the URL stays motionbyharsh.com/
  useEffect(() => {
    if (pathname === '/' && window.location.hash === '#contact') {
      history.replaceState(null, '', '/');
      const timer = setTimeout(() => {
        const el = document.getElementById('contact');
        if (el) lenisInstance?.scrollTo(el, { duration: 1.2 });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  // No AnimatePresence/exit here on purpose: waiting for the old page to
  // fade out before mounting the new one leaves a blank gap whenever the
  // next route's data fetch is slow (e.g. mobile networks), and a second
  // navigation fired during that exit can leave the queue stuck. Just fade
  // the incoming page in as soon as it's ready — no wait, no blank state.
  return (
    <motion.div
      key={pathname}
      initial={hasHydrated ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
