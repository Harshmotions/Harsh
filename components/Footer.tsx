import Container from '@/components/ui/Container';

interface FooterProps {
  instagramUrl?: string;
  linkedinUrl?: string;
  emailAddress?: string;
}

export default function Footer({
  instagramUrl,
  linkedinUrl,
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
          <div className="font-display font-bold text-lg tracking-tight">
            Harsh<span className="text-accent">.</span>
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
            {linkedinUrl && (
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent transition-colors"
              >
                LinkedIn
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
      </Container>
    </footer>
  );
}
