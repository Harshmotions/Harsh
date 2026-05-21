'use client';

import { LayoutGroup, motion, AnimatePresence } from 'framer-motion';
import ProjectCard from '@/components/ProjectCard';
import type { Project } from '@/lib/types';

interface ProjectGridProps {
  projects: Project[];
  variant: 'reel' | 'landscape';
  onCardClick: (project: Project) => void;
}

export default function ProjectGrid({
  projects,
  variant,
  onCardClick,
}: ProjectGridProps) {
  const gridClass =
    variant === 'reel'
      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8'
      : 'grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10';

  if (projects.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="font-body text-text-muted">
          No projects in this category yet.
        </p>
      </div>
    );
  }

  return (
    <LayoutGroup>
      <motion.div layout className={gridClass}>
        <AnimatePresence mode="popLayout">
          {projects.map((p, i) => (
            <motion.div
              key={p._id}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{
                duration: 0.5,
                delay: i * 0.05,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="w-full"
            >
              <ProjectCard
                project={p}
                index={i}
                variant={variant}
                widthClass="w-full"
                onClick={() => onCardClick(p)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </LayoutGroup>
  );
}
