'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { LiquidMelt, warmMelt } from '@/lib/liquidMelt';
import { formatDuration, mediaUrl, posterUrl, ratioLabel, type WorkItem } from '@/lib/work';

interface WorkCardProps {
  item: WorkItem;
  index: number;
  onOpen: () => void;
  /** First cards on the page: load the poster eagerly. */
  eager?: boolean;
}

/**
 * One piece of work: a 4:3 crop of the video. Hovering melts the poster away (lib/liquidMelt)
 * to reveal the clip already playing underneath; on phones it plays while the card crosses
 * the middle of the screen. Clicking opens it full size in its own shape (WorkModal).
 */
export default function WorkCard({ item, index, onOpen, eager = false }: WorkCardProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const meltHostRef = useRef<HTMLDivElement>(null);
  const liveRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const melt = useRef<LiquidMelt | null>(null);
  const pointer = useRef({ x: 0.5, y: 1 });
  const [playing, setPlaying] = useState(false);
  const still = posterUrl(item);

  // The light (≤720p) file plays in the card on every device: a card is never wider than
  // ~600px, so it looks just as sharp as the full file and starts faster
  const attach = (preload: 'auto' | 'metadata') => {
    const v = videoRef.current;
    if (!v) return;
    if (!v.getAttribute('src')) v.src = mediaUrl(item.sd);
    if (preload === 'auto') v.preload = 'auto';
  };

  // Desktop: once the page is idle, cards near the screen start buffering their clip, so a
  // hover plays at once. Phones only fetch the card being watched.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(hover: none)').matches) return;
    let io: IntersectionObserver | undefined;
    const start = () => {
      io = new IntersectionObserver(
        ([e]) => {
          if (!e.isIntersecting) return;
          warmMelt(still);
          attach('auto');
          io?.disconnect();
        },
        { rootMargin: '400px 0px' },
      );
      io.observe(el);
    };
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 400));
    const cancelIdle = window.cancelIdleCallback ?? window.clearTimeout;
    let id: number | undefined;
    const schedule = () => {
      id = idle(start, { timeout: 2500 });
    };
    if (document.readyState === 'complete') schedule();
    else window.addEventListener('load', schedule, { once: true });
    return () => {
      window.removeEventListener('load', schedule);
      if (id !== undefined) cancelIdle(id);
      io?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [still]);

  // Phones: play while the card crosses the middle band of the screen
  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia('(hover: none)').matches) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && window.scrollY < 1) return; // nothing plays before the visitor scrolls
        setPlaying(e.isIntersecting);
      },
      { rootMargin: '-38% 0px -38% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    const v = videoRef.current;
    const setLive = (on: boolean) => {
      if (liveRef.current) liveRef.current.style.visibility = on ? 'visible' : 'hidden';
    };
    if (playing) {
      attach('auto');
      v?.play().catch(() => {});
    }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!meltHostRef.current || reduce) {
      setLive(playing);
      if (!playing) v?.pause();
      return;
    }
    melt.current ??= new LiquidMelt(meltHostRef.current, still);
    melt.current.pointer = pointer.current;
    if (playing) melt.current.to(1, { onCovered: () => setLive(true) });
    else
      melt.current.to(0, {
        onDone: () => {
          setLive(false);
          v?.pause();
        },
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, still]);
  useEffect(() => () => melt.current?.dispose(), []);

  const track = (e: React.MouseEvent) => {
    const r = innerRef.current?.getBoundingClientRect();
    if (!r) return;
    pointer.current.x = (e.clientX - r.left) / r.width;
    pointer.current.y = (e.clientY - r.top) / r.height;
  };

  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={onOpen}
      onMouseEnter={(e) => {
        track(e);
        setPlaying(true);
      }}
      onMouseMove={track}
      onMouseLeave={(e) => {
        track(e);
        setPlaying(false);
      }}
      data-cursor="play"
      whileHover={{ y: -6 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="group relative block w-full text-left"
      aria-label={`Watch ${item.title}`}
    >
      <div
        ref={innerRef}
        className="card-inner relative overflow-hidden rounded-2xl aspect-[4/3]"
        style={{
          background: 'var(--surface)',
          border: '1px solid rgba(79,142,247,0.14)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04)',
          transition: 'border-color 0.35s ease, box-shadow 0.35s ease',
        }}
      >
        <Image
          src={mediaUrl(item.poster)}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          loading={eager ? 'eager' : 'lazy'}
          className="object-cover"
        />

        {/* The clip, under the melt */}
        <div ref={liveRef} aria-hidden="true" className="absolute inset-0" style={{ visibility: 'hidden' }}>
          <video
            ref={videoRef}
            muted
            loop
            playsInline
            preload="none"
            disablePictureInPicture
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>

        {/* The liquid melt draws its canvas in here while it runs */}
        <div ref={meltHostRef} aria-hidden="true" className="absolute inset-0 pointer-events-none" />

        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ background: 'linear-gradient(to top, rgba(6,11,20,0.35), transparent 45%)' }}
        />
      </div>

      <div className="mt-4 flex items-baseline justify-between gap-4">
        <div className="flex items-baseline gap-3 min-w-0">
          <span className="font-body text-xs tabular-nums" style={{ color: 'var(--accent)' }}>
            {String(index + 1).padStart(2, '0')}
          </span>
          <h3 className="font-display font-semibold text-text text-base md:text-lg leading-tight truncate">
            {item.title}
          </h3>
        </div>
        <span className="font-body text-xs text-text-muted whitespace-nowrap tabular-nums">
          {ratioLabel(item.width, item.height)} · {formatDuration(item.duration)}
        </span>
      </div>
      {item.note && <p className="mt-1.5 pl-7 font-body text-sm text-text-muted line-clamp-1">{item.note}</p>}
    </motion.button>
  );
}
