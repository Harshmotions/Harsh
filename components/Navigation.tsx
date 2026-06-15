'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const links = [
  { href: '/', label: 'Home' },
  { href: '/reels', label: 'Reels' },
  { href: '/landscape', label: 'Long-form' },
];

export default function Navigation() {
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        // hide when scrolling down past 80px, reveal when scrolling up
        if (y > lastY && y > 80) setHidden(true);
        else if (y < lastY) setHidden(false);
        lastY = y;
        ticking = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const contactHref = pathname === '/' ? '#contact' : '/#contact';

  return (
    <AnimatePresence>
      {!hidden && (
        <motion.nav
          key="nav"
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="fixed top-0 left-0 right-0 z-50"
          style={{
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            background: 'rgba(10,10,10,0.7)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div className="mx-auto max-w-7xl px-6 md:px-12 h-16 flex items-center justify-between">
            <Link
              href="/"
              className="font-display text-text font-bold text-lg tracking-tight"
            >
              Harsh<span className="text-accent">.</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {links.map((l) => {
                const active = pathname === l.href;
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="font-body text-sm transition-colors"
                    style={{
                      color: active ? 'var(--text)' : 'var(--text-muted)',
                    }}
                  >
                    {l.label}
                  </Link>
                );
              })}
            </div>

            <Link
              href={contactHref}
              className="font-body text-sm font-medium px-5 py-2 rounded-full transition-colors hover:opacity-90"
              style={{
                background: 'rgba(79,142,247,0.10)',
                border: '1px solid rgba(79,142,247,0.35)',
                color: 'var(--accent)',
              }}
            >
              Get in touch
            </Link>
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
