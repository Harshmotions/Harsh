'use client';

import { useMemo, useState, useCallback, useSyncExternalStore } from 'react';
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

// The ?filter= value is read straight from the URL rather than via useSearchParams,
// which would make the whole page render client-side only (blank HTML, then a big
// layout jump). The server renders "All"; a filter in the URL applies after hydration.
const FILTER_EVENT = 'portfolio-filter-change';

function subscribeToUrl(onChange: () => void) {
  window.addEventListener('popstate', onChange);
  window.addEventListener(FILTER_EVENT, onChange);
  return () => {
    window.removeEventListener('popstate', onChange);
    window.removeEventListener(FILTER_EVENT, onChange);
  };
}

export default function PortfolioClient({
  projects,
  variant,
  title,
  subline,
  filters,
  whatsappNumber,
}: PortfolioClientProps) {
  const basePath = variant === 'reel' ? '/reels' : '/landscape';

  const readFilter = useCallback(() => {
    const param = new URLSearchParams(window.location.search).get('filter');
    return param && filters.some((f) => f.value === param) ? param : 'all';
  }, [filters]);
  const active = useSyncExternalStore(subscribeToUrl, readFilter, () => 'all');
  const [selected, setSelected] = useState<number | null>(null);

  const setFilter = useCallback(
    (value: string) => {
      const url = value === 'all' ? basePath : `${basePath}?filter=${value}`;
      window.history.replaceState(null, '', url);
      window.dispatchEvent(new Event(FILTER_EVENT));
    },
    [basePath],
  );

  const filteredProjects = useMemo(() => {
    if (active === 'all') return projects;
    return projects.filter((p) => p.category === active);
  }, [active, projects]);

  return (
    <main className="pt-28 md:pt-32 pb-10 min-h-screen">
      <Container>
        {/* CSS entrance (.hero-rise) so the header paints before hydration */}
        <p className="hero-rise [--rise:8px] [--rise-duration:0.6s] font-body text-text-muted text-xs uppercase tracking-[0.2em] mb-4">
          {variant === 'reel' ? 'Vertical edits · 9:16' : 'Horizontal edits · 16:9'}
        </p>
        <h1
          className="hero-rise [--rise:16px] [--rise-opacity:1] [--rise-duration:0.7s] font-display font-bold text-text mb-6"
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
        </h1>
        <p
          className="hero-rise [--rise:12px] [--rise-duration:0.7s] [--rise-delay:0.1s] font-body text-text-muted max-w-2xl mb-8"
          style={{ fontSize: '1.0625rem' }}
        >
          {subline}
        </p>

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
