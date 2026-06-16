'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { lenisInstance } from '@/components/SmoothScroll';

const links = [
  { href: '/', label: 'Home' },
  { href: '/reels', label: 'Reels' },
  { href: '/landscape', label: 'Landscape' },
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
          initial={{ y: -64, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -64, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed top-0 left-0 right-0 z-50 flex justify-center"
          style={{ paddingTop: '14px' }}
        >
          <div
            className="flex items-center gap-2"
            style={{
              background: 'rgba(6,11,20,0.72)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(79,142,247,0.14)',
              borderRadius: '9999px',
              padding: '6px 6px 6px 20px',
              boxShadow: '0 4px 32px rgba(0,0,0,0.40), 0 0 0 1px rgba(255,255,255,0.04) inset',
            }}
          >
            {/* Logo — smooth-scrolls to top if already home, else navigates with a fade */}
            <Link
              href="/"
              onClick={(e) => {
                if (pathname === '/') {
                  e.preventDefault();
                  lenisInstance?.scrollTo(0, { duration: 1.2 });
                }
              }}
              className="font-display font-bold text-base tracking-tight mr-4"
              style={{ color: '#ffffff' }}
            >
              Harsh<span style={{ color: 'var(--accent)' }}>.</span>
            </Link>

            {/* Nav links — desktop only */}
            <div className="hidden md:flex items-center gap-1">
              {links.map((l) => {
                const active = pathname === l.href;
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="font-body text-sm transition-colors"
                    style={{
                      color: active ? '#ffffff' : 'rgba(255,255,255,0.58)',
                      padding: '6px 14px',
                      borderRadius: '9999px',
                      background: active ? 'rgba(79,142,247,0.10)' : 'transparent',
                    }}
                  >
                    {l.label}
                  </Link>
                );
              })}
            </div>

            {/* CTA pill */}
            <Link
              href={contactHref}
              className="font-body text-sm font-medium transition-opacity hover:opacity-85"
              style={{
                background: 'rgba(255,107,43,0.12)',
                border: '1px solid rgba(255,107,43,0.40)',
                color: 'var(--cta)',
                padding: '7px 18px',
                borderRadius: '9999px',
                marginLeft: '4px',
                whiteSpace: 'nowrap',
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
