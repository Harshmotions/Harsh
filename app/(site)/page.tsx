import type { Metadata } from 'next';
import Hero from '@/components/Hero';

export const metadata: Metadata = {
  title: 'Harsh Powar — Video Editor & Motion Designer',
  description:
    'Performance ads, motion graphics, and AI-driven creative for brands that measure what works.',
  alternates: {
    canonical: '/',
  },
};
import HomeFeaturedClient from '@/components/HomeFeaturedClient';
import AboutSection from '@/components/AboutSection';
import ApproachSection from '@/components/ApproachSection';
import ContactSection from '@/components/ContactSection';
import { sanityFetch } from '@/lib/sanity';
import {
  FEATURED_PROJECTS_QUERY,
  SITE_SETTINGS_QUERY,
  CLIENTS_QUERY,
} from '@/lib/queries';
import type { Project, SiteSettings, ClientRef } from '@/lib/types';

export default async function Home() {
  const [featured, settings, clients] = await Promise.all([
    sanityFetch<Project[]>({ query: FEATURED_PROJECTS_QUERY }),
    sanityFetch<SiteSettings | null>({ query: SITE_SETTINGS_QUERY }),
    sanityFetch<ClientRef[]>({ query: CLIENTS_QUERY }),
  ]);

  return (
    <main>
      <Hero
        headline={settings?.heroHeadline}
        subline={settings?.heroSubline}
      />
      <HomeFeaturedClient projects={featured} />
      <AboutSection
        body={settings?.aboutBody}
        tools={settings?.toolsList}
        clients={clients}
      />
      <ApproachSection steps={settings?.approachSteps} />
      <ContactSection
        headline={settings?.contactHeadline}
        whatsappNumber={settings?.whatsappNumber}
        emailAddress={settings?.emailAddress}
      />
    </main>
  );
}
