'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { urlForImage, sizedImageUrl } from '@/lib/sanity';
import { prefetchMuxPlayer } from '@/lib/muxPlayer';
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

  const caption = [project.client?.name, project.strategicNote].filter(Boolean).join(' · ');

  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={onClick}
      onPointerDown={prefetchMuxPlayer}
      onMouseEnter={() => previewSrc && setPreview(true)}
      onMouseLeave={() => setPreview(false)}
      data-cursor="play"
      whileHover={{ y: -6 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative flex-shrink-0 ${finalWidth} text-left`}
    >
      <div
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
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />

        {previewMounted && previewSrc && (
          /* Mux animated preview — a few hundred KB, far lighter than a player */
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={previewUrl()}
            alt=""
            aria-hidden="true"
            onLoad={() => setPreviewLoaded(true)}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-500"
            style={{ opacity: previewing && previewLoaded ? 1 : 0 }}
          />
        )}

        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ background: 'rgba(79,142,247,0.08)' }}
        />

        {/* Play affordance */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: 'rgba(10,10,10,0.55)',
              border: '1px solid rgba(79,142,247,0.50)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M4.5 2.5l9 5.5-9 5.5V2.5z" fill="var(--accent)" />
            </svg>
          </div>
        </div>

        {/* Client logo top-right */}
        {project.client?.logoUrl && (
          <div className="absolute top-3 right-3 md:top-4 md:right-4 h-8 md:h-10 w-14 md:w-16 flex items-center justify-end">
            {/* Logos are user-supplied; keep <img> for SVG/url flexibility. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={sizedImageUrl(project.client.logoUrl, 40)}
              loading="lazy"
              decoding="async"
              alt={project.client.name}
              className="max-h-full max-w-full object-contain opacity-80"
            />
          </div>
        )}

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
