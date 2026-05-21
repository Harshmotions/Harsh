import { Suspense } from 'react';
import PortfolioClient from '@/components/PortfolioClient';
import { sanityFetch } from '@/lib/sanity';
import { REELS_QUERY } from '@/lib/queries';
import type { Project } from '@/lib/types';

const REEL_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'performance-ads', label: 'Performance Ads' },
  { value: 'ugc', label: 'UGC' },
  { value: 'motion-graphics', label: 'Motion Graphics' },
  { value: 'brand', label: 'Brand' },
  { value: 'ai-ad', label: 'AI Ad' },
];

export const metadata = {
  title: 'Reels',
  description:
    'Vertical edits built for the feed — performance ads, UGC, motion graphics, and brand content.',
  alternates: { canonical: '/reels' },
};

export default async function ReelsPage() {
  const projects = await sanityFetch<Project[]>({ query: REELS_QUERY });

  return (
    <Suspense fallback={null}>
      <PortfolioClient
        projects={projects}
        variant="reel"
        title="Reels"
        subline="Vertical edits built for the feed. Performance ads, UGC, motion graphics, brand."
        filters={REEL_FILTERS}
      />
    </Suspense>
  );
}
