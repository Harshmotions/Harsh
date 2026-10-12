'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { lenisInstance } from '@/components/SmoothScroll';
import { loadMuxPlayer } from '@/lib/muxPlayer';
import type { Project } from '@/lib/types';

// Not in the page bundle; cards prefetch it (prefetchMuxPlayer) when a preview starts.
const MuxPlayer = dynamic(loadMuxPlayer, { ssr: false });

interface ProjectModalProps {
  projects: Project[];
  /** Index into `projects` of the open project, or null when closed. */
  index: number | null;
  onIndexChange: (index: number | null) => void;
  whatsappNumber?: string;
}

const navBtn =
  'font-body text-sm px-4 py-2 rounded-full transition-colors text-text-muted hover:text-text';

export default function ProjectModal({
  projects,
  index,
  onIndexChange,
  whatsappNumber,
}: ProjectModalProps) {
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const project = index !== null ? projects[index] ?? null : null;
  const isOpen = project !== null;
  const count = projects.length;

  const close = () => onIndexChange(null);
  const step = (delta: number) => {
    if (index === null || count < 2) return;
    onIndexChange((index + delta + count) % count);
  };

  // Pause Lenis + lock body scroll + swap to native cursor while open.
  // The `modal-open` body class tells globals.css to hide the custom cursor
  // (which fights with Mux's controls) and restore the native one.
  useEffect(() => {
    if (!isOpen) return;

    lenisInstance?.stop();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.body.classList.add('modal-open');
    closeRef.current?.focus();

    return () => {
      lenisInstance?.start();
      document.body.style.overflow = prevOverflow;
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') step(1);
      else if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const playbackId = project?.muxVideo?.asset?.playbackId;
  const isReel = project?.type === 'reel';
  const whatsappHref =
    whatsappNumber && project
      ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
          `Hi Harsh, I saw "${project.title}" on your site and I'd like something like it.`,
        )}`
      : null;

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          key="modal"
          role="dialog"
          aria-modal="true"
          aria-label={project.title}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 overflow-y-auto"
          style={{
            background: 'rgba(10, 10, 10, 0.85)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
          onClick={close}
        >
          <button
            ref={closeRef}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              close();
            }}
            aria-label="Close"
            className="fixed top-4 right-4 md:top-6 md:right-6 z-10 w-12 h-12 rounded-full flex items-center justify-center transition-colors"
            style={{ border: '1px solid var(--border)', background: 'rgba(20,20,20,0.7)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>

          <motion.div
            key={project._id}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-5xl flex flex-col items-center gap-5 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Width is capped by viewport height so the controls below always fit on screen */}
            <div
              className={`relative w-full ${isReel ? 'aspect-[9/16]' : 'aspect-video'} rounded-3xl overflow-hidden bg-bg`}
              style={{
                maxWidth: isReel
                  ? 'min(420px, 80vw, calc(66vh * 9 / 16))'
                  : 'min(100%, calc(66vh * 16 / 9))',
              }}
            >
              {playbackId ? (
                <MuxPlayer
                  key={playbackId}
                  playbackId={playbackId}
                  metadata={{ video_title: project.title, player_name: 'harsh-portfolio' }}
                  // Phones: 720p is sharp at that size and starts/buffers much faster
                  maxResolution={window.matchMedia('(max-width: 767px)').matches ? '720p' : undefined}
                  streamType="on-demand"
                  autoPlay
                  style={{
                    width: '100%',
                    height: '100%',
                    '--controls-backdrop-color': 'rgba(10,10,10,0.4)',
                    // contain preserves aspect ratio — critical in fullscreen
                    // so vertical reels letterbox instead of stretching to 16:9.
                    '--media-object-fit': 'contain',
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text-muted font-body text-sm">
                  Video is still processing. Check back in a moment.
                </div>
              )}
            </div>

            <div className="text-center max-w-2xl">
              <h2 className="font-display font-semibold text-text text-xl md:text-3xl mb-2">{project.title}</h2>
              <div className="flex items-center justify-center gap-3 flex-wrap font-body text-sm text-text-muted">
                {project.client?.name && <span>{project.client.name}</span>}
                {project.client?.name && project.roleTag && <span>·</span>}
                {project.roleTag && <span>{project.roleTag}</span>}
                {project.isRetainer && (
                  <>
                    <span>·</span>
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{ background: 'var(--accent)', color: 'var(--bg)' }}
                    >
                      Retainer
                    </span>
                  </>
                )}
              </div>
              {project.strategicNote && (
                <p className="mt-3 font-body text-text-muted text-sm md:text-base" style={{ lineHeight: 1.65 }}>
                  {project.strategicNote}
                </p>
              )}
            </div>

            {(count > 1 || whatsappHref) && (
              <div className="flex items-center justify-center gap-2 md:gap-3 flex-wrap">
                {count > 1 && (
                  <button
                    type="button"
                    onClick={() => step(-1)}
                    className={navBtn}
                    style={{ border: '1px solid var(--border)' }}
                    aria-label="Previous project"
                  >
                    ← Prev
                  </button>
                )}
                {whatsappHref && (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="order-first sm:order-none w-full sm:w-auto text-center font-body text-sm font-medium px-5 py-2 rounded-full transition-opacity hover:opacity-85"
                    style={{
                      background: 'rgba(255,107,43,0.12)',
                      border: '1px solid rgba(255,107,43,0.40)',
                      color: 'var(--cta)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Start a project like this →
                  </a>
                )}
                {count > 1 && (
                  <button
                    type="button"
                    onClick={() => step(1)}
                    className={navBtn}
                    style={{ border: '1px solid var(--border)' }}
                    aria-label="Next project"
                  >
                    Next →
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
