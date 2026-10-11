import type { ClientRef } from '@/lib/types';

export default function ClientLogos({ clients }: { clients: ClientRef[] }) {
  if (clients.length === 0) return null;

  // 4× copies so the track is always wider than the viewport — animated by -25%
  const track = [...clients, ...clients, ...clients, ...clients];

  return (
    <section className="py-10 md:py-12" aria-label="Clients">
      <p className="font-body text-text-muted text-xs uppercase tracking-[0.2em] mb-7 text-center">
        Trusted by
      </p>
      <div className="logo-marquee-outer">
        <div className="logo-marquee-track">
          {track.map((c, i) => {
            // SharkFunded logo has heavy built-in whitespace — tighter padding + bigger render
            const isSharkFunded = c.name === 'SharkFunded';
            return (
              <div
                key={`${c._id}-${i}`}
                aria-hidden={i >= clients.length}
                style={{
                  padding: isSharkFunded ? '0 12px' : '0 36px',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {c.logoUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={c.logoUrl}
                    alt={c.name}
                    style={{
                      height: isSharkFunded ? 72 : 48,
                      width: 'auto',
                      maxWidth: isSharkFunded ? 220 : 160,
                      objectFit: 'contain',
                      opacity: 0.82,
                      display: 'block',
                    }}
                  />
                ) : (
                  <span
                    className="font-display"
                    style={{
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      color: 'rgba(240,237,232,0.70)',
                      letterSpacing: '-0.02em',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {c.name}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
