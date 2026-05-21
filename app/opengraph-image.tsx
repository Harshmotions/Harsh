import { ImageResponse } from 'next/og';

export const alt = 'Harsh Powar — Video Editor & Motion Designer';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#0A0A0A',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          position: 'relative',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Top amber accent bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: '#D4A84B',
            display: 'flex',
          }}
        />

        {/* Wordmark */}
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            marginBottom: 32,
            lineHeight: 1,
          }}
        >
          <span
            style={{
              fontSize: 96,
              fontWeight: 800,
              color: '#F0EDE8',
              letterSpacing: '-4px',
            }}
          >
            Harsh
          </span>
          <span
            style={{
              fontSize: 96,
              fontWeight: 800,
              color: '#D4A84B',
              letterSpacing: '-4px',
            }}
          >
            .
          </span>
        </div>

        {/* Description */}
        <p
          style={{
            fontSize: 26,
            color: '#8A8580',
            margin: 0,
            lineHeight: 1.5,
            maxWidth: 640,
          }}
        >
          Performance ads, motion graphics &amp; AI-driven creative for brands
          that measure what works.
        </p>

        {/* Location tag */}
        <div
          style={{
            position: 'absolute',
            bottom: 80,
            left: 80,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span
            style={{
              fontSize: 15,
              color: '#3A3935',
              background: '#141414',
              border: '1px solid #1F1F1F',
              padding: '6px 14px',
              borderRadius: 100,
              display: 'flex',
            }}
          >
            Freelance Video Editor · Maharashtra, India
          </span>
        </div>
      </div>
    ),
    size,
  );
}
