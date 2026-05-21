'use client';

/**
 * Sanity Studio mounted at /studio.
 * The catch-all route handles all sub-paths the Studio uses internally
 * (intent links, structure tool navigation, etc.).
 */
import { NextStudio } from 'next-sanity/studio';
import config from '@/sanity/sanity.config';

export const dynamic = 'force-static';

export default function StudioPage() {
  return <NextStudio config={config} />;
}
