import Container from '@/components/ui/Container';
import WorkGrid from '@/components/work/WorkGrid';
import { site } from '@/lib/site';
import { work } from '@/lib/work';

export const metadata = {
  title: 'Work',
  description: 'Performance ads, motion graphics and long-form edits. Every piece in one place.',
  alternates: { canonical: '/work' },
};

export default function WorkPage() {
  return (
    <main className="pt-28 md:pt-32 pb-10 min-h-screen">
      <Container>
        {/* CSS entrance (.hero-rise) so the header paints before hydration */}
        <p className="hero-rise [--rise:8px] [--rise-duration:0.6s] font-body text-text-muted text-xs uppercase tracking-[0.2em] mb-4">
          {work.length > 0 ? `${work.length} ${work.length === 1 ? 'piece' : 'pieces'} · Ads, motion, long-form` : 'Ads, motion, long-form'}
        </p>
        <h1
          className="hero-rise [--rise:16px] [--rise-opacity:1] [--rise-duration:0.7s] font-display font-bold text-text mb-6"
          style={{ fontSize: 'clamp(48px, 8vw, 110px)', lineHeight: 0.95, letterSpacing: '-0.03em' }}
        >
          Work
          <span style={{ color: 'var(--accent)', textShadow: '0 0 32px rgba(79,142,247,0.4)' }}>.</span>
        </h1>
        <p
          className="hero-rise [--rise:12px] [--rise-duration:0.7s] [--rise-delay:0.1s] font-body text-text-muted max-w-2xl mb-12 md:mb-16"
          style={{ fontSize: '1.0625rem' }}
        >
          {work.length > 0
            ? 'Hover to preview. Open any piece to watch it full size, in its original format.'
            : 'New work is on its way. Check back soon.'}
        </p>

        {work.length > 0 && (
          <WorkGrid items={work} whatsappNumber={site.whatsappNumber} eagerCount={2} />
        )}
      </Container>
    </main>
  );
}
