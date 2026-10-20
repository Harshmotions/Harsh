import type { Metadata } from 'next';
import Hero from '@/components/Hero';
import IntroLoader from '@/components/IntroLoader';
import WorkSection from '@/components/work/WorkSection';
import { mediaUrl, posterUrl, work } from '@/lib/work';

export const metadata: Metadata = {
  title: { absolute: 'Harsh Powar | Video Editor & Motion Designer' },
  description:
    'Performance ads, motion graphics, and long-form edits for brands that measure what works.',
  alternates: {
    canonical: '/',
  },
};
import VelocityMarquee from '@/components/motion/VelocityMarquee';
import ImpactStats from '@/components/ImpactStats';
import AboutSection from '@/components/AboutSection';
import ApproachSection from '@/components/ApproachSection';
import ContactSection from '@/components/ContactSection';
import { CONTACT_EMAIL, site } from '@/lib/site';

export default function Home() {

  // The home page shows the first six pieces; /work has them all
  const featured = work.slice(0, 6);

  // Square stills from across every piece, for the hero's cursor trail
  const trailImages = work.flatMap((item) => (item.trail ?? []).map(mediaUrl));

  // Desktop: fetch the featured posters (what the hover melt draws) while the intro plays.
  // The clips themselves start buffering once the page is idle (see WorkCard).
  const warm = featured.map((item) => posterUrl(item));

  return (
    <main>
      <IntroLoader />
      {/* Runs as the HTML arrives (no waiting for hydration), on mouse devices only and not
          for visitors who asked to save data. Low priority, so the hero's poster and reel
          still load first. Repeat visits hit the browser cache. */}
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){try{var c=navigator.connection;if(!matchMedia('(hover: hover) and (pointer: fine)').matches||(c&&c.saveData))return;${JSON.stringify(
            warm,
          )}.forEach(function(s){var i=new Image();i.fetchPriority='low';i.decoding='async';i.src=s})}catch(e){}})();`,
        }}
      />
      <Hero
        headline={site.heroHeadline}
        subline={site.heroSubline}
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
      <WorkSection items={featured} total={work.length} whatsappNumber={site.whatsappNumber} />
      <VelocityMarquee items={['Performance ads', 'SaaS motion', 'Long-form edits', 'Brand films']} />
      <ImpactStats />
      <AboutSection paragraphs={site.about} portrait={site.portrait} />
      <ApproachSection steps={site.approachSteps} />
      <ContactSection
        headline={site.contactHeadline}
        whatsappNumber={site.whatsappNumber}
        emailAddress={CONTACT_EMAIL}
      />
      </div>
    </main>
  );
}
