import Cursor from '@/components/Cursor';
import SmoothScroll from '@/components/SmoothScroll';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { sanityFetch } from '@/lib/sanity';
import { SITE_SETTINGS_QUERY } from '@/lib/queries';
import type { SiteSettings } from '@/lib/types';

export default async function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await sanityFetch<SiteSettings | null>({
    query: SITE_SETTINGS_QUERY,
  });

  return (
    <div className="site-shell">
      <SmoothScroll>
        <Navigation />
        {children}
        <Footer
          instagramUrl={settings?.instagramUrl}
          linkedinUrl={settings?.linkedinUrl}
          emailAddress={settings?.emailAddress}
        />
      </SmoothScroll>
      <Cursor />
    </div>
  );
}
