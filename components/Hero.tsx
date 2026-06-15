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
  'Video that earns attention and drives results — for brands that measure what works.';


export default function Hero({ headline, subline }: HeroProps) {
  const text = headline ?? DEFAULT_HEADLINE;
  const lastSpace = text.lastIndexOf(' ');
  const head = lastSpace > 0 ? text.slice(0, lastSpace) : text;
  const tail = lastSpace > 0 ? text.slice(lastSpace + 1) : '';

  return (
    <section
      className="relative flex items-center overflow-hidden"
      style={{
        minHeight: '100svh',
        backgroundImage: 'url(/hero-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* ── Main content — centered ────────────────────────────────── */}
      <Container className="w-full relative z-10">
        <div className="max-w-4xl mx-auto text-center">

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="font-body text-xs uppercase tracking-[0.2em] mb-6"
            style={{ color: 'rgba(255,255,255,0.70)' }}
          >
            Freelance Video Editor · India
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="font-display font-bold"
            style={{ color: '#ffffff' }}
            style={{
              fontSize: 'clamp(48px, 8vw, 118px)',
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
                    fontFamily: 'var(--font-playfair)',
                    fontStyle: 'italic',
                    fontWeight: 700,
                    background: 'linear-gradient(90deg, var(--accent) 0%, #ffffff 100%)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    color: 'transparent',
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
            className="font-body mt-6 mx-auto max-w-xl"
            style={{ color: 'rgba(255,255,255,0.75)' }}
            style={{ fontSize: '1.0625rem' }}
          >
            {subline ?? DEFAULT_SUBLINE}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-wrap justify-center gap-4 mt-10"
          >
            <MagneticButton>
              <Link href="/reels">
                <Button variant="cta">View Reels</Button>
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

      {/* ── Scroll prompt ─────────────────────────────────────────────── */}
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
          The reel&apos;s worth it
        </span>

        <motion.div
          animate={{
            y: [0, 8, 0],
            boxShadow: [
              '0 0 8px rgba(79,142,247,0.15)',
              '0 0 20px rgba(79,142,247,0.50)',
              '0 0 8px rgba(79,142,247,0.15)',
            ],
            borderColor: [
              'rgba(79,142,247,0.30)',
              'rgba(79,142,247,0.75)',
              'rgba(79,142,247,0.30)',
            ],
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            width: 30, height: 30,
            borderRadius: '50%',
            border: '1px solid rgba(79,142,247,0.30)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
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
