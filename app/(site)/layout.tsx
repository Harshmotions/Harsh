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

      {/* ── Global cinematic grain overlay ──────────────────────────────
           Fixed, pointer-events-none, z-50.
           Sits BELOW the project modal backdrop (z-100) so video players
           are always grain-free. Opacity ~1.8% — invisible polish only. */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 50,
          opacity: 0.018,
        }}
      >
        <svg width="100%" height="100%" style={{ display: 'block' }}>
          <defs>
            <filter id="global-grain" x="0%" y="0%" width="100%" height="100%">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.68"
                numOctaves="3"
                stitchTiles="stitch"
              />
              <feColorMatrix type="saturate" values="0" />
            </filter>
          </defs>
          <rect width="100%" height="100%" filter="url(#global-grain)" />
        </svg>
      </div>
    </div>
  );
}
