'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { lenisInstance } from '@/components/SmoothScroll';
import VideoPlayer from '@/components/work/VideoPlayer';
import { mediaUrl, type WorkItem } from '@/lib/work';

interface WorkModalProps {
  items: WorkItem[];
  /** Index into `items` of the open piece, or null when closed. */
  index: number | null;
  onIndexChange: (index: number | null) => void;
  whatsappNumber?: string;
}

const noop = () => () => {};

const navBtn =
  'font-body text-sm px-4 py-2 rounded-full transition-colors text-text-muted hover:text-text';

/**
 * Full-size view: the video in its original shape, as large as the screen allows, with sound
 * and our own controls (VideoPlayer). Clicking anywhere outside the video, title or buttons
 * closes it, as does Esc or the close button.
 */
export default function WorkModal({ items, index, onIndexChange, whatsappNumber }: WorkModalProps) {
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const item = index !== null ? items[index] ?? null : null;
  const isOpen = item !== null;
  const count = items.length;
  // Server snapshot is false, so SSR and hydration render nothing (the portal needs document)
  const mounted = useSyncExternalStore(noop, () => true, () => false);

  const close = () => onIndexChange(null);
  const step = (delta: number) => {
    if (index === null || count < 2) return;
    onIndexChange((index + delta + count) % count);
  };

  useEffect(() => {
    if (!isOpen) return;
    lenisInstance?.stop();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      lenisInstance?.start();
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    // Arrow keys belong to the player (seeking); Shift+arrows step between pieces there
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !document.fullscreenElement) close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // Phones start on the light file: sharp at phone size, and kind to mobile data
  const preferSd = typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches;

  const whatsappHref =
    whatsappNumber && item
      ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
          `Hi Harsh, I saw "${item.title}" on your site and I'd like something like it.`,
        )}`
      : null;

  if (!mounted) return null;

  // Rendered straight into .site-shell (keeps its cursor rules, creates no stacking of its
  // own): inside the page, a section's stacking (the home hero sits above the work section)
  // would paint over the fixed modal as a band that moves with scroll
  return createPortal(
    <AnimatePresence>
      {item && (
        <motion.div
          key="work-modal"
          role="dialog"
          aria-modal="true"
          aria-label={item.title}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 overflow-y-auto"
          style={{
            background: 'rgba(6, 11, 20, 0.88)',
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
            className="fixed top-4 right-4 md:top-6 md:right-6 z-10 w-12 h-12 rounded-full flex items-center justify-center transition-colors text-text"
            style={{ border: '1px solid var(--border)', background: 'rgba(10,16,32,0.7)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>

          <motion.div
            key={item.slug}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full flex flex-col items-center gap-5 my-auto"
          >
            {/* The original shape, as large as fits: width is capped by the screen height so
                the title and buttons below always stay on screen */}
            <div
              className="relative w-full rounded-2xl md:rounded-3xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              style={{
                aspectRatio: `${item.width} / ${item.height}`,
                maxWidth: `min(100%, calc(72svh * ${item.width} / ${item.height}))`,
                background: '#000',
                boxShadow: '0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(147,197,253,0.12)',
              }}
            >
              <VideoPlayer
                key={item.slug}
                hd={mediaUrl(item.hd)}
                sd={mediaUrl(item.sd)}
                poster={mediaUrl(item.poster)}
                title={item.title}
                preferSd={preferSd}
                onPrev={count > 1 ? () => step(-1) : undefined}
                onNext={count > 1 ? () => step(1) : undefined}
              />
            </div>

            <div className="text-center max-w-2xl" onClick={(e) => e.stopPropagation()}>
              <h2 className="font-display font-semibold text-text text-xl md:text-3xl">{item.title}</h2>
              {item.note && (
                <p className="mt-2 font-body text-text-muted text-sm md:text-base" style={{ lineHeight: 1.65 }}>
                  {item.note}
                </p>
              )}
            </div>

            {(count > 1 || whatsappHref) && (
              <div className="flex items-center justify-center gap-2 md:gap-3 flex-wrap" onClick={(e) => e.stopPropagation()}>
                {count > 1 && (
                  <button
                    type="button"
                    onClick={() => step(-1)}
                    className={navBtn}
                    style={{ border: '1px solid var(--border)' }}
                    aria-label="Previous video"
                    title="Previous (Shift + ←)"
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
                    aria-label="Next video"
                    title="Next (Shift + →)"
                  >
                    Next →
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.querySelector('.site-shell') ?? document.body,
  );
}
