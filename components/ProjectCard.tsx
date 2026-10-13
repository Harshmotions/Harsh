'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { urlForImage } from '@/lib/sanity';
import { prefetchMuxPlayer } from '@/lib/muxPlayer';
import { LiquidMelt, warmMelt } from '@/lib/liquidMelt';
import type { Project } from '@/lib/types';

interface ProjectCardProps {
  project: Project;
  onClick?: () => void;
  /** Card variant. Defaults to project.type. */
  variant?: 'reel' | 'landscape';
  /** Tailwind width class override. */
  widthClass?: string;
  /** Above-the-fold cards: skip lazy loading ('high' also boosts fetch priority, for the LCP card). */
  load?: 'lazy' | 'eager' | 'high';
  /** Title heading level, so card titles fit the page's outline. */
  titleAs?: 'h2' | 'h3';
}

export default function ProjectCard({
  project,
  onClick,
  variant,
  widthClass,
  load = 'lazy',
  titleAs: Title = 'h3',
}: ProjectCardProps) {
  const isReel = (variant ?? project.type) === 'reel';
  const aspectClass = isReel ? 'aspect-[9/16]' : 'aspect-[16/9]';
  const defaultWidth = isReel
    ? 'w-[280px] sm:w-[320px] md:w-[360px]'
    : 'w-[480px] sm:w-[560px] md:w-[680px]';
  const finalWidth = widthClass ?? defaultWidth;

  const src = urlForImage(project.thumbnail).width(900).quality(85).url();
  const alt = project.thumbnail.alt || project.title;

  const playbackId = project.muxVideo?.asset?.playbackId;
  const previewSrc = playbackId ? `https://image.mux.com/${playbackId}/animated.webp` : null;
  // Only called once a preview is wanted (always client-side). Phones get a smaller,
  // lower-fps loop: the cards are half as wide and it's often mobile data.
  const previewUrl = () => {
    const touch = window.matchMedia('(hover: none)').matches;
    const width = isReel ? (touch ? 240 : 320) : touch ? 360 : 480;
    return `${previewSrc}?width=${width}&start=0.5&end=4.5&fps=${touch ? 12 : 15}`;
  };

  const ref = useRef<HTMLButtonElement>(null);
  const [previewing, setPreviewing] = useState(false);
  // Mount the preview only once it's first wanted, then keep it so re-hovers are instant.
  const [previewMounted, setPreviewMounted] = useState(false);
  const [previewLoaded, setPreviewLoaded] = useState(false);

  const setPreview = (on: boolean) => {
    if (on) {
      setPreviewMounted(true);
      // A preview playing is a good sign a video gets opened next: warm up the player
      prefetchMuxPlayer();
    }
    setPreviewing(on);
  };

  // Touch devices have no hover — play the preview while the card crosses
  // the middle band of the screen, so roughly one row animates at a time.
  useEffect(() => {
    const el = ref.current;
    if (!el || !previewSrc || !window.matchMedia('(hover: none)').matches) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        // Don't start downloading loops on page load, only once the visitor scrolls
        if (entry.isIntersecting && window.scrollY < 1) return;
        setPreview(entry.isIntersecting);
      },
      { rootMargin: '-40% 0px -40% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [previewSrc]);

  // Liquid melt between the still and the clip (see lib/liquidMelt). It melts from the
  // still to the clip's first frame, then the live preview takes over from that same frame.
  // The still is read through the site's own image optimizer: WebGL needs a same-origin
  // (or CORS) image, and the Sanity CDN only allows CORS for listed origins.
  const stillTex = `/_next/image?url=${encodeURIComponent(src)}&w=828&q=75`;
  const firstFrame = playbackId
    ? `https://image.mux.com/${playbackId}/thumbnail.jpg?time=0.5&width=${isReel ? 540 : 960}`
    : null;
  const innerRef = useRef<HTMLDivElement>(null);
  const meltHostRef = useRef<HTMLDivElement>(null);
  const liveRef = useRef<HTMLDivElement>(null);
  const melt = useRef<LiquidMelt | null>(null);
  // Where the melt starts from: the cursor (phones: bottom centre, as the card scrolls up)
  const pointer = useRef({ x: 0.5, y: 1 });
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    const live = liveRef.current;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!firstFrame || !meltHostRef.current || reduce) {
      if (live) live.style.visibility = previewing ? 'visible' : 'hidden';
      return;
    }
    melt.current ??= new LiquidMelt(meltHostRef.current, stillTex, firstFrame);
    melt.current.pointer = pointer.current;
    if (!previewing && live) live.style.visibility = 'hidden';
    melt.current.to(previewing ? 1 : 0, (t) => {
      if (t === 1 && liveRef.current) liveRef.current.style.visibility = 'visible';
    });
  }, [previewing, firstFrame, stillTex]);
  useEffect(() => () => melt.current?.dispose(), []);

  // Desktop: fetch the two melt frames once the card is near the screen, so even the
  // first hover melts straight away
  useEffect(() => {
    const el = ref.current;
    if (!el || !firstFrame || !window.matchMedia('(hover: hover)').matches) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        warmMelt(stillTex, firstFrame);
        io.disconnect();
      },
      { rootMargin: '300px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [firstFrame, stillTex]);

  const trackPointer = (e: React.MouseEvent) => {
    const r = innerRef.current?.getBoundingClientRect();
    if (!r) return;
    pointer.current.x = (e.clientX - r.left) / r.width;
    pointer.current.y = (e.clientY - r.top) / r.height;
  };

  const caption = project.strategicNote;

  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={onClick}
      onPointerDown={prefetchMuxPlayer}
      onMouseEnter={(e) => {
        if (!previewSrc) return;
        trackPointer(e);
        setPreview(true);
      }}
      onMouseMove={trackPointer}
      onMouseLeave={(e) => {
        trackPointer(e);
        setPreview(false);
      }}
      data-cursor="play"
      whileHover={{ y: -6 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative flex-shrink-0 ${finalWidth} text-left`}
    >
      <div
        ref={innerRef}
        className={`card-inner relative overflow-hidden rounded-2xl ${aspectClass}`}
        style={{
          background: 'var(--surface)',
          border: '1px solid rgba(79,142,247,0.14)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04)',
          transition: 'border-color 0.35s ease, box-shadow 0.35s ease',
        }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={isReel ? '(max-width: 768px) 50vw, 25vw' : '(max-width: 768px) 100vw, 50vw'}
          loading={load === 'lazy' ? 'lazy' : 'eager'}
          fetchPriority={load === 'high' ? 'high' : undefined}
          className="object-cover"
        />

        {/* The liquid melt draws its canvas in here while it runs */}
        <div ref={meltHostRef} aria-hidden="true" className="absolute inset-0 pointer-events-none" />

        {previewMounted && previewSrc && (
          /* Live layer, shown once the melt lands: the Mux animated preview (a few hundred
             KB, far lighter than a player) over the clip's first frame, which is exactly
             where the melt ended, for the moment before the preview has loaded */
          <div ref={liveRef} aria-hidden="true" className="absolute inset-0" style={{ visibility: 'hidden' }}>
            {firstFrame && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={firstFrame} alt="" className="absolute inset-0 w-full h-full object-cover" />
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl()}
              alt=""
              onLoad={() => setPreviewLoaded(true)}
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
              style={{ opacity: previewLoaded ? 1 : 0 }}
            />
          </div>
        )}

        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ background: 'rgba(79,142,247,0.08)' }}
        />

        {/* Role tag + Retainer — single bottom bar, wraps on narrow cards */}
        {(project.roleTag || project.isRetainer) && (
          <div className="absolute bottom-3 left-3 right-3 md:bottom-4 md:left-4 md:right-4 flex flex-row flex-wrap gap-2 items-end">
            {project.roleTag && (
              <span
                // Half-width reel cards on phones are too small for a label; the title says it below
                className={`${isReel ? 'hidden md:inline-flex' : 'inline-flex'} items-center px-3 py-1 rounded-full text-xs font-body font-medium`}
                style={{
                  background: 'rgba(10,10,10,0.7)',
                  color: 'var(--text)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  border: '1px solid var(--border)',
                  whiteSpace: 'nowrap',
                }}
              >
                {project.roleTag}
              </span>
            )}
            {project.isRetainer && (
              <span
                className="inline-flex items-center px-2 py-0.5 text-[10px] md:px-3 md:py-1 md:text-xs rounded-full font-body font-semibold"
                style={{ background: 'var(--accent)', color: 'var(--bg)', whiteSpace: 'nowrap' }}
              >
                Retainer
              </span>
            )}
          </div>
        )}
      </div>

      <Title className="mt-3 md:mt-4 font-display font-semibold text-text leading-tight text-base md:text-lg">
        {project.title}
      </Title>
      {caption && (
        <p className="mt-1 font-body text-text-muted text-sm line-clamp-1">{caption}</p>
      )}
    </motion.button>
  );
}
