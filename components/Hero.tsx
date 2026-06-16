'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import MuxPlayer from '@mux/mux-player-react';
import Container from '@/components/ui/Container';
import MagneticButton from '@/components/MagneticButton';
import Button from '@/components/ui/Button';

interface HeroProps {
  headline?: string;
  subline?: string;
  videoPlaybackId?: string;
}

const DEFAULT_HEADLINE = 'Motion that moves money.';
const DEFAULT_SUBLINE =
  'Video that earns attention and drives results — for brands that measure what works.';


export default function Hero({ headline, subline, videoPlaybackId }: HeroProps) {
  const text = headline ?? DEFAULT_HEADLINE;
  const lastSpace = text.lastIndexOf(' ');
  const head = lastSpace > 0 ? text.slice(0, lastSpace) : text;
  const tail = lastSpace > 0 ? text.slice(lastSpace + 1) : '';

  return (
    <section
      className="relative flex items-center overflow-hidden"
      style={{
        minHeight: '100svh',
        paddingTop: 'clamp(78px, 8vw, 96px)',
        paddingBottom: '64px',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/hero-bg.png"
        alt=""
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: 'scale(1.15)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      {/* ── Main content — centered ────────────────────────────────── */}
      <Container className="w-full relative z-10">
        <div className="max-w-4xl mx-auto text-center">

          {/* ── Showreel — glass-framed, always looping ─────────────── */}
          {videoPlaybackId && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: 'relative',
                margin: '0 auto 36px',
                maxWidth: 920,
                borderRadius: 32,
                padding: 6,
                background:
                  'linear-gradient(150deg, rgba(255,255,255,0.20) 0%, rgba(79,142,247,0.14) 45%, rgba(255,255,255,0.05) 100%)',
                backdropFilter: 'blur(18px)',
                WebkitBackdropFilter: 'blur(18px)',
                border: '1px solid rgba(147,197,253,0.30)',
                boxShadow: [
                  'inset 0 1px 0 rgba(255,255,255,0.18)',
                  '0 30px 70px rgba(0,0,0,0.55)',
                  '0 0 60px rgba(79,142,247,0.20)',
                  '0 0 130px rgba(79,142,247,0.10)',
                ].join(', '),
              }}
            >
              {/* glass sheen line along the top edge */}
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: 6,
                  left: 24,
                  right: 24,
                  height: 1,
                  background:
                    'linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)',
                  zIndex: 2,
                  pointerEvents: 'none',
                }}
              />
              <div
                style={{
                  position: 'relative',
                  borderRadius: 26,
                  overflow: 'hidden',
                  aspectRatio: '16 / 9',
                  background: '#04070d',
                }}
              >
                <MuxPlayer
                  playbackId={videoPlaybackId}
                  streamType="on-demand"
                  autoPlay
                  muted
                  loop
                  playsInline
                  metadata={{
                    video_title: 'Hero Showreel',
                    player_name: 'harsh-portfolio-hero',
                  }}
                  style={{
                    width: '100%',
                    height: '100%',
                    '--controls': 'none',
                    '--media-object-fit': 'cover',
                  }}
                />
              </div>
            </motion.div>
          )}

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
            style={{
              color: '#ffffff',
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
            style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1.0625rem' }}
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
                <Button variant="ghost">View Landscape</Button>
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
        className="hidden md:flex absolute bottom-10 left-1/2 -translate-x-1/2 flex-col items-center gap-3"
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
