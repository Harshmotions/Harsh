'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { motion, useMotionValue, useMotionValueEvent, useScroll, useSpring, useTransform, type MotionValue } from 'framer-motion';
import Container from '@/components/ui/Container';
import RevealText from '@/components/motion/RevealText';
import type { ApproachStep } from '@/lib/site';
import ScrambleText from '@/components/motion/ScrambleText';
import Reveal from '@/components/motion/Reveal';
import { EASE_SETTLE, useReplayInView } from '@/components/motion/useReplayInView';

interface ApproachSectionProps {
  steps?: ApproachStep[];
}

const FALLBACK_STEPS: ApproachStep[] = [
  {
    title: 'Brief',
    description: 'One real conversation about what you sell and who needs to see it.',
  },
  {
    title: 'Concept',
    description: 'Hook, angle, structure. You approve the idea before I edit.',
  },
  {
    title: 'Cut',
    description: 'Motion, sound, pacing. First version within a week.',
  },
];

/* PNG icons per step — matches filenames in /public */
const STEP_ICONS = ['/Brief2.png', '/Concept2.png', '/Cut2.png'];

/**
 * PremiumCard — illuminated edge-lit panel: dark navy center, light
 * concentrated at the inside rim (brightest near the corners), with a
 * soft blue bloom bleeding outside the card on hover.
 */
function PremiumCard({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const [ref, inView] = useReplayInView<HTMLDivElement>('-80px');
  return (
    <motion.div
      ref={ref}
      className="approach-card-wrapper"
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 1.2, delay, ease: EASE_SETTLE }}
    >
      <div aria-hidden="true" className="approach-card-bloom" />
      <div className="approach-card-edge">
        <div className="approach-card-surface">
          <div aria-hidden="true" className="approach-card-corner-tl" />
          <div aria-hidden="true" className="approach-card-corner-br" />
          <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
        </div>
      </div>
    </motion.div>
  );
}

// Desktop: a line that draws across the three steps as the section scrolls in,
// lighting each node as it passes. Card centres sit at about 1/6, 3/6 and 5/6.
function ProcessNode({ pos, progress }: { pos: number; progress: MotionValue<number> }) {
  const lit = useTransform(progress, [pos - 0.05, pos + 0.02], [0, 1]);
  return (
    <span
      className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 block w-3.5 h-3.5 rounded-full"
      style={{ left: `${pos * 100}%`, border: '1px solid rgba(79,142,247,0.5)', background: 'var(--bg)' }}
    >
      <motion.span
        className="absolute inset-0 rounded-full"
        style={{ opacity: lit, scale: lit, background: 'var(--accent)', boxShadow: '0 0 14px rgba(79,142,247,0.9)' }}
      />
    </span>
  );
}

function ProcessLine() {
  const [ref, inView] = useReplayInView<HTMLDivElement>('0px');
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'start 0.35'] });
  // Only ever draws forward: scrolling back up leaves it as it is, and it resets
  // once it is below the screen so it draws again on the way back down
  const furthest = useMotionValue(0);
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (v > furthest.get()) furthest.set(v);
  });
  useEffect(() => {
    if (!inView) furthest.jump(0);
  }, [inView, furthest]);
  const progress = useSpring(furthest, { stiffness: 55, damping: 20, restDelta: 0.001 });
  return (
    <div ref={ref} aria-hidden="true" className="hidden md:block relative h-6 mb-8">
      <div className="absolute inset-x-0 top-1/2 h-px" style={{ background: 'var(--border)' }} />
      <motion.div
        className="absolute inset-x-0 top-1/2 h-px origin-left"
        style={{
          scaleX: progress,
          background: 'linear-gradient(90deg, rgba(79,142,247,0.2), var(--accent))',
          boxShadow: '0 0 12px rgba(79,142,247,0.6)',
        }}
      />
      {[1 / 6, 3 / 6, 5 / 6].map((pos) => (
        <ProcessNode key={pos} pos={pos} progress={progress} />
      ))}
    </div>
  );
}

export default function ApproachSection({ steps }: ApproachSectionProps) {
  const data = steps && steps.length === 3 ? steps : FALLBACK_STEPS;

  return (
    // overflow-x-clip: the cards' glow reaches past the screen edge on phones
    <section className="py-14 md:py-20 overflow-x-clip" id="approach">
      <Container>
        <Reveal as="p" y={10} className="font-body text-text-muted text-xs uppercase tracking-[0.2em] mb-3">
          <ScrambleText text="Approach" replayOnHover />
        </Reveal>

        <RevealText
          text="From brief to final cut."
          className="font-display font-semibold text-text mb-10"
          style={{ fontSize: 'clamp(32px, 4.5vw, 64px)', lineHeight: 1, letterSpacing: '-0.02em' }}
        />

        <ProcessLine />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {data.map((step, i) => (
            <PremiumCard key={i} delay={i * 0.12}>

              {/* ── Step icon — PNG from /public ── */}
              <div className="mb-3" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Image
                  src={STEP_ICONS[i]}
                  alt={step.title}
                  width={52}
                  height={52}
                  style={{
                    width: 52,
                    height: 52,
                    objectFit: 'contain',
                    filter: 'hue-rotate(215deg) saturate(1.6) brightness(0.95) contrast(1.05) drop-shadow(0 0 10px rgba(79,142,247,0.45))',
                  }}
                />
                <span className="font-display text-sm font-semibold tabular-nums" style={{ color: 'rgba(147,197,253,0.55)' }}>
                  0{i + 1}
                </span>
              </div>

              <h3
                className="font-display text-text mb-3"
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  letterSpacing: '-0.01em',
                  lineHeight: 1.2,
                }}
              >
                {step.title}
              </h3>

              <p
                className="font-body text-text-muted"
                style={{
                  fontSize: '0.9375rem',
                  lineHeight: 1.68,
                  opacity: 0.85,
                }}
              >
                {step.description}
              </p>

            </PremiumCard>
          ))}
        </div>
      </Container>
    </section>
  );
}
