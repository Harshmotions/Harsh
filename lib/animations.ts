import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/** Fade-in + slide-up reveal triggered by scroll entrance. */
export function fadeUpReveal(
  elements: gsap.TweenTarget,
  trigger: gsap.DOMTarget,
  options: { stagger?: number; delay?: number } = {},
) {
  return gsap.fromTo(
    elements,
    { opacity: 0, y: 40 },
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out',
      stagger: options.stagger ?? 0.1,
      delay: options.delay ?? 0,
      scrollTrigger: {
        trigger,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    },
  );
}

/** Horizontal scroll pin for the Featured Strip. */
export function horizontalScrollPin(
  track: gsap.DOMTarget,
  wrapper: gsap.DOMTarget,
) {
  const trackEl = gsap.utils.toArray<HTMLElement>(track)[0];
  if (!trackEl) return;

  return gsap.to(trackEl, {
    x: () => -(trackEl.scrollWidth - trackEl.offsetWidth),
    ease: 'none',
    scrollTrigger: {
      trigger: wrapper,
      start: 'top top',
      end: () => `+=${trackEl.scrollWidth - trackEl.offsetWidth}`,
      pin: true,
      scrub: 1,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });
}
