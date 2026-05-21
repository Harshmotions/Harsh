'use client';

import { useEffect, useRef, useState } from 'react';

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  // Only render on true pointer/mouse devices.
  // (hover: hover) AND (pointer: fine) = real mouse. Excludes all touch devices,
  // including those that incorrectly report hover support.
  const [isMouseDevice, setIsMouseDevice] = useState(false);

  useEffect(() => {
    const isTouch =
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0;
    const hasFinePointer = window.matchMedia(
      '(hover: hover) and (pointer: fine)',
    ).matches;

    if (isTouch || !hasFinePointer) return; // touch device — bail out, render nothing
    setIsMouseDevice(true);
  }, []);

  useEffect(() => {
    if (!isMouseDevice) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    dot.style.opacity = '1';
    ring.style.opacity = '1';

    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;

    let isPlay = false;
    let isPointer = false;
    let isDown = false;

    const lerp = (current: number, target: number, factor: number) =>
      current + (target - current) * factor;

    const loop = () => {
      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      ringX = lerp(ringX, mouseX, 0.15);
      ringY = lerp(ringY, mouseY, 0.15);
      const scale = isDown ? 0.8 : 1;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%) scale(${scale})`;
      rafRef.current = requestAnimationFrame(loop);
    };

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const onMouseDown = () => {
      isDown = true;
      setTimeout(() => { isDown = false; }, 150);
    };

    const applyState = () => {
      if (isPlay) {
        dot.style.opacity = '0';
        ring.style.width = '64px';
        ring.style.height = '64px';
        ring.style.background = 'rgba(212,168,75,0.2)';
        ring.style.borderColor = 'transparent';
        ring.style.mixBlendMode = 'normal';
        ring.querySelector('.ring-label')?.classList.remove('hidden');
      } else if (isPointer) {
        dot.style.opacity = '1';
        ring.style.width = '48px';
        ring.style.height = '48px';
        ring.style.background = 'rgba(240,237,232,0.1)';
        ring.style.borderColor = 'rgba(240,237,232,0.6)';
        ring.style.mixBlendMode = 'difference';
        ring.querySelector('.ring-label')?.classList.add('hidden');
      } else {
        dot.style.opacity = '1';
        ring.style.width = '36px';
        ring.style.height = '36px';
        ring.style.background = 'transparent';
        ring.style.borderColor = 'rgba(240,237,232,0.6)';
        ring.style.mixBlendMode = 'normal';
        ring.querySelector('.ring-label')?.classList.add('hidden');
      }
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const playEl = target.closest('[data-cursor="play"]');
      const pointerEl = target.closest('a, button, [role="button"]');
      const nextPlay = !!playEl;
      const nextPointer = !nextPlay && !!pointerEl;
      if (nextPlay !== isPlay || nextPointer !== isPointer) {
        isPlay = nextPlay;
        isPointer = nextPointer;
        applyState();
      }
    };

    const onScroll = () => {
      const el = document.elementFromPoint(mouseX, mouseY) as HTMLElement | null;
      if (!el) return;
      const playEl = el.closest('[data-cursor="play"]');
      const pointerEl = el.closest('a, button, [role="button"]');
      const nextPlay = !!playEl;
      const nextPointer = !nextPlay && !!pointerEl;
      if (nextPlay !== isPlay || nextPointer !== isPointer) {
        isPlay = nextPlay;
        isPointer = nextPointer;
        applyState();
      }
    };

    document.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseover', onMouseOver);
    window.addEventListener('scroll', onScroll, { passive: true, capture: true });
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mouseover', onMouseOver);
      window.removeEventListener('scroll', onScroll, { capture: true });
      cancelAnimationFrame(rafRef.current);
    };
  }, [isMouseDevice]);

  // Don't render cursor elements at all on touch/mobile devices
  if (!isMouseDevice) return null;

  return (
    <>
      {/* Dot — follows mouse 1:1 */}
      <div
        ref={dotRef}
        aria-hidden="true"
        className="custom-cursor"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: 'var(--accent)',
          pointerEvents: 'none',
          zIndex: 9999,
          opacity: 0,
          willChange: 'transform',
          transition: 'opacity 0.2s',
        }}
      />

      {/* Ring — lerps behind */}
      <div
        ref={ringRef}
        aria-hidden="true"
        className="custom-cursor"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          border: '1.5px solid rgba(240,237,232,0.6)',
          pointerEvents: 'none',
          zIndex: 9998,
          opacity: 0,
          willChange: 'transform',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition:
            'width 0.25s ease, height 0.25s ease, background 0.25s ease, border-color 0.25s ease, opacity 0.2s',
        }}
      >
        <span
          className="ring-label hidden"
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--accent)',
            userSelect: 'none',
          }}
        >
          PLAY
        </span>
      </div>
    </>
  );
}
