import { Suspense } from 'react';
import PortfolioClient from '@/components/PortfolioClient';
import { sanityFetch } from '@/lib/sanity';
import { LANDSCAPE_QUERY } from '@/lib/queries';
import type { Project } from '@/lib/types';

const LANDSCAPE_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'brand-films', label: 'Brand Films' },
  { value: 'motion-graphics', label: 'Motion Graphics' },
  { value: 'documentary', label: 'Documentary' },
];

export const metadata = {
  title: 'Long-form',
  description:
    'Horizontal edits with room to breathe — YouTube, brand films, motion graphics, and documentary.',
  alternates: { canonical: '/landscape' },
};

export default async function LandscapePage() {
  const projects = await sanityFetch<Project[]>({ query: LANDSCAPE_QUERY });

  return (
    <Suspense fallback={null}>
      <PortfolioClient
        projects={projects}
        variant="landscape"
        title="Long-form"
        subline="Horizontal edits with room to breathe. YouTube, brand films, documentary."
        filters={LANDSCAPE_FILTERS}
      />
    </Suspense>
  );
}
