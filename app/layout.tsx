import type { Metadata } from 'next';
import { Sora, Inter, Playfair_Display } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';

const sora = Sora({
  variable: '--font-sora',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
});

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  weight: ['400', '700'],
  // Only ever used in italic ("by" in the logo, the hero's last word); skipping the
  // upright face saves a preloaded ~38 KB font file on every page.
  style: ['italic'],
  display: 'swap',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.motionbyharsh.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Harsh Powar | Video Editor & Motion Designer',
    template: '%s | Harsh Powar',
  },
  description:
    'Performance ads, motion graphics, and long-form edits for brands that measure what works.',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: SITE_URL,
    siteName: 'Harsh Powar',
    title: 'Harsh Powar | Video Editor & Motion Designer',
    description:
      'Performance ads, motion graphics, and long-form edits for brands that measure what works.',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Harsh Powar | Video Editor & Motion Designer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Harsh Powar | Video Editor & Motion Designer',
    description:
      'Performance ads, motion graphics, and long-form edits for brands that measure what works.',
    images: ['/opengraph-image'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // The inline script below sets attributes on <html> before hydration
    <html lang="en" className={`${sora.variable} ${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <head>
        {/* First visit to the home page in a session: show the intro (components/IntroLoader)
            and hold the hero's entrance until it lifts. Runs before first paint so neither
            the intro nor the hero flashes. --intro is cleared once everything has played,
            so a later client-side visit to the home page starts the hero straight away. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(location.pathname==='/'&&!sessionStorage.getItem('mbh-intro')&&!matchMedia('(prefers-reduced-motion: reduce)').matches){sessionStorage.setItem('mbh-intro','1');var d=document.documentElement;d.setAttribute('data-intro','');d.style.setProperty('--intro','1.45s');setTimeout(function(){d.removeAttribute('data-intro');d.style.removeProperty('--intro')},6500)}}catch(e){}`,
          }}
        />
        {/* Zoom for the hero composition on screens past 1440px (see .hero-grid in
            globals.css): as large as fits a centred box about 76% of the screen wide
            (never less than the 1344px design) and the full-screen hero's height
            (412px design height, minus ~170px for the nav and breathing room).
            Set before first paint so the hero never jumps. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var d=document.documentElement;function z(){var w=innerWidth,h=innerHeight,s=1;if(w>=1440){var box=Math.min(w-96,Math.max(1344,0.76*w));s=Math.max(1,Math.min(box/1344,(h-170)/412,1.8))}d.style.setProperty('--hero-zoom',s.toFixed(4))}z();addEventListener('resize',z)})();`,
          }}
        />
      </head>
      <body className="antialiased">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
