import { ImageResponse } from 'next/og';
import { readFile } from 'fs/promises';
import { join } from 'path';

export const alt = 'motion by harsh | Video Editor & Motion Designer';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const TAGLINE = 'Performance ads, SaaS motion graphics & long-form edits for brands that measure what works.';
const PILL = 'Video editor & motion designer · motionbyharsh.com';

// Satori needs raw TTF/OTF data; asking Google Fonts for only the glyphs we use keeps it tiny.
async function loadGoogleFont(family: string, text: string) {
  const css = await (
    await fetch(`https://fonts.googleapis.com/css2?family=${family}&text=${encodeURIComponent(text)}`)
  ).text();
  const url = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
  if (!url) throw new Error(`No font file found for ${family}`);
  return (await fetch(url)).arrayBuffer();
}

export default async function Image() {
  const logo = await readFile(join(process.cwd(), 'public', 'logo-favicon.png'));
  const logoSrc = `data:image/png;base64,${logo.toString('base64')}`;

  const fonts = await Promise.all([
    loadGoogleFont('Sora:wght@800', 'motion'),
    loadGoogleFont('Sora:wght@400', 'harsh'),
    loadGoogleFont('Playfair+Display:ital@1', 'by'),
    loadGoogleFont('Inter:wght@400', TAGLINE + PILL),
  ])
    .then(([soraBold, soraRegular, playfair, inter]) => [
      { name: 'Sora', data: soraBold, weight: 800 as const, style: 'normal' as const },
      { name: 'Sora', data: soraRegular, weight: 400 as const, style: 'normal' as const },
      { name: 'Playfair', data: playfair, weight: 400 as const, style: 'italic' as const },
      { name: 'Inter', data: inter, weight: 400 as const, style: 'normal' as const },
    ])
    // Font fetch failing must never break the build — fall back to the default font.
    .catch(() => undefined);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 88px 70px',
          position: 'relative',
          background: '#060B14',
          backgroundImage:
            'radial-gradient(circle at 85% 15%, rgba(79,142,247,0.28), transparent 45%), radial-gradient(circle at 10% 100%, rgba(30,62,120,0.55), transparent 50%)',
        }}
      >
        {/* Logo mark */}
        <img src={logoSrc} width={96} height={96} style={{ borderRadius: 22, marginBottom: 44 }} alt="" />

        {/* Wordmark: motion (Sora 800, accent) · by (Playfair italic) · harsh (Sora 400) */}
        <div style={{ display: 'flex', alignItems: 'baseline', lineHeight: 1, marginBottom: 32 }}>
          <span style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 112, color: '#4F8EF7', letterSpacing: -3 }}>
            motion
          </span>
          <span
            style={{
              fontFamily: 'Playfair',
              fontStyle: 'italic',
              fontSize: 112,
              color: 'rgba(255,255,255,0.80)',
              margin: '0 14px',
            }}
          >
            by
          </span>
          <span style={{ fontFamily: 'Sora', fontWeight: 400, fontSize: 112, color: '#FFFFFF', letterSpacing: -3 }}>
            harsh
          </span>
        </div>

        <div style={{ display: 'flex', fontFamily: 'Inter', fontSize: 30, lineHeight: 1.4, color: 'rgba(240,237,232,0.72)', maxWidth: 820 }}>
          {TAGLINE}
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 56,
            left: 88,
            display: 'flex',
            fontFamily: 'Inter',
            fontSize: 20,
            color: 'rgba(240,237,232,0.70)',
            padding: '10px 20px',
            borderRadius: 100,
            border: '1px solid rgba(79,142,247,0.35)',
            background: 'rgba(79,142,247,0.08)',
          }}
        >
          {PILL}
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
