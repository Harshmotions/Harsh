'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MuxPlayer from '@mux/mux-player-react';
import { lenisInstance } from '@/components/SmoothScroll';
import type { Project } from '@/lib/types';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  const closeRef = useRef<HTMLButtonElement | null>(null);

  // Pause Lenis + lock body scroll + swap to native cursor while open.
  // The `modal-open` body class tells globals.css to:
  //   1. hide the custom amber cursor (which fights with Mux's controls)
  //   2. restore native cursor inside .site-shell so Mux's own hide-on-inactivity
  //      logic works both in the modal and in fullscreen.
  useEffect(() => {
    if (!project) return;

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
  }, [project]);

  // ESC to close
  useEffect(() => {
    if (!project) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [project, onClose]);

  const playbackId = project?.muxVideo?.asset?.playbackId;
  const isReel = project?.type === 'reel';
  const aspectClass = isReel ? 'aspect-[9/16]' : 'aspect-video';

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
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
          style={{
            background: 'rgba(10, 10, 10, 0.85)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
          onClick={onClose}
        >
          {/* Close button */}
          <button
            ref={closeRef}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            aria-label="Close"
            className="fixed top-6 right-6 z-10 w-12 h-12 rounded-full flex items-center justify-center transition-colors"
            style={{
              border: '1px solid var(--border)',
              background: 'rgba(20,20,20,0.7)',
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-5xl flex flex-col items-center gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Player */}
            <div
              className={`relative w-full ${aspectClass} rounded-3xl overflow-hidden bg-bg`}
              style={{
                maxHeight: '80vh',
                maxWidth: isReel ? 'min(420px, 80vw)' : '100%',
              }}
            >
              {playbackId ? (
                <MuxPlayer
                  playbackId={playbackId}
                  metadata={{
                    video_title: project.title,
                    player_name: 'harsh-portfolio',
                  }}
                  streamType="on-demand"
                  autoPlay
                  style={{
                    width: '100%',
                    height: '100%',
                    '--controls-backdrop-color': 'rgba(10,10,10,0.4)',
                    // contain (default) preserves aspect ratio — critical in fullscreen
                    // so vertical reels letterbox instead of stretching to 16:9.
                    '--media-object-fit': 'contain',
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text-muted font-body text-sm">
                  Video is still processing on Mux — check back in a moment.
                </div>
              )}
            </div>

            {/* Metadata */}
            <div className="text-center max-w-2xl">
              <h2 className="font-display font-semibold text-text text-2xl md:text-3xl mb-2">
                {project.title}
              </h2>
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
                <p
                  className="mt-4 font-body text-text-muted text-sm md:text-base"
                  style={{ lineHeight: 1.65 }}
                >
                  {project.strategicNote}
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
