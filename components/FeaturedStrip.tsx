'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Container from '@/components/ui/Container';
import ProjectCard from '@/components/ProjectCard';
import type { Project } from '@/lib/types';

interface FeaturedStripProps {
  projects: Project[];
  onCardClick?: (project: Project) => void;
}

export default function FeaturedStrip({
  projects,
  onCardClick,
}: FeaturedStripProps) {
  const reels = projects.filter((p) => p.type === 'reel').slice(0, 4);
  const landscape = projects.filter((p) => p.type === 'landscape').slice(0, 4);

  if (reels.length === 0 && landscape.length === 0) return null;

  return (
    <section
      id="featured"
      className="py-14 md:py-20"
      style={{ borderTop: '1px solid var(--border)' }}
    >
      <Container>
        {/* Section header */}
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
          className="font-display font-semibold text-text mb-12"
          style={{
            fontSize: 'clamp(32px, 4.5vw, 64px)',
            lineHeight: 1,
            letterSpacing: '-0.02em',
          }}
        >
          Recent edits that moved the needle.
        </motion.h2>

        {/* ── Vertical Reels grid (9:16) ── */}
        {reels.length > 0 && (
          <div className="mb-16">
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5 }}
              className="font-body text-text-muted text-xs uppercase tracking-[0.18em] mb-5"
            >
              Vertical · 9:16
            </motion.p>
            <div className="grid grid-cols-2 gap-4 md:gap-6">
              {reels.map((p, i) => (
                <motion.div
                  key={p._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                >
                  <ProjectCard
                    project={p}
                    index={i}
                    onClick={() => onCardClick?.(p)}
                    variant="reel"
                    widthClass="w-full"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ── Landscape grid (16:9) ── */}
        {landscape.length > 0 && (
          <div>
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5 }}
              className="font-body text-text-muted text-xs uppercase tracking-[0.18em] mb-5"
            >
              Long-form · 16:9
            </motion.p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {landscape.map((p, i) => (
                <motion.div
                  key={p._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                >
                  <ProjectCard
                    project={p}
                    index={i}
                    onClick={() => onCardClick?.(p)}
                    variant="landscape"
                    widthClass="w-full"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Mid-page CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mt-16 pt-14 flex flex-col items-center text-center gap-5"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <p className="font-body text-text-muted text-xs uppercase tracking-[0.2em]">
            Want results like this?
          </p>
          <h3
            className="font-display font-semibold text-text max-w-xl"
            style={{
              fontSize: 'clamp(22px, 2.8vw, 36px)',
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
            }}
          >
            Let&apos;s make your next campaign impossible to scroll past.
          </h3>
          <Link
            href="#contact"
            className="font-body text-sm font-medium px-6 py-2.5 rounded-full transition-colors hover:opacity-90"
            style={{
              background: 'rgba(255,107,43,0.10)',
              border: '1px solid rgba(255,107,43,0.40)',
              color: 'var(--cta)',
            }}
          >
            Start a project →
          </Link>
        </motion.div>
      </Container>
    </section>
  );
}
