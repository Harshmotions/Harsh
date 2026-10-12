'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Container from '@/components/ui/Container';
import ProjectCard from '@/components/ProjectCard';
import type { Project } from '@/lib/types';

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

function GroupHeader({ label, href, linkLabel }: { label: string; href: string; linkLabel: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 mb-5">
      <p className="font-body text-text-muted text-xs uppercase tracking-[0.18em]">{label}</p>
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
          Selected Work
        </motion.p>
        <motion.h2
          {...reveal}
          transition={{ duration: 0.7 }}
          className="font-display font-semibold text-text mb-10 md:mb-12"
          style={{ fontSize: 'clamp(30px, 4vw, 52px)', lineHeight: 1.02, letterSpacing: '-0.02em' }}
        >
          Proof, in motion.
        </motion.h2>

        {reels.length > 0 && (
          <div className="mb-14 md:mb-16">
            <GroupHeader label="Vertical · 9:16" href="/reels" linkLabel="All reels" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
              {reels.map((p, i) => (
                <motion.div
                  key={p._id}
                  {...reveal}
                  transition={{ duration: 0.55, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                >
                  <ProjectCard project={p} onClick={() => onCardClick(p)} variant="reel" widthClass="w-full" />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {landscape.length > 0 && (
          <div>
            <GroupHeader label="Landscape · 16:9" href="/landscape" linkLabel="All landscape" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
              {landscape.map((p, i) => (
                <motion.div
                  key={p._id}
                  {...reveal}
                  transition={{ duration: 0.55, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                >
                  <ProjectCard project={p} onClick={() => onCardClick(p)} variant="landscape" widthClass="w-full" />
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}
