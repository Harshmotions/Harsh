import type { Metadata } from 'next';
import Hero from '@/components/Hero';
import IntroLoader from '@/components/IntroLoader';

export const metadata: Metadata = {
  title: { absolute: 'Harsh Powar | Video Editor & Motion Designer' },
  description:
    'Performance ads, motion graphics, and long-form edits for brands that measure what works.',
  alternates: {
    canonical: '/',
  },
};
import HomeFeaturedClient from '@/components/HomeFeaturedClient';
import VelocityMarquee from '@/components/motion/VelocityMarquee';
import ImpactStats from '@/components/ImpactStats';
import AboutSection from '@/components/AboutSection';
import ApproachSection from '@/components/ApproachSection';
import ContactSection from '@/components/ContactSection';
import { sanityFetch, urlForImage } from '@/lib/sanity';
import { CONTACT_EMAIL } from '@/lib/site';
import {
  FEATURED_PROJECTS_QUERY,
  SITE_SETTINGS_QUERY,
  HERO_VIDEO_DESKTOP_QUERY,
  HERO_VIDEO_MOBILE_QUERY,
} from '@/lib/queries';
import type { Project, SiteSettings, HeroVideo } from '@/lib/types';

export default async function Home() {
  const [featured, settings, heroVideoDesktop, heroVideoMobile] = await Promise.all([
    sanityFetch<Project[]>({ query: FEATURED_PROJECTS_QUERY }),
    sanityFetch<SiteSettings | null>({ query: SITE_SETTINGS_QUERY }),
    sanityFetch<HeroVideo | null>({ query: HERO_VIDEO_DESKTOP_QUERY }),
    sanityFetch<HeroVideo | null>({ query: HERO_VIDEO_MOBILE_QUERY }),
  ]);

  // Stills from the work for the hero's cursor trail, cropped to one shape
  const trailImages = featured
    .filter((p) => p.thumbnail?.asset)
    .slice(0, 10)
    .map((p) => urlForImage(p.thumbnail).width(340).height(425).fit('crop').quality(72).auto('format').url());

  return (
    <main>
      <IntroLoader />
      <Hero
        headline={settings?.heroHeadline}
        subline={settings?.heroSubline}
        videoPlaybackIdDesktop={heroVideoDesktop?.muxVideo?.asset?.playbackId}
        videoPlaybackIdMobile={heroVideoMobile?.muxVideo?.asset?.playbackId}
        trailImages={trailImages}
      />
      {/* The rest of the page is one panel that slides up over the hero */}
      <div
        className="relative z-10 -mt-8 md:-mt-12 rounded-t-[28px] md:rounded-t-[44px] pt-6 md:pt-10"
        style={{
          background: 'var(--bg)',
          boxShadow: '0 -30px 60px rgba(0,0,0,0.45), inset 0 1px 0 rgba(147,197,253,0.16)',
        }}
      >
      <HomeFeaturedClient projects={featured} whatsappNumber={settings?.whatsappNumber} />
      <VelocityMarquee items={['Performance ads', 'SaaS motion', 'Long-form edits', 'Brand films']} />
      <ImpactStats />
      <AboutSection body={settings?.aboutBody} portraitUrl={settings?.portraitUrl} />
      <ApproachSection steps={settings?.approachSteps} />
      <ContactSection
        headline={settings?.contactHeadline}
        whatsappNumber={settings?.whatsappNumber}
        emailAddress={CONTACT_EMAIL}
      />
      </div>
    </main>
  );
}
