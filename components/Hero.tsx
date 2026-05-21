'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Container from '@/components/ui/Container';
import MagneticButton from '@/components/MagneticButton';
import Button from '@/components/ui/Button';

interface HeroProps {
  headline?: string;
  subline?: string;
}

const DEFAULT_HEADLINE = 'Motion that moves money.';
const DEFAULT_SUBLINE =
  'Performance ads, motion graphics, and AI-driven creative for brands that measure what works.';

export default function Hero({ headline, subline }: HeroProps) {
  const text = headline ?? DEFAULT_HEADLINE;
  const lastSpace = text.lastIndexOf(' ');
  const head = lastSpace > 0 ? text.slice(0, lastSpace) : text;
  const tail = lastSpace > 0 ? text.slice(lastSpace + 1) : '';

  return (
    <section
      className="relative flex items-center overflow-hidden"
      style={{ minHeight: '100svh' }}
    >
      {/* ── Ambient gradient orbs ── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {/* Warm amber glow behind headline */}
        <div
          style={{
            position: 'absolute',
            top: '-5%',
            left: '-10%',
            width: '65%',
            height: '75%',
            background:
              'radial-gradient(ellipse at 40% 40%, rgba(212,168,75,0.13) 0%, transparent 65%)',
            filter: 'blur(48px)',
          }}
        />
        {/* Softer secondary orb bottom-right */}
        <div
          style={{
            position: 'absolute',
            bottom: '0%',
            right: '-5%',
            width: '50%',
            height: '55%',
            background:
              'radial-gradient(ellipse at 60% 60%, rgba(212,168,75,0.06) 0%, transparent 65%)',
            filter: 'blur(64px)',
          }}
        />
      </div>

      <Container className="w-full relative z-10">
        <div className="max-w-5xl">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="font-body text-text-muted text-xs uppercase tracking-[0.2em] mb-6"
          >
            Freelance Video Editor · Maharashtra, India
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="font-display font-bold text-text"
            style={{
              fontSize: 'clamp(48px, 8vw, 120px)',
              lineHeight: 0.95,
              letterSpacing: '-0.03em',
            }}
          >
            {head}
            {tail && (
              <>
                {' '}
                <span
                  style={{
                    color: 'var(--accent)',
                    textShadow: '0 0 40px rgba(212,168,75,0.4)',
                  }}
                >
                  {tail}
                </span>
              </>
            )}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="font-body text-text-muted mt-6 max-w-xl"
            style={{ fontSize: '1.0625rem' }}
          >
            {subline ?? DEFAULT_SUBLINE}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-wrap gap-4 mt-10"
          >
            <MagneticButton>
              <Link href="/reels">
                <Button variant="primary">View Reels</Button>
              </Link>
            </MagneticButton>
            <MagneticButton>
              <Link href="/landscape">
                <Button variant="ghost">View Long-form</Button>
              </Link>
            </MagneticButton>
          </motion.div>
        </div>
      </Container>

      {/* ── Scroll prompt ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.1, ease: [0.22, 1, 0.36, 1] }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
        aria-hidden="true"
      >
        <span
          className="font-body text-xs uppercase tracking-[0.22em]"
          style={{ color: 'var(--text-muted)' }}
        >
          The reel's worth it
        </span>

        {/* Arrow circle — pulses its glow while the arrow bounces */}
        <motion.div
          animate={{
            y: [0, 8, 0],
            boxShadow: [
              '0 0 8px rgba(212,168,75,0.15)',
              '0 0 20px rgba(212,168,75,0.45)',
              '0 0 8px rgba(212,168,75,0.15)',
            ],
            borderColor: [
              'rgba(212,168,75,0.30)',
              'rgba(212,168,75,0.70)',
              'rgba(212,168,75,0.30)',
            ],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            width: 30,
            height: 30,
            borderRadius: '50%',
            border: '1px solid rgba(212,168,75,0.30)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M6 1.5v9M2.5 7l3.5 3.5L9.5 7"
              stroke="var(--accent)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
}
