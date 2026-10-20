'use client';

import Container from '@/components/ui/Container';
import RevealText from '@/components/motion/RevealText';
import ScrambleText from '@/components/motion/ScrambleText';
import ScrollHighlightText from '@/components/motion/ScrollHighlightText';
import Reveal from '@/components/motion/Reveal';

interface AboutSectionProps {
  /** Paragraphs, in order (content/site.json). */
  paragraphs: string[];
  /** Optional portrait, a path in /public. */
  portrait?: string;
}

export default function AboutSection({ paragraphs, portrait }: AboutSectionProps) {
  const text = (
    <>
      <RevealText
        text="Hi, I'm Harsh."
        className="font-display font-semibold text-text mb-8"
        style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', lineHeight: 1.1, letterSpacing: '-0.02em' }}
      />
      <ScrollHighlightText
        paragraphs={paragraphs}
        className="font-display text-text mb-6 last:mb-0"
        style={{ fontSize: 'clamp(19px, 2.1vw, 27px)', fontWeight: 500, lineHeight: 1.4, letterSpacing: '-0.01em' }}
      />
    </>
  );

  return (
    <section id="about" className="py-14 md:py-20 overflow-x-clip" style={{ borderTop: '1px solid var(--border)' }}>
      <Container>
        <Reveal as="p" y={10} className="font-body text-text-muted text-xs uppercase tracking-[0.2em] mb-8">
          <ScrambleText text="About" replayOnHover />
        </Reveal>

        <div
          className={portrait ? 'grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center' : 'max-w-4xl'}
        >
          {portrait ? (
            <>
              <div className="md:col-span-7 order-2 md:order-1">{text}</div>
              <div className="md:col-span-5 order-1 md:order-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={portrait}
                  alt="Harsh Powar"
                  className="w-full max-w-sm md:max-w-none mx-auto rounded-3xl object-cover aspect-[4/5]"
                  style={{ border: '1px solid rgba(79,142,247,0.18)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
                />
              </div>
            </>
          ) : (
            text
          )}
        </div>
      </Container>
    </section>
  );
}
