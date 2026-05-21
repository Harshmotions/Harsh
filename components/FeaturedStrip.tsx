'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import Container from '@/components/ui/Container';
import ProjectCard from '@/components/ProjectCard';
import type { Project } from '@/lib/types';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface FeaturedStripProps {
  projects: Project[];
  onCardClick?: (project: Project) => void;
}

// useLayoutEffect on server warns; alias to useEffect for SSR safety.
const useIsoLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export default function FeaturedStrip({
  projects,
  onCardClick,
}: FeaturedStripProps) {
  const pinRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  useIsoLayoutEffect(() => {
    if (!pinRef.current || !trackRef.current) return;
    if (projects.length === 0) return;

    // Respect reduced motion — skip pinning entirely
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (reducedMotion) return;

    const pin = pinRef.current;
    const track = trackRef.current;

    const ctx = gsap.context(() => {
      // Distance the track must travel horizontally to fully reveal all cards.
      // Recompute on resize via ScrollTrigger's invalidateOnRefresh.
      const getDistance = () =>
        Math.max(0, track.scrollWidth - window.innerWidth);

      gsap.to(track, {
        x: () => -getDistance(),
        ease: 'none',
        scrollTrigger: {
          trigger: pin,
          start: 'top top',
          end: () => `+=${getDistance()}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
    }, pin);

    return () => ctx.revert();
  }, [projects.length]);

  if (projects.length === 0) return null;

  return (
    <section
      id="featured"
      className="relative py-14 md:py-20"
      style={{ borderTop: '1px solid var(--border)' }}
    >
      <Container>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="font-body text-text-muted text-xs uppercase tracking-[0.2em] mb-3"
        >
          Selected Work
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="font-display font-semibold text-text mb-10"
          style={{
            fontSize: 'clamp(32px, 4.5vw, 64px)',
            lineHeight: 1,
            letterSpacing: '-0.02em',
            maxWidth: '800px',
          }}
        >
          Recent edits that moved the needle.
        </motion.h2>
      </Container>

      {/* Pinned wrapper — full viewport height during scroll */}
      <div
        ref={pinRef}
        className="relative overflow-hidden"
        style={{ height: '100svh' }}
      >
        <div className="h-full flex items-center">
          <div
            ref={trackRef}
            className="flex items-center gap-6 md:gap-8 pl-6 md:pl-12 pr-[20vw] will-change-transform"
          >
            {projects.map((p, i) => (
              <ProjectCard
                key={p._id}
                project={p}
                index={i}
                onClick={() => onCardClick?.(p)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
