'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Container from '@/components/ui/Container';
import FilterTabs, { type FilterOption } from '@/components/FilterTabs';
import ProjectGrid from '@/components/ProjectGrid';
import ProjectModal from '@/components/ProjectModal';
import type { Project } from '@/lib/types';

interface PortfolioClientProps {
  projects: Project[];
  variant: 'reel' | 'landscape';
  title: string;
  subline: string;
  filters: FilterOption[];
}

export default function PortfolioClient({
  projects,
  variant,
  title,
  subline,
  filters,
}: PortfolioClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const basePath = variant === 'reel' ? '/reels' : '/landscape';

  // Initialise active filter from ?filter= query param (validated against options).
  const initialFilter = useMemo(() => {
    const param = searchParams.get('filter');
    return param && filters.some((f) => f.value === param) ? param : 'all';
  }, [searchParams, filters]);

  const [active, setActive] = useState<string>(initialFilter);
  const [selected, setSelected] = useState<Project | null>(null);

  // Re-sync state if URL changes externally (e.g. back/forward).
  useEffect(() => {
    setActive(initialFilter);
  }, [initialFilter]);

  const setFilter = useCallback(
    (value: string) => {
      setActive(value);
      const url = value === 'all' ? basePath : `${basePath}?filter=${value}`;
      router.replace(url, { scroll: false });
    },
    [basePath, router],
  );

  const filteredProjects = useMemo(() => {
    if (active === 'all') return projects;
    return projects.filter((p) => p.category === active);
  }, [active, projects]);

  return (
    <main className="pt-28 pb-10 min-h-screen">
      <Container>
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Link
            href="/"
            className="group inline-flex items-center gap-2 font-body text-sm text-text-muted hover:text-accent transition-colors"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:-translate-x-1"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to home
          </Link>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-body text-text-muted text-xs uppercase tracking-[0.2em] mb-4"
        >
          {variant === 'reel' ? 'Vertical edits · 9:16' : 'Horizontal edits · 16:9'}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="font-display font-bold text-text mb-6"
          style={{
            fontSize: 'clamp(48px, 8vw, 110px)',
            lineHeight: 0.95,
            letterSpacing: '-0.03em',
          }}
        >
          {title}
          <span
            style={{
              color: 'var(--accent)',
              textShadow: '0 0 32px rgba(212,168,75,0.4)',
            }}
          >.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-body text-text-muted max-w-2xl mb-8"
          style={{ fontSize: '1.0625rem' }}
        >
          {subline}
        </motion.p>

        <FilterTabs options={filters} active={active} onChange={setFilter} />

        <ProjectGrid
          projects={filteredProjects}
          variant={variant}
          onCardClick={setSelected}
        />
      </Container>

      <ProjectModal project={selected} onClose={() => setSelected(null)} />
    </main>
  );
}
