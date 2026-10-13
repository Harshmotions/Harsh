import Container from '@/components/ui/Container';
import FooterWordmark from '@/components/motion/FooterWordmark';

interface FooterProps {
  instagramUrl?: string;
  emailAddress?: string;
}

export default function Footer({
  instagramUrl,
  emailAddress,
}: FooterProps) {
  const year = new Date().getFullYear();
  return (
    <footer
      style={{ borderTop: '1px solid var(--border)' }}
      className="py-8 mt-16"
    >
      <Container>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div style={{ userSelect: 'none', display: 'inline-flex', alignItems: 'baseline', gap: '2px' }}>
            <span className="sr-only">motion by harsh</span>
            <span aria-hidden="true" style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, color: 'var(--accent)', fontSize: '1.0625rem', letterSpacing: '-0.025em' }}>motion</span>
            <span aria-hidden="true" style={{ fontFamily: 'var(--font-playfair)', fontStyle: 'italic', fontWeight: 400, color: 'rgba(255,255,255,0.80)', fontSize: '1.0625rem' }}>by</span>
            <span aria-hidden="true" style={{ fontFamily: 'var(--font-sora)', fontWeight: 400, color: '#ffffff', fontSize: '1.0625rem', letterSpacing: '-0.025em' }}>harsh</span>
          </div>

          <div className="flex items-center gap-6 font-body text-sm text-text-muted">
            {instagramUrl && (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent transition-colors"
              >
                Instagram
              </a>
            )}
            {emailAddress && (
              <a
                href={`mailto:${emailAddress}`}
                className="hover:text-accent transition-colors"
              >
                Email
              </a>
            )}
          </div>

          <div className="font-body text-xs text-text-muted">
            © {year} Harshwardhan Powar. All rights reserved.
          </div>
        </div>

        {/* Desktop: the giant wordmark sits flush on the page's bottom edge */}
        <div className="mt-10 md:mt-16 md:-mb-8 overflow-hidden">
          <FooterWordmark />
        </div>
      </Container>
    </footer>
  );
}
