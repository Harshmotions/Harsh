'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';

const FINE_POINTER_QUERY = '(hover: hover) and (pointer: fine)';

function subscribeToPointer(onChange: () => void) {
  const mq = window.matchMedia(FINE_POINTER_QUERY);
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}

function getIsMouseDevice() {
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  return !isTouch && window.matchMedia(FINE_POINTER_QUERY).matches;
}

export default function Cursor() {
  const arrowRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  // Server snapshot is false, so SSR and hydration render nothing.
  const isMouseDevice = useSyncExternalStore(subscribeToPointer, getIsMouseDevice, () => false);

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
      const scale = isDown ? 0.82 : isPlay ? 1 : isPointer ? 1.25 : 1;
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
    const playBadge = arrow.querySelector('.cursor-play') as HTMLElement | null;

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
      const wasPlay = isPlay;
      isPlay = !isText && !!top?.closest('[data-cursor="play"]');
      isPointer = !isText && !isPlay && overControl;
      // Over a video the cursor itself becomes the play button
      if (playBadge && isPlay !== wasPlay) {
        playBadge.style.display = isPlay ? 'flex' : 'none';
        if (isPlay) {
          playBadge.animate(
            [{ transform: 'scale(0.3)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }],
            { duration: 380, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
          );
        }
      }
      if (pointerImg) pointerImg.style.display = isText || isPlay ? 'none' : 'block';
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
      {/* Over videos (data-cursor="play"): a glass play button centred on the pointer */}
      <span
        className="cursor-play"
        style={{
          display: 'none',
          width: 32,
          height: 32,
          borderRadius: '50%',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(6,11,20,0.5)',
          border: '1px solid rgba(147,197,253,0.55)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          boxShadow: '0 0 14px rgba(79,142,247,0.35), inset 0 1px 0 rgba(255,255,255,0.12)',
        }}
      >
        <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
          <path d="M5 2.8l8.2 5.2L5 13.2V2.8z" fill="#ffffff" />
        </svg>
      </span>
    </div>
  );
}
