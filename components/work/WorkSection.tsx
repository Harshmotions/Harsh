import Link from 'next/link';
import Container from '@/components/ui/Container';
import Reveal from '@/components/motion/Reveal';
import RevealText from '@/components/motion/RevealText';
import ScrambleText from '@/components/motion/ScrambleText';
import WorkGrid from '@/components/work/WorkGrid';
import type { WorkItem } from '@/lib/work';

/** Home page: the first few pieces, with a link through to /work. */
export default function WorkSection({
  items,
  total,
  whatsappNumber,
}: {
  items: WorkItem[];
  total: number;
  whatsappNumber?: string;
}) {
  if (items.length === 0) return null;
  return (
    <section id="featured" className="pt-6 pb-14 md:pt-8 md:pb-20">
      <Container>
        <div className="flex items-end justify-between gap-6 mb-10 md:mb-12">
          <div>
            <Reveal as="p" y={10} className="font-body text-text-muted text-xs uppercase tracking-[0.2em] mb-3">
              <ScrambleText text="Selected Work" replayOnHover />
            </Reveal>
            <RevealText
              text="Proof, in motion."
              className="font-display font-semibold text-text"
              style={{ fontSize: 'clamp(30px, 4vw, 52px)', lineHeight: 1.02, letterSpacing: '-0.02em' }}
            />
          </div>
          {total > items.length && (
            <Link
              href="/work"
              className="group hidden sm:inline-flex items-center gap-1.5 font-body text-sm text-text-muted hover:text-accent transition-colors whitespace-nowrap pb-2"
            >
              All work ({total})
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
          )}
        </div>

        <WorkGrid items={items} whatsappNumber={whatsappNumber} />

        {total > items.length && (
          <div className="mt-12 flex justify-center sm:hidden">
            <Link
              href="/work"
              className="font-body text-sm text-text px-5 py-2.5 rounded-full"
              style={{ border: '1px solid var(--border)' }}
            >
              All work ({total}) →
            </Link>
          </div>
        )}
      </Container>
    </section>
  );
}
