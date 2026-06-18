'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { lenisInstance } from '@/components/SmoothScroll';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // When navigating from /reels or /landscape to /#contact, clean the hash
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
