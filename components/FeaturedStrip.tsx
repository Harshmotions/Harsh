'use client';

import Link from 'next/link';
import { motion, type Variants } from 'framer-motion';
import Container from '@/components/ui/Container';
import ProjectCard from '@/components/ProjectCard';
import RevealText from '@/components/motion/RevealText';
import type { Project } from '@/lib/types';
import ScrambleText from '@/components/motion/ScrambleText';

interface FeaturedStripProps {
  reels: Project[];
  landscape: Project[];
  onCardClick: (project: Project) => void;
}

const reveal = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
};

// Cards open like a curtain from the bottom edge. The final inset is negative so
// the clip never cuts off hover lift or shadows once revealed. The clip lives on an
// inner element: Chrome treats a fully clipped element as not visible, so observing
// it directly would never trigger the reveal.
const curtainTrigger = { initial: 'hidden', whileInView: 'show', viewport: { once: true, margin: '-60px' } };
const curtain = (i: number): Variants => ({
  hidden: { clipPath: 'inset(100% -20% -20% -20%)', y: 40 },
  show: {
    clipPath: 'inset(-20% -20% -20% -20%)',
    y: 0,
    transition: { duration: 1, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] },
  },
});

function GroupHeader({ label, href, linkLabel }: { label: string; href: string; linkLabel: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 mb-5">
      <p className="font-body text-text-muted text-xs uppercase tracking-[0.18em]"><ScrambleText text={label} replayOnHover /></p>
      <Link
        href={href}
        className="group inline-flex items-center gap-1.5 font-body text-sm text-text-muted hover:text-accent transition-colors whitespace-nowrap"
      >
        {linkLabel}
        <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
      </Link>
    </div>
  );
}

export default function FeaturedStrip({ reels, landscape, onCardClick }: FeaturedStripProps) {
  if (reels.length === 0 && landscape.length === 0) return null;

  return (
    <section id="featured" className="pt-6 pb-14 md:pt-8 md:pb-20">
      <Container>
        <motion.p
          {...reveal}
          transition={{ duration: 0.6 }}
          className="font-body text-text-muted text-xs uppercase tracking-[0.2em] mb-3"
        >
          <ScrambleText text="Selected Work" replayOnHover />
        </motion.p>
        <RevealText
          text="Proof, in motion."
          className="font-display font-semibold text-text mb-10 md:mb-12"
          style={{ fontSize: 'clamp(30px, 4vw, 52px)', lineHeight: 1.02, letterSpacing: '-0.02em' }}
        />

        {reels.length > 0 && (
          <div className="mb-14 md:mb-16">
            <GroupHeader label="Vertical · 9:16" href="/reels" linkLabel="All reels" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
              {reels.map((p, i) => (
                <motion.div key={p._id} {...curtainTrigger}>
                  <motion.div variants={curtain(i)}>
                    <ProjectCard project={p} onClick={() => onCardClick(p)} variant="reel" widthClass="w-full" />
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {landscape.length > 0 && (
          <div>
            <GroupHeader label="Landscape · 16:9" href="/landscape" linkLabel="All landscape" />
            {/* Phones: a swipeable row with the next card peeking in, instead of 4 tall stacked cards */}
            <div className="flex md:grid md:grid-cols-2 gap-4 md:gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory -mx-6 px-6 md:mx-0 md:px-0 pb-2 md:pb-0 no-scrollbar">
              {landscape.map((p, i) => (
                <motion.div
                  key={p._id}
                  {...curtainTrigger}
                  className="w-[85%] flex-shrink-0 snap-start scroll-ml-6 md:w-auto"
                >
                  <motion.div variants={curtain(i)}>
                    <ProjectCard project={p} onClick={() => onCardClick(p)} variant="landscape" widthClass="w-full" />
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}
