import Cursor from '@/components/Cursor';
import SmoothScroll from '@/components/SmoothScroll';
import Navigation from '@/components/Navigation';
import PageTransition from '@/components/PageTransition';
import Footer from '@/components/Footer';
import MotionProvider from '@/components/motion/MotionProvider';
import { CONTACT_EMAIL, site } from '@/lib/site';

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="site-shell">
      <SmoothScroll>
        <MotionProvider>
          <Navigation />
          <PageTransition>{children}</PageTransition>
          <Footer
            instagramUrl={site.instagramUrl}
            emailAddress={CONTACT_EMAIL}
          />
        </MotionProvider>
      </SmoothScroll>
      <Cursor />

      {/* ── Global cinematic grain overlay ──────────────────────────────
           Fixed, pointer-events-none, z-50.
           Sits BELOW the project modal backdrop (z-100) so video players
           are always grain-free. Opacity ~1.8% — invisible polish only. */}
      {/* Desktop only: invisible on phone screens, but the full-screen noise filter still costs scroll performance */}
      <div
        aria-hidden="true"
        className="hidden md:block"
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
