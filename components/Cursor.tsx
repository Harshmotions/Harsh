'use client';

import { useEffect, useRef, useState } from 'react';

export default function Cursor() {
  const arrowRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const [isMouseDevice, setIsMouseDevice] = useState(false);

  useEffect(() => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (isTouch || !hasFinePointer) return;
    setIsMouseDevice(true);
  }, []);

  useEffect(() => {
    if (!isMouseDevice) return;
    const arrow = arrowRef.current;
    if (!arrow) return;
    arrow.style.opacity = '1';

    let mouseX = 0;
    let mouseY = 0;
    let curX = 0;
    let curY = 0;
    let isPlay = false;
    let isPointer = false;
    let isDown = false;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const loop = () => {
      curX = lerp(curX, mouseX, 0.18);
      curY = lerp(curY, mouseY, 0.18);
      const scale = isDown ? 0.82 : isPlay ? 1.5 : isPointer ? 1.25 : 1;
      arrow.style.transform = `translate3d(${curX}px, ${curY}px, 0) translate(-50%, -50%) scale(${scale})`;
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

    const updateState = (el: Element | null) => {
      const playEl = el?.closest?.('[data-cursor="play"]');
      const pointerEl = el?.closest?.('a, button, [role="button"]');
      isPlay = !!playEl;
      isPointer = !isPlay && !!pointerEl;
      const label = arrow.querySelector('.cursor-label') as HTMLElement | null;
      if (label) label.style.display = isPlay ? 'block' : 'none';
    };

    const onMouseOver = (e: MouseEvent) => updateState(e.target as Element);
    const onScroll = () => updateState(document.elementFromPoint(mouseX, mouseY));

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

  if (!isMouseDevice) return null;

  return (
    <div
      ref={arrowRef}
      aria-hidden="true"
      className="custom-cursor"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 9999,
        opacity: 0,
        willChange: 'transform',
        transition: 'opacity 0.2s',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '3px',
      }}
    >
      {/* Custom cursor — flipped horizontally to match standard pointer direction */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/cursor.svg"
        alt=""
        width={32}
        height={32}
        style={{ transform: 'scaleX(-1)', display: 'block' }}
      />
      <span
        className="cursor-label"
        style={{
          display: 'none',
          fontFamily: 'var(--font-inter)',
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--accent)',
          whiteSpace: 'nowrap',
        }}
      >
        PLAY
      </span>
    </div>
  );
}
