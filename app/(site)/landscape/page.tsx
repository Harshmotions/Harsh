import { Suspense } from 'react';
import PortfolioClient from '@/components/PortfolioClient';
import { sanityFetch } from '@/lib/sanity';
import { LANDSCAPE_QUERY, SITE_SETTINGS_QUERY } from '@/lib/queries';
import type { Project, SiteSettings } from '@/lib/types';

const LANDSCAPE_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'motion-graphics', label: 'Motion Graphics' },
  { value: 'brand', label: 'Brand' },
];

export const metadata = {
  title: 'Landscape',
  description:
    'Horizontal edits with room to breathe: YouTube, brand films, motion graphics, and documentary.',
  alternates: { canonical: '/landscape' },
};

export default async function LandscapePage() {
  const [projects, settings] = await Promise.all([
    sanityFetch<Project[]>({ query: LANDSCAPE_QUERY }),
    sanityFetch<SiteSettings | null>({ query: SITE_SETTINGS_QUERY }),
  ]);

  return (
    <Suspense fallback={null}>
      <PortfolioClient
        projects={projects}
        variant="landscape"
        title="Landscape"
        subline="Horizontal edits with room to breathe. YouTube, brand films, documentary."
        filters={LANDSCAPE_FILTERS}
        whatsappNumber={settings?.whatsappNumber}
      />
    </Suspense>
  );
}
