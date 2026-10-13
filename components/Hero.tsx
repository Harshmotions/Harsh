'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { preconnect } from 'react-dom';
import {
  motion,
  useAnimation,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import MagneticButton from '@/components/MagneticButton';
import { lenisInstance } from '@/components/SmoothScroll';
import HeroGridCanvas from '@/components/HeroGridCanvas';
import ImageTrail from '@/components/motion/ImageTrail';
import ScrambleText from '@/components/motion/ScrambleText';
import { loadMuxPlayer } from '@/lib/muxPlayer';

// Mux player + hls.js is ~1 MB of JS — load it in its own chunk so the rest of
// the hero hydrates first. Its glass frame is server-rendered, so no layout shift.
const MuxPlayer = dynamic(loadMuxPlayer, { ssr: false });

interface HeroProps {
  headline?: string;
  subline?: string;
  videoPlaybackIdDesktop?: string;
  videoPlaybackIdMobile?: string;
  /** Project stills that follow the cursor around the hero (desktop). */
  trailImages?: string[];
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

// Seconds the first-visit intro covers the page (set by the inline script in the root layout)
const introSeconds = () =>
  parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--intro')) || 0;

function Eyebrow({ className = '' }: { className?: string }) {
  return (
    <p
      className={`hero-rise [--rise:8px] [--rise-duration:0.7s] items-center gap-2.5 rounded-full font-body uppercase whitespace-nowrap text-[10.5px] md:text-[11px] tracking-[0.14em] md:tracking-[0.2em] px-3.5 py-1.5 lg:text-[8.25px] lg:px-[10.5px] lg:py-[4.5px] lg:gap-[7.5px] ${className}`}
      style={{
        color: 'rgba(240,237,232,0.78)',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(147,197,253,0.16)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      <span aria-hidden="true" className="relative flex shrink-0" style={{ width: 6, height: 6 }}>
        <span className="absolute inset-0 rounded-full animate-ping" style={{ background: 'var(--accent)', opacity: 0.6 }} />
        <span className="relative rounded-full" style={{ width: 6, height: 6, background: 'var(--accent)', boxShadow: '0 0 10px rgba(79,142,247,0.8)' }} />
      </span>
      {/* Short version on phones and on narrower desktops, where the copy column is tight */}
      <ScrambleText className="md:hidden lg:inline xl:hidden" text="Ads · SaaS motion · Long-form" trigger="mount" delay={0.2} />
      <ScrambleText className="hidden md:inline lg:hidden xl:inline" text="Performance ads · SaaS motion · Long-form edits" trigger="mount" delay={0.2} duration={1} />
    </p>
  );
}

/** The one call to action in the hero: an ember-lit pill that scrolls to the brief form. */
function CtaButton() {
  return (
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
      className="font-body group"
      style={{
        position: 'relative',
        overflow: 'hidden',
        fontSize: 'var(--cta-size, 0.875rem)',
        fontWeight: 600,
        letterSpacing: '0.03em',
        borderRadius: 9999,
        border: '1px solid rgba(255,107,43,0.62)',
        padding: 'var(--cta-pad, 13px 32px)',
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
      <span className="relative z-[1] inline-flex items-center gap-2">
        Start a Project
        <span aria-hidden="true" className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
      </span>
    </motion.button>
  );
}

export default function Hero({
  headline,
  subline,
  videoPlaybackIdDesktop,
  videoPlaybackIdMobile,
  trailImages = [],
}: HeroProps) {
  const words = (headline ?? DEFAULT_HEADLINE).split(/\s+/).filter(Boolean);
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

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

  // Mount the player only once the page has loaded and the browser is idle: its JS
  // (~300 KB + hls.js) and the video stream otherwise compete with first paint on
  // phones. The server-rendered poster fills the frame until then.
  const [playerReady, setPlayerReady] = useState(false);
  useEffect(() => {
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 300));
    const cancelIdle = window.cancelIdleCallback ?? window.clearTimeout;
    let idleId: number | undefined;
    const mount = () => {
      idleId = idle(() => setPlayerReady(true), { timeout: 1500 });
    };
    if (document.readyState === 'complete') mount();
    else window.addEventListener('load', mount, { once: true });
    return () => {
      window.removeEventListener('load', mount);
      if (idleId !== undefined) cancelIdle(idleId);
    };
  }, []);

  // ── Start a Project CTA: bounces out from under the reel ──────────────
  const ctaControls = useAnimation();
  const triggered = useRef(false);
  const ctaNotBefore = useRef(0);

  const triggerCta = () => {
    if (triggered.current) return;
    triggered.current = true;
    // Never pop out while the first-visit intro still covers the page
    const wait = Math.max(0, ctaNotBefore.current - performance.now());
    window.setTimeout(() => ctaControls.start({ y: 0, opacity: 1, transition: springIn }), wait);
  };

  useEffect(() => {
    ctaNotBefore.current = performance.now() + introSeconds() * 1000 + 500;
  }, []);

  // On mobile, show the CTA straight away — no need to wait for video time
  useEffect(() => {
    if (isMobile) triggerCta();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);

  // Fallback so the CTA never stays hidden if the showreel is slow or fails to load
  useEffect(() => {
    const t = setTimeout(triggerCta, 4000 + introSeconds() * 1000);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTimeUpdate = (e: Event) => {
    const video = e.target as HTMLVideoElement;
    const ctaTimestamp = isMobile ? CTA_TIMESTAMP_MOBILE : CTA_TIMESTAMP_DESKTOP;
    if (video.currentTime >= ctaTimestamp) triggerCta();
  };

  // ── Reel tilts towards the cursor, with a glare that follows it ───────
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const rotateX = useSpring(tiltX, { stiffness: 140, damping: 18, mass: 0.6 });
  const rotateY = useSpring(tiltY, { stiffness: 140, damping: 18, mass: 0.6 });
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(30);
  const glareOpacity = useSpring(0, { stiffness: 120, damping: 20 });
  const glare = useMotionTemplate`radial-gradient(520px circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.13), rgba(147,197,253,0.05) 35%, transparent 60%)`;

  const onReelMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || reduceMotion) return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    tiltY.set((px - 0.5) * 9);
    tiltX.set(-(py - 0.5) * 7);
    glareX.set(px * 100);
    glareY.set(py * 100);
    glareOpacity.set(1);
  };
  const onReelLeave = () => {
    tiltX.set(0);
    tiltY.set(0);
    glareOpacity.set(0);
  };

  // ── Leaving the hero: content sinks and dims as the next panel slides over ─
  const { scrollY } = useScroll();
  const sinkY = useTransform(scrollY, [0, 900], [0, reduceMotion ? 0 : 340]);
  const sinkScale = useTransform(scrollY, [0, 900], [1, reduceMotion ? 1 : 0.92]);
  const dim = useTransform(scrollY, [0, 700], [0, reduceMotion ? 0 : 0.65]);

  const lastWord = words.length - 1;
  const textDelay = 0.12 + words.length * 0.09 + 0.4;

  return (
    <section
      ref={sectionRef}
      // Bottom padding leaves room for the next panel, which overlaps the hero's bottom edge.
      // Desktop: the hero owns the whole first screen. It is 48px taller than the viewport
      // to absorb that overlap, so the next section starts exactly at the fold.
      className="relative flex items-center overflow-hidden min-h-[80svh] lg:min-h-[calc(100svh+48px)] pb-14 md:pb-[clamp(72px,9svh,104px)] lg:pb-[100px]"
      style={{ paddingTop: 'clamp(80px, 7vw, 100px)' }}
    >
      <HeroGridCanvas />
      <ImageTrail images={trailImages} targetRef={sectionRef} />
      {/* Bottom fade — blends grid into the page below */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{ height: 140, background: 'linear-gradient(to bottom, transparent, #060B14)', zIndex: 6 }}
      />
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{ background: '#060B14', opacity: dim, zIndex: 20 }}
      />

      <motion.div className="w-full relative z-10" style={{ y: sinkY, scale: sinkScale }}>
        {/* Centred composition; on desktop the column sizes come from .hero-grid in globals.css */}
        <div className="mx-auto max-w-[1440px] min-[1440px]:max-w-none px-6 md:px-12">
          <div className="hero-grid grid grid-cols-1 items-center">

            {/* ── Copy ─────────────────────────────────────────────────── */}
            <div className="order-2 lg:order-1 text-center lg:text-left">
              <Eyebrow className="hidden lg:inline-flex mb-4" />

              {/* The headline only slides, never fades: Chrome doesn't count text first
                  painted at opacity 0 as the Largest Contentful Paint. */}
              <h1
                className="hero-title font-display font-bold text-[length:clamp(40px,11vw,64px)]"
                style={{ color: '#ffffff', lineHeight: 0.98, letterSpacing: '-0.035em' }}
              >
                {words.map((w, i) => (
                  <Fragment key={i}>
                    <span className="inline-block overflow-hidden align-bottom pt-[0.08em] -mt-[0.08em] pb-[0.16em] -mb-[0.16em] pr-[0.1em] -mr-[0.1em]">
                      <span
                        className="hero-word"
                        style={{ '--word-delay': `${0.12 + i * 0.09}s` } as React.CSSProperties}
                      >
                        {i === lastWord && words.length > 1 ? (
                          <span
                            className="hero-shimmer"
                            style={{ fontFamily: 'var(--font-playfair)', fontStyle: 'italic', fontWeight: 700, letterSpacing: '-0.01em' }}
                          >
                            {w}
                          </span>
                        ) : (
                          w
                        )}
                      </span>
                    </span>
                    {i < lastWord && ' '}
                  </Fragment>
                ))}
              </h1>

              <p
                className="hero-rise [--rise:18px] [--rise-duration:1.2s] font-body mt-4 lg:mt-3 mx-auto lg:mx-0 max-w-xl lg:max-w-md line-clamp-2 md:line-clamp-none text-[length:clamp(0.9375rem,1.25vw,1.125rem)] lg:text-[13.5px]"
                style={{
                  color: 'rgba(255,255,255,0.72)',
                  lineHeight: 1.55,
                  '--rise-delay': `${textDelay}s`,
                } as React.CSSProperties}
              >
                {subline ?? DEFAULT_SUBLINE}
              </p>

              {/* Desktop: the CTA rises in under the copy (the nav already links to the work) */}
              <motion.div
                initial={{ y: 28, opacity: 0 }}
                animate={ctaControls}
                className="hidden lg:flex mt-5 [--cta-pad:10px_25px] [--cta-size:0.75rem]"
              >
                <MagneticButton strength={0.25}>
                  <CtaButton />
                </MagneticButton>
              </motion.div>
            </div>

            {/* ── Showreel ─────────────────────────────────────────────── */}
            <div className="order-1 lg:order-2 flex flex-col items-center">
              <Eyebrow className="inline-flex lg:hidden mb-4" />

              {videoPlaybackId && (
                <div className="hero-reel hero-rise [--rise:28px] [--rise-opacity:1] [--rise-duration:1.2s] relative w-full" style={{ perspective: 1400 }}>
                  {/* Soft light pooling behind the frame */}
                  <div
                    aria-hidden="true"
                    className="absolute pointer-events-none"
                    style={{
                      inset: '-12% -8%',
                      background: 'radial-gradient(closest-side, rgba(79,142,247,0.30), rgba(79,142,247,0.08) 55%, transparent)',
                      filter: 'blur(30px)',
                      animation: 'btn-ambient-breathe 6s ease-in-out infinite',
                    }}
                  />
                  <motion.div
                    onPointerMove={onReelMove}
                    onPointerLeave={onReelLeave}
                    style={{
                      rotateX,
                      rotateY,
                      position: 'relative',
                      borderRadius: 32,
                      padding: 6,
                      // Sheen on a tinted navy base: reads as frosted glass from the first
                      // frame, even before (or without) the backdrop blur, which Chrome can
                      // skip while the frame is animating or tilted
                      background: [
                        'linear-gradient(150deg, rgba(255,255,255,0.18) 0%, rgba(79,142,247,0.14) 45%, rgba(255,255,255,0.05) 100%)',
                        'radial-gradient(120% 90% at 20% 0%, rgba(79,142,247,0.22), transparent 60%)',
                        'linear-gradient(rgba(10,18,36,0.82), rgba(8,14,28,0.86))',
                      ].join(', '),
                      backdropFilter: 'blur(18px)',
                      WebkitBackdropFilter: 'blur(18px)',
                      border: '1px solid rgba(147,197,253,0.26)',
                      boxShadow: [
                        'inset 0 1px 0 rgba(255,255,255,0.18)',
                        '0 30px 70px rgba(0,0,0,0.55)',
                        '0 0 60px rgba(79,142,247,0.20)',
                      ].join(', '),
                    }}
                  >
                    {/* Light travelling round the frame, plus its soft bloom */}
                    <div aria-hidden="true" className="hero-orbit hero-orbit-bloom" />
                    <div aria-hidden="true" className="hero-orbit" />

                    <div
                      className="hero-unveil"
                      style={{
                        position: 'relative',
                        borderRadius: 26,
                        overflow: 'hidden',
                        aspectRatio: '16 / 9',
                        background: '#04070d',
                      }}
                    >
                      <div className="hero-settle absolute inset-0">
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
                        {playerReady && <MuxPlayer
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
                        />}
                      </div>
                      {/* Glare that follows the cursor across the glass */}
                      <motion.div
                        aria-hidden="true"
                        className="absolute inset-0 pointer-events-none"
                        style={{ background: glare, opacity: glareOpacity, mixBlendMode: 'screen' }}
                      />
                    </div>
                  </motion.div>
                </div>
              )}

              {/* Phones: the CTA bounces out from under the reel */}
              <motion.div
                initial={{ y: videoPlaybackId ? -64 : 0, opacity: 0 }}
                animate={ctaControls}
                className="flex lg:hidden justify-center mt-5 mb-6"
                style={{ position: 'relative', zIndex: 1 }}
              >
                <CtaButton />
              </motion.div>
            </div>

          </div>
        </div>
      </motion.div>
    </section>
  );
}
