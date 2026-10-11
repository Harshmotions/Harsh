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
    let isText = false;
    let isDown = false;
    let needsCheck = false;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const loop = () => {
      if (needsCheck) {
        needsCheck = false;
        updateState();
      }
      // Follow tighter over text fields so clicking between characters feels precise
      const follow = isText ? 0.45 : 0.18;
      curX = lerp(curX, mouseX, follow);
      curY = lerp(curY, mouseY, follow);
      const scale = isDown ? 0.82 : isPlay ? 1.5 : isPointer ? 1.25 : 1;
      arrow.style.transform = `translate3d(${curX}px, ${curY}px, 0) translate(-50%, -50%) scale(${scale})`;
      rafRef.current = requestAnimationFrame(loop);
    };

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      needsCheck = true;
    };

    const onMouseDown = () => {
      isDown = true;
      setTimeout(() => { isDown = false; }, 150);
    };

    const pointerImg = arrow.querySelector('.cursor-arrow') as HTMLElement | null;
    const ibeam = arrow.querySelector('.cursor-ibeam') as SVGElement | null;
    const label = arrow.querySelector('.cursor-label') as HTMLElement | null;

    const TEXT_FIELD =
      'textarea, [contenteditable="true"], input:not([type="checkbox"]):not([type="radio"]):not([type="hidden"]):not([type="submit"]):not([type="button"])';
    const CONTROL = 'a, button, [role="button"], [role="option"]';

    function updateState() {
      // elementsFromPoint sees through overlays sitting on top of inputs
      // (e.g. password-manager icons), which a plain event target would not.
      const stack = document.elementsFromPoint(mouseX, mouseY);
      const top = stack[0];
      const overControl = !!top?.closest(`${CONTROL}, [role="listbox"]`);
      isText = !overControl && stack.some((el) => el.matches(TEXT_FIELD));
      isPlay = !isText && !!top?.closest('[data-cursor="play"]');
      isPointer = !isText && !isPlay && overControl;
      if (label) label.style.display = isPlay ? 'block' : 'none';
      if (pointerImg) pointerImg.style.display = isText ? 'none' : 'block';
      if (ibeam) ibeam.style.display = isText ? 'block' : 'none';
    }

    const onScroll = () => {
      needsCheck = true;
    };

    document.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mousedown', onMouseDown);
    window.addEventListener('scroll', onScroll, { passive: true, capture: true });
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mousedown', onMouseDown);
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
        className="cursor-arrow"
        src="/cursor.svg"
        alt=""
        width={16}
        height={16}
        style={{ transform: 'scaleX(-1)', display: 'block' }}
      />
      {/* Text cursor: same geometric weight and blue gradient as the arrow */}
      <svg
        className="cursor-ibeam"
        width="9"
        height="17"
        viewBox="0 0 9 17"
        fill="none"
        style={{ display: 'none', filter: 'drop-shadow(0 0 3px rgba(79,142,247,0.45))' }}
      >
        <defs>
          <linearGradient id="cursor-ibeam-gradient" x1="9" y1="0" x2="0" y2="17" gradientUnits="userSpaceOnUse">
            <stop stopColor="#84C8F5" />
            <stop offset="1" stopColor="#2F6BDB" />
          </linearGradient>
        </defs>
        <path d="M0 0H9V1.5H5.25V15.5H9V17H0V15.5H3.75V1.5H0Z" fill="url(#cursor-ibeam-gradient)" />
      </svg>
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
