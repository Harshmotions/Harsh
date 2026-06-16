'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import Container from '@/components/ui/Container';
import type { ApproachStep } from '@/lib/types';

interface ApproachSectionProps {
  steps?: ApproachStep[];
}

const FALLBACK_STEPS: ApproachStep[] = [
  {
    title: 'Brief',
    description:
      "We talk about what you're selling and who you need it to reach. No 40-question intake form. Just a real conversation about the goal.",
  },
  {
    title: 'Concept',
    description:
      'I figure out the hook, the angle, the structure. You see the idea before I touch the timeline, not after.',
  },
  {
    title: 'Cut',
    description:
      'This is where the craft happens. Motion, sound, pacing, the small stuff most people skip. You get the first version usually within the week.',
  },
];

/* PNG icons per step — matches filenames in /public */
const STEP_ICONS = ['/Brief2.png', '/Concept2.png', '/Cut2.png'];

/**
 * PremiumCard — glossy glass tile: deep navy radial fill with a soft
 * top-left highlight, lighting up to a bright rim-glow on hover.
 */
function PremiumCard({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{
        borderColor: 'rgba(147,197,253,0.85)',
        boxShadow: [
          '0 0 0 1px rgba(147,197,253,0.55)',
          '0 0 36px rgba(79,142,247,0.55)',
          '0 0 80px rgba(79,142,247,0.30)',
          'inset 0 1px 0 rgba(255,255,255,0.18)',
        ].join(', '),
        transition: { duration: 0.4, ease: 'easeOut' },
      }}
      style={{
        position: 'relative',
        height: '100%',
        borderRadius: 28,
        padding: '28px 26px',
        overflow: 'hidden',
        border: '1px solid rgba(79,142,247,0.14)',
        background:
          'radial-gradient(circle at 26% 16%, rgba(94,160,255,0.32) 0%, rgba(28,52,104,0.55) 32%, rgba(6,11,20,0.98) 68%)',
        boxShadow: [
          'inset 0 1px 0 rgba(255,255,255,0.08)',
          'inset 0 -24px 48px rgba(0,0,0,0.50)',
          '0 24px 48px rgba(0,0,0,0.40)',
        ].join(', '),
      }}
    >
      {children}
    </motion.article>
  );
}

export default function ApproachSection({ steps }: ApproachSectionProps) {
  const data = steps && steps.length === 3 ? steps : FALLBACK_STEPS;

  return (
    <section className="py-14 md:py-20" id="approach">
      <Container>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="font-body text-text-muted text-xs uppercase tracking-[0.2em] mb-3"
        >
          Approach
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="font-display font-semibold text-text mb-10"
          style={{
            fontSize: 'clamp(32px, 4.5vw, 64px)',
            lineHeight: 1,
            letterSpacing: '-0.02em',
          }}
        >
          How a project goes.
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {data.map((step, i) => (
            <PremiumCard key={i} delay={i * 0.12}>

              {/* ── Step icon — PNG from /public ── */}
              <div className="mb-3" style={{ display: 'flex', alignItems: 'flex-start' }}>
                <Image
                  src={STEP_ICONS[i]}
                  alt={step.title}
                  width={52}
                  height={52}
                  style={{
                    width: 52,
                    height: 52,
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 0 10px rgba(79,142,247,0.45))',
                  }}
                />
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
