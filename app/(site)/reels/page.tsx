import { Suspense } from 'react';
import PortfolioClient from '@/components/PortfolioClient';
import { sanityFetch } from '@/lib/sanity';
import { REELS_QUERY, SITE_SETTINGS_QUERY } from '@/lib/queries';
import type { Project, SiteSettings } from '@/lib/types';

const REEL_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'performance-ads', label: 'Performance Ads' },
  { value: 'motion-graphics', label: 'Motion Graphics' },
  { value: 'brand', label: 'Brand' },
];

export const metadata = {
  title: 'Reels',
  description:
    'Vertical edits built for the feed: performance ads, motion graphics, and brand content.',
  alternates: { canonical: '/reels' },
};

export default async function ReelsPage() {
  const [projects, settings] = await Promise.all([
    sanityFetch<Project[]>({ query: REELS_QUERY }),
    sanityFetch<SiteSettings | null>({ query: SITE_SETTINGS_QUERY }),
  ]);

  return (
    <Suspense fallback={null}>
      <PortfolioClient
        projects={projects}
        variant="reel"
        title="Reels"
        subline="Built for the feed. Made to convert."
        filters={REEL_FILTERS}
        whatsappNumber={settings?.whatsappNumber}
      />
    </Suspense>
  );
}
