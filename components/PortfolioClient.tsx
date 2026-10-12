'use client';

import { useMemo, useState, useCallback } from 'react';
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
  whatsappNumber?: string;
}

export default function PortfolioClient({
  projects,
  variant,
  title,
  subline,
  filters,
  whatsappNumber,
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
  const [syncedFilter, setSyncedFilter] = useState<string>(initialFilter);
  const [selected, setSelected] = useState<number | null>(null);

  // Re-sync state if URL changes externally (e.g. back/forward). Adjusting state
  // during render rather than in an effect skips an extra render pass.
  if (syncedFilter !== initialFilter) {
    setSyncedFilter(initialFilter);
    setActive(initialFilter);
  }

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
    <main className="pt-28 md:pt-32 pb-10 min-h-screen">
      <Container>
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
              textShadow: '0 0 32px rgba(79,142,247,0.4)',
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
          onCardClick={(p) => setSelected(filteredProjects.indexOf(p))}
        />
      </Container>

      <ProjectModal
        projects={filteredProjects}
        index={selected}
        onIndexChange={setSelected}
        whatsappNumber={whatsappNumber}
      />
    </main>
  );
}
