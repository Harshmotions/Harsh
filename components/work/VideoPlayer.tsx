'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface VideoPlayerProps {
  /** Full quality and light versions of the same video. */
  hd: string;
  sd: string;
  poster: string;
  title: string;
  /** Start on the light version (phones). */
  preferSd?: boolean;
  /** Shift+←/→: previous / next piece. */
  onPrev?: () => void;
  onNext?: () => void;
}

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];
const HIDE_AFTER = 2600;
const FRAME = 1 / 30;

const fmt = (s: number) => {
  if (!Number.isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
};

const store = {
  get: (k: string) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set: (k: string, v: string) => {
    try {
      localStorage.setItem(k, v);
    } catch {}
  },
};

// ---------- icons ----------
const I = {
  play: <path d="M7 4.5v15l12.5-7.5L7 4.5z" fill="currentColor" />,
  pause: (
    <>
      <rect x="6" y="4.5" width="4" height="15" rx="1.2" fill="currentColor" />
      <rect x="14" y="4.5" width="4" height="15" rx="1.2" fill="currentColor" />
    </>
  ),
  back: (
    <>
      <path d="M11 6 5 12l6 6M19 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </>
  ),
  fwd: (
    <>
      <path d="m13 6 6 6-6 6M5 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </>
  ),
  vol: (
    <>
      <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" />
      <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    </>
  ),
  muted: (
    <>
      <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" />
      <path d="m16 9.5 5 5m0-5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </>
  ),
  full: (
    <path d="M4 9V5.5A1.5 1.5 0 0 1 5.5 4H9M15 4h3.5A1.5 1.5 0 0 1 20 5.5V9M20 15v3.5a1.5 1.5 0 0 1-1.5 1.5H15M9 20H5.5A1.5 1.5 0 0 1 4 18.5V15" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" fill="none" />
  ),
  exitFull: (
    <path d="M9 4v3.5A1.5 1.5 0 0 1 7.5 9H4M20 9h-3.5A1.5 1.5 0 0 1 15 7.5V4M15 20v-3.5a1.5 1.5 0 0 1 1.5-1.5H20M4 15h3.5A1.5 1.5 0 0 1 9 16.5V20" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" fill="none" />
  ),
};
const Icon = ({ d, size = 20 }: { d: React.ReactNode; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    {d}
  </svg>
);

function Btn({
  label,
  onClick,
  children,
  active,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className="relative grid place-items-center w-9 h-9 rounded-full transition-colors hover:bg-white/10 focus-visible:bg-white/10"
      style={{ color: active ? 'var(--accent)' : 'rgba(255,255,255,0.92)' }}
    >
      {children}
    </button>
  );
}

/**
 * The full-size player: our own controls on a plain MP4. Shortcuts:
 * Space/K play · ←/→ 5s · J/L 10s · ↑/↓ volume · M mute · F fullscreen · 0–9 jump ·
 * , / . step a frame (paused) · Shift+←/→ previous / next piece.
 */
export default function VideoPlayer({ hd, sd, poster, title, preferSd = false, onPrev, onNext }: VideoPlayerProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  const [quality, setQuality] = useState<'hd' | 'sd'>(preferSd ? 'sd' : 'hd');
  const [playing, setPlaying] = useState(false);
  const [waiting, setWaiting] = useState(true);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(() => {
    const v = parseFloat(store.get('mbh-vol') ?? '');
    return Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 1;
  });
  const [muted, setMuted] = useState(() => store.get('mbh-muted') === '1');
  const [speed, setSpeed] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [menu, setMenu] = useState<null | 'speed'>(null);
  const [visible, setVisible] = useState(true);
  const [hover, setHover] = useState<{ x: number; t: number } | null>(null);
  const [flash, setFlash] = useState<null | 'play' | 'pause' | string>(null);
  const [needsTap, setNeedsTap] = useState(false);
  const scrubbing = useRef(false);
  // where to pick up after switching quality, and whether to keep playing
  const resume = useRef<{ t: number; play: boolean } | null>(null);
  const hideTimer = useRef(0);
  const flashTimer = useRef(0);

  const v = () => videoRef.current;

  // ---------- controls visibility ----------
  const poke = useCallback(() => {
    setVisible(true);
    window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => {
      if (!scrubbing.current) setVisible(false);
    }, HIDE_AFTER);
  }, []);
  useEffect(() => () => window.clearTimeout(hideTimer.current), []);
  const showControls = visible || !playing || menu !== null;

  const showFlash = (f: string) => {
    setFlash(f);
    window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setFlash(null), 550);
  };

  // ---------- actions ----------
  const toggle = useCallback(() => {
    const el = v();
    if (!el) return;
    if (el.paused) {
      el.play().catch(() => {});
      showFlash('play');
    } else {
      el.pause();
      showFlash('pause');
    }
    poke();
  }, [poke]);

  const seekTo = useCallback(
    (t: number) => {
      const el = v();
      if (!el || !Number.isFinite(el.duration)) return;
      el.currentTime = Math.min(el.duration - 0.05, Math.max(0, t));
      setTime(el.currentTime);
      poke();
    },
    [poke],
  );
  const seekBy = useCallback(
    (d: number) => {
      const el = v();
      if (!el) return;
      seekTo(el.currentTime + d);
      showFlash(`${d > 0 ? '+' : '−'}${Math.abs(d)}s`);
    },
    [seekTo],
  );

  const applyVolume = (vol: number, mute: boolean) => {
    const el = v();
    setVolume(vol);
    setMuted(mute);
    if (el) {
      el.volume = vol;
      el.muted = mute;
    }
    store.set('mbh-vol', String(vol));
    store.set('mbh-muted', mute ? '1' : '0');
  };
  const toggleMute = () => {
    if (muted || volume === 0) applyVolume(volume === 0 ? 0.6 : volume, false);
    else applyVolume(volume, true);
    setNeedsTap(false);
    poke();
  };

  const toggleFullscreen = useCallback(() => {
    const el = wrapRef.current as (HTMLDivElement & { webkitRequestFullscreen?: () => void }) | null;
    const video = v() as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else if (el?.requestFullscreen) {
      el.requestFullscreen().catch(() => {});
    } else if (el?.webkitRequestFullscreen) {
      el.webkitRequestFullscreen();
    } else {
      video?.webkitEnterFullscreen?.(); // iPhone: only the video element can go fullscreen
    }
    poke();
  }, [poke]);
  useEffect(() => {
    const onFs = () => setFullscreen(document.fullscreenElement === wrapRef.current);
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  const switchQuality = (q: 'hd' | 'sd') => {
    const el = v();
    if (!el || q === quality) return;
    resume.current = { t: el.currentTime, play: !el.paused };
    setQuality(q);
    setWaiting(true);
    poke();
  };

  // ---------- media events ----------
  const src = quality === 'hd' ? hd : sd;
  useEffect(() => {
    const el = v();
    if (!el) return;
    el.volume = volume;
    el.muted = muted;
    el.playbackRate = speed;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  useEffect(() => {
    const el = v();
    if (el) el.playbackRate = speed;
  }, [speed]);

  const onLoadedMetadata = () => {
    const el = v();
    if (!el) return;
    setDuration(el.duration);
    el.playbackRate = speed;
    const r = resume.current;
    resume.current = null;
    if (r) {
      el.currentTime = r.t;
      if (!r.play) {
        setWaiting(false);
        return;
      }
    }
    // Opened by a click, so sound is allowed; if a browser still refuses, play muted
    el.play().catch(() => {
      el.muted = true;
      setMuted(true);
      setNeedsTap(true);
      el.play().catch(() => {});
    });
  };
  const onProgress = () => {
    const el = v();
    if (!el || !el.duration) return;
    const b = el.buffered;
    for (let i = 0; i < b.length; i++) {
      if (b.start(i) <= el.currentTime + 0.1 && b.end(i) >= el.currentTime) {
        setBuffered(b.end(i) / el.duration);
        return;
      }
    }
  };

  // ---------- scrubbing ----------
  const timeAt = (clientX: number) => {
    const r = barRef.current?.getBoundingClientRect();
    if (!r || !duration) return 0;
    return Math.min(1, Math.max(0, (clientX - r.left) / r.width)) * duration;
  };
  const onBarDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    scrubbing.current = true;
    seekTo(timeAt(e.clientX));
  };
  const onBarMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = barRef.current?.getBoundingClientRect();
    if (r) setHover({ x: Math.min(r.width, Math.max(0, e.clientX - r.left)), t: timeAt(e.clientX) });
    if (scrubbing.current) seekTo(timeAt(e.clientX));
  };
  const onBarUp = () => {
    scrubbing.current = false;
    poke();
  };

  // ---------- keyboard ----------
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = v();
      if (!el) return;
      const k = e.key;
      let handled = true;
      if (e.shiftKey && k === 'ArrowLeft') onPrev?.();
      else if (e.shiftKey && k === 'ArrowRight') onNext?.();
      else if (k === ' ' || k === 'k' || k === 'K') toggle();
      else if (k === 'ArrowLeft') seekBy(-5);
      else if (k === 'ArrowRight') seekBy(5);
      else if (k === 'j' || k === 'J') seekBy(-10);
      else if (k === 'l' || k === 'L') seekBy(10);
      else if (k === 'ArrowUp') {
        applyVolume(Math.min(1, (muted ? 0 : volume) + 0.1), false);
        showFlash(`${Math.round(Math.min(1, (muted ? 0 : volume) + 0.1) * 100)}%`);
      } else if (k === 'ArrowDown') {
        const nv = Math.max(0, volume - 0.1);
        applyVolume(nv, nv === 0);
        showFlash(`${Math.round(nv * 100)}%`);
      } else if (k === 'm' || k === 'M') toggleMute();
      else if (k === 'f' || k === 'F') toggleFullscreen();
      else if (/^[0-9]$/.test(k)) seekTo((parseInt(k, 10) / 10) * (el.duration || 0));
      else if (k === ',' && el.paused) seekTo(el.currentTime - FRAME);
      else if (k === '.' && el.paused) seekTo(el.currentTime + FRAME);
      else handled = false;
      if (handled) {
        e.preventDefault();
        poke();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // ---------- render ----------
  const pct = duration ? (time / duration) * 100 : 0;
  const pointerIdle = fullscreen && !showControls;

  return (
    <div
      ref={wrapRef}
      className={`relative w-full h-full select-none ${pointerIdle ? 'player-idle' : ''}`}
      style={{ background: '#000' }}
      onPointerMove={poke}
      onPointerDown={poke}
      onMouseLeave={() => playing && setVisible(false)}
    >
      <video
        ref={videoRef}
        key={src}
        src={src}
        poster={poster}
        playsInline
        loop
        preload="auto"
        disablePictureInPicture
        aria-label={title}
        className="absolute inset-0 w-full h-full"
        style={{ objectFit: 'contain' }}
        onLoadedMetadata={onLoadedMetadata}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onWaiting={() => setWaiting(true)}
        onPlaying={() => setWaiting(false)}
        onCanPlay={() => setWaiting(false)}
        onTimeUpdate={(e) => !scrubbing.current && setTime(e.currentTarget.currentTime)}
        onProgress={onProgress}
        onDurationChange={(e) => setDuration(e.currentTarget.duration)}
        onClick={(e) => {
          // touch: the first tap only brings the controls back
          if ((e.nativeEvent as PointerEvent).pointerType === 'touch' && !showControls) return poke();
          toggle();
        }}
        onDoubleClick={toggleFullscreen}
      />

      {/* Buffering */}
      {waiting && playing && (
        <div className="absolute inset-0 grid place-items-center pointer-events-none">
          <span
            className="block w-10 h-10 rounded-full animate-spin"
            style={{ border: '2px solid rgba(255,255,255,0.18)', borderTopColor: 'var(--accent)' }}
          />
        </div>
      )}

      {/* Centre feedback for play / pause / seek / volume */}
      <AnimatePresence>
        {flash && (
          <motion.div
            key={flash + time.toFixed(1)}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.12 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 grid place-items-center pointer-events-none"
          >
            <span
              className="grid place-items-center rounded-full font-body text-sm font-semibold text-white"
              style={{ minWidth: 64, height: 64, padding: '0 14px', background: 'rgba(6,11,20,0.55)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
            >
              {flash === 'play' ? <Icon d={I.play} size={26} /> : flash === 'pause' ? <Icon d={I.pause} size={26} /> : flash}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Paused: a big play button */}
      {!playing && !waiting && !flash && (
        <button
          type="button"
          onClick={toggle}
          aria-label="Play"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 grid place-items-center rounded-full text-white transition-transform hover:scale-105"
          style={{ width: 72, height: 72, background: 'rgba(6,11,20,0.55)', border: '1px solid rgba(147,197,253,0.45)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', boxShadow: '0 0 30px rgba(79,142,247,0.35)' }}
        >
          <Icon d={I.play} size={28} />
        </button>
      )}

      {/* Sound was blocked by the browser */}
      {needsTap && (
        <button
          type="button"
          onClick={toggleMute}
          className="absolute top-3 left-3 flex items-center gap-2 rounded-full px-3.5 py-2 font-body text-xs font-semibold text-white"
          style={{ background: 'rgba(6,11,20,0.7)', border: '1px solid rgba(147,197,253,0.4)' }}
        >
          <Icon d={I.muted} size={16} /> Tap for sound
        </button>
      )}

      {/* Controls */}
      <div
        className="absolute inset-x-0 bottom-0 transition-opacity duration-300"
        style={{ opacity: showControls ? 1 : 0, pointerEvents: showControls ? 'auto' : 'none' }}
      >
        <div
          className="absolute inset-x-0 bottom-0 h-32 pointer-events-none"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75), rgba(0,0,0,0.35) 55%, transparent)' }}
        />
        <div className="relative px-3 md:px-4 pb-2.5 md:pb-3">
          {/* Scrub bar */}
          <div
            ref={barRef}
            role="slider"
            aria-label="Seek"
            aria-valuemin={0}
            aria-valuemax={Math.round(duration)}
            aria-valuenow={Math.round(time)}
            aria-valuetext={`${fmt(time)} of ${fmt(duration)}`}
            tabIndex={0}
            className="group/bar relative h-5 flex items-center touch-none"
            onPointerDown={onBarDown}
            onPointerMove={onBarMove}
            onPointerUp={onBarUp}
            onPointerLeave={() => setHover(null)}
          >
            <div className="relative w-full h-1 group-hover/bar:h-1.5 transition-[height] duration-150 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.18)' }}>
              <div className="absolute inset-y-0 left-0" style={{ width: `${buffered * 100}%`, background: 'rgba(255,255,255,0.28)' }} />
              <div className="absolute inset-y-0 left-0" style={{ width: `${pct}%`, background: 'var(--accent)', boxShadow: '0 0 10px rgba(79,142,247,0.8)' }} />
            </div>
            <span
              className="absolute w-3.5 h-3.5 -ml-[7px] rounded-full bg-white scale-0 group-hover/bar:scale-100 transition-transform"
              style={{ left: `${pct}%`, boxShadow: '0 0 0 4px rgba(79,142,247,0.35)' }}
            />
            {hover && (
              <span
                className="absolute bottom-6 -translate-x-1/2 px-2 py-1 rounded-md font-body text-[11px] font-semibold tabular-nums text-white pointer-events-none"
                style={{ left: hover.x, background: 'rgba(6,11,20,0.85)', border: '1px solid rgba(147,197,253,0.25)' }}
              >
                {fmt(hover.t)}
              </span>
            )}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-0.5 md:gap-1 mt-0.5">
            <Btn label={playing ? 'Pause (K)' : 'Play (K)'} onClick={toggle}>
              <Icon d={playing ? I.pause : I.play} />
            </Btn>
            <Btn label="Back 5 seconds (←)" onClick={() => seekBy(-5)}>
              <Icon d={I.back} size={18} />
            </Btn>
            <Btn label="Forward 5 seconds (→)" onClick={() => seekBy(5)}>
              <Icon d={I.fwd} size={18} />
            </Btn>

            <div className="group/vol flex items-center">
              <Btn label={muted || volume === 0 ? 'Unmute (M)' : 'Mute (M)'} onClick={toggleMute}>
                <Icon d={muted || volume === 0 ? I.muted : I.vol} />
              </Btn>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={muted ? 0 : volume}
                onChange={(e) => {
                  const nv = parseFloat(e.target.value);
                  applyVolume(nv, nv === 0);
                  setNeedsTap(false);
                }}
                aria-label="Volume"
                className="player-volume hidden md:block w-0 group-hover/vol:w-20 focus:w-20 transition-[width] duration-200"
                style={{ '--vol': `${(muted ? 0 : volume) * 100}%` } as React.CSSProperties}
              />
            </div>

            <span className="ml-1.5 font-body text-xs tabular-nums text-white/85 whitespace-nowrap">
              {fmt(time)} <span className="text-white/45">/ {fmt(duration)}</span>
            </span>

            <div className="flex-1" />

            {/* Speed */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenu(menu === 'speed' ? null : 'speed')}
                title="Playback speed"
                aria-label="Playback speed"
                aria-expanded={menu === 'speed'}
                className="h-9 px-2.5 rounded-full font-body text-xs font-semibold tabular-nums transition-colors hover:bg-white/10"
                style={{ color: speed !== 1 ? 'var(--accent)' : 'rgba(255,255,255,0.92)' }}
              >
                {speed}×
              </button>
              {menu === 'speed' && (
                <div
                  role="menu"
                  className="absolute bottom-11 right-0 py-1.5 rounded-xl min-w-[96px] overflow-hidden"
                  style={{ background: 'rgba(10,16,32,0.94)', border: '1px solid rgba(147,197,253,0.2)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
                >
                  {SPEEDS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      role="menuitemradio"
                      aria-checked={s === speed}
                      onClick={() => {
                        setSpeed(s);
                        setMenu(null);
                        poke();
                      }}
                      className="flex w-full items-center justify-between gap-3 px-3.5 py-1.5 font-body text-xs tabular-nums hover:bg-white/10"
                      style={{ color: s === speed ? 'var(--accent)' : 'rgba(255,255,255,0.9)' }}
                    >
                      {s === 1 ? 'Normal' : `${s}×`}
                      {s === speed && <span>●</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quality */}
            <button
              type="button"
              onClick={() => switchQuality(quality === 'hd' ? 'sd' : 'hd')}
              title={quality === 'hd' ? 'Full quality (1080p). Switch to data saver' : 'Data saver (720p). Switch to full quality'}
              aria-label={quality === 'hd' ? 'Quality: full. Switch to data saver' : 'Quality: data saver. Switch to full'}
              className="h-9 px-2.5 rounded-full font-body text-[11px] font-bold tracking-wide transition-colors hover:bg-white/10"
              style={{ color: quality === 'hd' ? 'var(--accent)' : 'rgba(255,255,255,0.7)' }}
            >
              {quality === 'hd' ? 'HD' : 'SD'}
            </button>

            <Btn label={fullscreen ? 'Exit fullscreen (F)' : 'Fullscreen (F)'} onClick={toggleFullscreen}>
              <Icon d={fullscreen ? I.exitFull : I.full} size={18} />
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}
