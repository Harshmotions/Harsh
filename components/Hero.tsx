'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Container from '@/components/ui/Container';
import GlowWord from '@/components/GlowWord';
import MagneticButton from '@/components/MagneticButton';
import Button from '@/components/ui/Button';

interface HeroProps {
  headline?: string;
  subline?: string;
}

const DEFAULT_HEADLINE = 'Motion that moves money.';
const DEFAULT_SUBLINE =
  'Performance ads, motion graphics, and AI-driven creative for brands that measure what works.';

/* ── Floating dots config ──────────────────────────────────────────────────
   Hardcoded so positions are stable (no Math.random in render).
   top/left as % strings, size in px, duration in seconds, delay in seconds. */
const DOTS = [
  { top: '12%',  left: '18%',  size: 2,   duration: 4.8, delay: 0   },
  { top: '28%',  left: '72%',  size: 1.5, duration: 6.2, delay: 1.3 },
  { top: '52%',  left: '88%',  size: 2,   duration: 5.5, delay: 0.6 },
  { top: '68%',  left: '38%',  size: 1.5, duration: 6.8, delay: 2.0 },
  { top: '22%',  left: '55%',  size: 2,   duration: 5.1, delay: 0.9 },
  { top: '42%',  left: '10%',  size: 1.5, duration: 7.0, delay: 1.8 },
  { top: '78%',  left: '62%',  size: 2,   duration: 4.6, delay: 0.4 },
  { top: '38%',  left: '92%',  size: 1.5, duration: 5.8, delay: 2.4 },
  { top: '60%',  left: '25%',  size: 2,   duration: 6.4, delay: 1.1 },
  { top: '8%',   left: '44%',  size: 1.5, duration: 5.3, delay: 1.6 },
];

/* ── Stars config ─────────────────────────────────────────────────────────
   4 stars, each wiggling gently in a small radius. */
const STARS = [
  { top: '10%', left: '6%',  size: 50, duration: 8,  delay: 0   },
  { top: '18%', left: '88%', size: 35, duration: 10, delay: 1.5 },
  { top: '62%', left: '80%', size: 55, duration: 9,  delay: 0.8 },
  { top: '72%', left: '14%', size: 33, duration: 11, delay: 2.0 },
];

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
      {/* ── Ambient gradient blobs ─────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">

        {/* Blob 1 — strong top-left amber bloom */}
        <div style={{
          position: 'absolute', top: '-10%', left: '-15%',
          width: '70%', height: '80%',
          background: 'radial-gradient(ellipse at 40% 40%, rgba(212,168,75,0.18) 0%, rgba(212,168,75,0.07) 45%, transparent 70%)',
          filter: 'blur(60px)',
        }} />

        {/* Blob 2 — center diffusion, very subtle */}
        <div style={{
          position: 'absolute', top: '10%', left: '25%',
          width: '55%', height: '60%',
          background: 'radial-gradient(ellipse at 50% 50%, rgba(212,168,75,0.07) 0%, transparent 65%)',
          filter: 'blur(80px)',
        }} />

        {/* Blob 3 — bottom-right warm edge */}
        <div style={{
          position: 'absolute', bottom: '-5%', right: '-10%',
          width: '55%', height: '60%',
          background: 'radial-gradient(ellipse at 60% 60%, rgba(212,168,75,0.10) 0%, rgba(184,136,26,0.05) 50%, transparent 70%)',
          filter: 'blur(70px)',
        }} />

        {/* Blob 4 — mid-left subtle secondary glow */}
        <div style={{
          position: 'absolute', top: '35%', left: '-5%',
          width: '35%', height: '45%',
          background: 'radial-gradient(ellipse at 30% 50%, rgba(212,168,75,0.08) 0%, transparent 65%)',
          filter: 'blur(50px)',
        }} />

        {/* Blob 5 — top-right faint accent */}
        <div style={{
          position: 'absolute', top: '-5%', right: '5%',
          width: '30%', height: '40%',
          background: 'radial-gradient(ellipse at 70% 30%, rgba(212,168,75,0.06) 0%, transparent 65%)',
          filter: 'blur(55px)',
        }} />
      </div>

      {/* ── Faded grid — bottom of hero ───────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage: [
            'linear-gradient(rgba(212,168,75,0.07) 1px, transparent 1px)',
            'linear-gradient(90deg, rgba(212,168,75,0.07) 1px, transparent 1px)',
          ].join(', '),
          backgroundSize: '64px 64px',
          WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 35%, transparent 62%)',
          maskImage: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 35%, transparent 62%)',
        }}
      />

      {/* ── Floating micro-dots ───────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {DOTS.map((dot, i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -10, 0], opacity: [0.25, 0.55, 0.25] }}
            transition={{
              duration: dot.duration,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: dot.delay,
            }}
            style={{
              position: 'absolute',
              top: dot.top,
              left: dot.left,
              width: dot.size,
              height: dot.size,
              borderRadius: '50%',
              background: 'rgba(212,168,75,0.7)',
              boxShadow: '0 0 4px rgba(212,168,75,0.5)',
            }}
          />
        ))}
      </div>

      {/* ── Star assets ───────────────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {STARS.map((star, i) => (
          <motion.div
            key={i}
            animate={{
              x: [0, 4, -3, 2, 0],
              y: [0, -3, 4, -2, 0],
              rotate: [0, 6, -4, 3, 0],
              scale: [1, 1.06, 0.96, 1.03, 1],
            }}
            transition={{
              duration: star.duration,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: star.delay,
            }}
            style={{
              position: 'absolute',
              top: star.top,
              left: star.left,
              width: star.size,
              height: star.size,
              opacity: 0.75,
              filter: 'drop-shadow(0 0 6px rgba(212,168,75,0.6))',
            }}
          >
            <Image
              src="/Star.svg"
              alt=""
              width={star.size}
              height={star.size}
              style={{ width: '100%', height: '100%' }}
            />
          </motion.div>
        ))}
      </div>

      {/* ── Main content ──────────────────────────────────────────────── */}
      <Container className="w-full relative z-10">
        <div className="max-w-5xl">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="font-body text-text-muted text-xs uppercase tracking-[0.2em] mb-6"
          >
            Freelance Video Editor · India
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
                <GlowWord>{tail}</GlowWord>
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
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            width: 30, height: 30,
            borderRadius: '50%',
            border: '1px solid rgba(212,168,75,0.30)',
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
