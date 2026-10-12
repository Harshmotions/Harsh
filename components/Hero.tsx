'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { preconnect } from 'react-dom';
import { motion, useAnimation } from 'framer-motion';
import Container from '@/components/ui/Container';
import MagneticButton from '@/components/MagneticButton';
import Button from '@/components/ui/Button';
import { lenisInstance } from '@/components/SmoothScroll';
import HeroGridCanvas from '@/components/HeroGridCanvas';

// Mux player + hls.js is ~1 MB of JS — load it in its own chunk so the rest of
// the hero hydrates first. Its glass frame is server-rendered, so no layout shift.
const MuxPlayer = dynamic(() => import('@mux/mux-player-react'), { ssr: false });

interface HeroProps {
  headline?: string;
  subline?: string;
  videoPlaybackIdDesktop?: string;
  videoPlaybackIdMobile?: string;
}

const DEFAULT_HEADLINE = 'Motion that moves money.';
const DEFAULT_SUBLINE =
  'Edits built to stop the scroll and pay for themselves.';


const CTA_TIMESTAMP_DESKTOP = 1.85; // ~150ms before the 2s mark
const CTA_TIMESTAMP_MOBILE = 1;

const springIn = {
  y: { type: 'spring' as const, stiffness: 260, damping: 16 },
  opacity: { duration: 0.01 },
};

export default function Hero({
  headline,
  subline,
  videoPlaybackIdDesktop,
  videoPlaybackIdMobile,
}: HeroProps) {
  const text = headline ?? DEFAULT_HEADLINE;
  const lastSpace = text.lastIndexOf(' ');
  const head = lastSpace > 0 ? text.slice(0, lastSpace) : text;
  const tail = lastSpace > 0 ? text.slice(lastSpace + 1) : '';

  // Default to the desktop video for SSR/first paint, then swap on mount if
  // the viewport is mobile-sized — avoids loading both videos at once.
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const videoPlaybackId = isMobile
    ? videoPlaybackIdMobile ?? videoPlaybackIdDesktop
    : videoPlaybackIdDesktop ?? videoPlaybackIdMobile;

  // Both showreels open on black for ~3s; 4s in is the first strong frame to show while loading
  const posterFor = (id: string | undefined, width: number) =>
    id ? `https://image.mux.com/${id}/thumbnail.webp?time=4&width=${width}` : undefined;
  const desktopPoster = posterFor(videoPlaybackIdDesktop ?? videoPlaybackIdMobile, 1280);
  const mobilePoster = posterFor(videoPlaybackIdMobile ?? videoPlaybackIdDesktop, 720);

  // Open connections to Mux early: images (poster) and the HLS video stream
  preconnect('https://image.mux.com');
  preconnect('https://stream.mux.com');

  const ctaControls = useAnimation();
  const triggered = useRef(false);

  const triggerCta = () => {
    if (triggered.current) return;
    triggered.current = true;
    ctaControls.start({ y: 0, opacity: 1, transition: springIn });
  };

  // On mobile, show the CTA immediately on mount — no need to wait for video time
  useEffect(() => {
    if (isMobile) triggerCta();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);

  // Fallback so the CTA never stays hidden if the showreel is slow or fails to load
  useEffect(() => {
    const t = setTimeout(triggerCta, 4000);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTimeUpdate = (e: Event) => {
    const video = e.target as HTMLVideoElement;
    const ctaTimestamp = isMobile ? CTA_TIMESTAMP_MOBILE : CTA_TIMESTAMP_DESKTOP;
    if (video.currentTime >= ctaTimestamp) triggerCta();
  };

  return (
    <section
      className="relative flex items-center overflow-hidden"
      style={{
        minHeight: '100svh',
        paddingTop: 'clamp(88px, 7vw, 100px)',
        paddingBottom: '64px',
      }}
    >
      <HeroGridCanvas />
      {/* Bottom fade — blends grid into the page below */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '180px',
          background: 'linear-gradient(to bottom, transparent, #060B14)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      <Container className="w-full relative z-10">
        <div className="max-w-4xl mx-auto text-center">

          {/* ── Specialty line — says what Harsh does before anything else ── */}
          <p
            className="hero-rise [--rise:8px] [--rise-duration:0.7s] font-body uppercase inline-flex items-center gap-2 mb-5 md:mb-6 whitespace-nowrap text-[10.5px] md:text-xs tracking-[0.14em] md:tracking-[0.2em]"
            style={{ color: 'rgba(240,237,232,0.72)' }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'var(--accent)',
                boxShadow: '0 0 10px rgba(79,142,247,0.8)',
                flexShrink: 0,
              }}
            />
            <span className="md:hidden">Ads · SaaS motion · Long-form</span>
            <span className="hidden md:inline">Performance ads · SaaS motion · Long-form edits</span>
          </p>

          {/* ── Showreel — glass-framed, always looping ─────────────── */}
          {videoPlaybackId && (
            <div
              className="hero-rise [--rise:24px] [--rise-opacity:1]"
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
                {/* First frame, server-rendered so it paints before the player's JS loads
                    (it was the page's slowest element). <picture> means phones only
                    download the mobile poster. The player shows the same image on top. */}
                <picture>
                  {mobilePoster && <source media="(max-width: 767px)" srcSet={mobilePoster} />}
                  <img
                    src={desktopPoster ?? mobilePoster}
                    alt=""
                    aria-hidden="true"
                    fetchPriority="high"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </picture>
                <MuxPlayer
                  key={videoPlaybackId}
                  playbackId={videoPlaybackId}
                  poster={isMobile ? mobilePoster : desktopPoster}
                  // A phone shows the reel ~340px wide, so 720p is plenty and buffers far less
                  maxResolution={isMobile ? '720p' : '1080p'}
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
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    '--controls': 'none',
                    '--media-object-fit': 'cover',
                  }}
                />
              </div>
            </div>
          )}

          {/* ── Start a Project CTA — bounces out from under the video ── */}
          <motion.div
            initial={{ y: videoPlaybackId ? -72 : 0, opacity: 0 }}
            animate={ctaControls}
            className="flex justify-center mt-9 mb-9 md:mt-8 md:mb-8"
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

          {/* Hero copy uses the CSS .hero-rise entrance rather than framer-motion: a
              JS-driven fade kept the page's largest text invisible until hydration.
              The headline slides without fading — Chrome never counts text first painted
              at opacity 0 as the Largest Contentful Paint, even once it fades in. */}
          <h1
            className="hero-rise [--rise-opacity:1] [--rise-delay:0.1s] font-display font-bold"
            style={{
              color: '#ffffff',
              fontSize: 'clamp(48px, 6.6vw, 100px)',
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
          </h1>

          <p
            className="hero-rise [--rise:16px] [--rise-duration:0.7s] [--rise-delay:0.3s] font-body mt-6 mx-auto max-w-xl line-clamp-2 md:line-clamp-none"
            style={{ color: 'rgba(255,255,255,0.75)', fontSize: 'clamp(0.875rem, 2.4vw, 1.0625rem)' }}
          >
            {subline ?? DEFAULT_SUBLINE}
          </p>

          <div className="hero-rise [--rise:12px] [--rise-duration:0.7s] [--rise-delay:0.45s] flex flex-wrap justify-center gap-4 mt-6">
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
          </div>

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
