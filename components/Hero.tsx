'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useAnimation } from 'framer-motion';
import MuxPlayer from '@mux/mux-player-react';
import Container from '@/components/ui/Container';
import MagneticButton from '@/components/MagneticButton';
import Button from '@/components/ui/Button';
import { lenisInstance } from '@/components/SmoothScroll';

interface HeroProps {
  headline?: string;
  subline?: string;
  videoPlaybackId?: string;
}

const DEFAULT_HEADLINE = 'Motion that moves money.';
const DEFAULT_SUBLINE =
  'Video that earns attention and drives results — for brands that measure what works.';


const CTA_TIMESTAMP = 1.85; // ~150ms before the 2s mark

const springIn = {
  y: { type: 'spring' as const, stiffness: 260, damping: 16 },
  opacity: { duration: 0.01 },
};

export default function Hero({ headline, subline, videoPlaybackId }: HeroProps) {
  const text = headline ?? DEFAULT_HEADLINE;
  const lastSpace = text.lastIndexOf(' ');
  const head = lastSpace > 0 ? text.slice(0, lastSpace) : text;
  const tail = lastSpace > 0 ? text.slice(lastSpace + 1) : '';

  const ctaControls = useAnimation();
  const triggered = useRef(false);

  const triggerCta = () => {
    if (triggered.current) return;
    triggered.current = true;
    ctaControls.start({ y: 0, opacity: 1, transition: springIn });
  };

  const handleTimeUpdate = (e: React.SyntheticEvent) => {
    const video = e.target as HTMLVideoElement;
    if (video.currentTime >= CTA_TIMESTAMP) triggerCta();
  };

  return (
    <section
      className="relative flex items-center overflow-hidden"
      style={{
        minHeight: '100svh',
        paddingTop: 'clamp(80px, 5.5vw, 84px)',
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
                zIndex: 2,
                margin: '0 auto 0',
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
                  onTimeUpdate={handleTimeUpdate}
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

          {/* ── Start a Project CTA — bounces out from under the video ── */}
          <motion.div
            initial={{ y: videoPlaybackId ? -72 : 0, opacity: 0 }}
            animate={ctaControls}
            className="flex justify-center mt-9 mb-9 md:mt-[44px] md:mb-[44px]"
            style={{
              position: 'relative',
              zIndex: 1,
            }}
          >
            <motion.button
              onClick={() => {
                const el = document.getElementById('contact');
                if (el) lenisInstance?.scrollTo(el, { duration: 1.2 });
              }}
              whileHover={{
                borderColor: 'rgba(255,107,43,0.92)',
                boxShadow: [
                  '0 6px 24px rgba(0,0,0,0.65)',
                  '0 0 38px rgba(255,107,43,0.45)',
                  '0 0 14px rgba(255,107,43,0.30)',
                  'inset 0 1px 0 rgba(255,255,255,0.09)',
                ].join(', '),
                filter: 'brightness(1.16)',
              }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="font-body"
              style={{
                position: 'relative',
                overflow: 'hidden',
                fontSize: '0.875rem',
                fontWeight: 600,
                letterSpacing: '0.03em',
                borderRadius: 9999,
                border: '1px solid rgba(255,107,43,0.62)',
                padding: '13px 32px',
                color: 'rgba(255,240,228,0.97)',
                background: 'linear-gradient(170deg, #110805 0%, #060B14 55%)',
                boxShadow: [
                  '0 4px 18px rgba(0,0,0,0.58)',
                  '0 0 24px rgba(255,107,43,0.22)',
                  'inset 0 1px 0 rgba(255,255,255,0.07)',
                  'inset 0 -1px 0 rgba(255,107,43,0.12)',
                ].join(', '),
                whiteSpace: 'nowrap',
              }}
            >
              {/* Pulsing glow rising from bottom-center — clipped inside pill */}
              <motion.div
                aria-hidden="true"
                animate={{ opacity: [0.45, 1, 0.45] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '85%',
                  height: '180%',
                  background:
                    'radial-gradient(ellipse at 50% 100%, rgba(255,107,43,0.70), rgba(255,107,43,0.32) 32%, transparent 65%)',
                  pointerEvents: 'none',
                  zIndex: 0,
                }}
              />
              <span style={{ position: 'relative', zIndex: 1 }}>Start a Project →</span>
            </motion.button>
          </motion.div>

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
            className="font-body mt-6 mx-auto max-w-xl line-clamp-2 md:line-clamp-none"
            style={{ color: 'rgba(255,255,255,0.75)', fontSize: 'clamp(0.875rem, 2.4vw, 1.0625rem)' }}
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
                <Button variant="ghost">View Reels</Button>
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
