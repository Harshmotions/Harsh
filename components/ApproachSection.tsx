'use client';

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

/**
 * PremiumCard — replicates the deep glassmorphism style from the design reference.
 *
 * Layers (bottom → top):
 *  1. Near-black glass base
 *  2. Dense bottom-centre volumetric amber bloom (main glow core)
 *  3. Bottom-left corner halo  (warm amber drift)
 *  4. Bottom-right corner halo (slightly cooler amber edge)
 *  5. Mid-card diffusion spread (low-opacity ambient fill)
 *  6. Top dark vignette  (keeps content readable against the glow)
 *  7. Inner border highlight  (inset glow on the stroke)
 *  8. Outer border + box-shadow on the wrapper
 *  9. Content — always z-10, fully readable
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
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'relative',
        borderRadius: 20,
        overflow: 'hidden',
        /* Outer stroke — subtle amber */
        border: '1px solid rgba(212,168,75,0.22)',
        /* Near-black glass base */
        background: 'rgba(7, 6, 5, 0.96)',
        /* Outer glow: ambient depth + soft amber halo */
        boxShadow: [
          '0 0 0 1px rgba(212,168,75,0.08)',
          '0 2px 8px rgba(0,0,0,0.5)',
          '0 16px 48px rgba(0,0,0,0.65)',
          '0 0 60px rgba(212,168,75,0.05)',
        ].join(', '),
      }}
    >
      {/* ── Gradient layer 1: Main volumetric bottom bloom ─────────────
          Dense amber core sitting below the card surface, radiating up.
          This is the "floating luminous core" effect. */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 90% 60% at 50% 118%, rgba(212,168,75,0.52) 0%, rgba(184,136,26,0.28) 28%, rgba(120,88,10,0.10) 55%, transparent 72%)',
          filter: 'blur(6px)',
          pointerEvents: 'none',
        }}
      />

      {/* ── Gradient layer 2: Bottom-left cinematic halo ──────────────── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 60% 50% at -8% 100%, rgba(200,155,40,0.32) 0%, rgba(180,130,20,0.12) 45%, transparent 68%)',
          filter: 'blur(14px)',
          pointerEvents: 'none',
        }}
      />

      {/* ── Gradient layer 3: Bottom-right cinematic halo ─────────────── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 60% 50% at 108% 100%, rgba(212,168,75,0.26) 0%, rgba(184,136,26,0.10) 45%, transparent 68%)',
          filter: 'blur(14px)',
          pointerEvents: 'none',
        }}
      />

      {/* ── Gradient layer 4: Mid-card ambient diffusion spread ───────── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 70% 45% at 50% 78%, rgba(212,168,75,0.10) 0%, transparent 65%)',
          filter: 'blur(20px)',
          pointerEvents: 'none',
        }}
      />

      {/* ── Gradient layer 5: Top dark vignette ─────────────────────────
          Fades the glow before reaching the content, keeping text crisp. */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(to bottom, rgba(7,6,5,0.82) 0%, rgba(7,6,5,0.50) 38%, rgba(7,6,5,0.12) 62%, transparent 80%)',
          pointerEvents: 'none',
        }}
      />

      {/* ── Layer 6: Inner border highlight (inset glow on the stroke) ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 20,
          boxShadow: [
            'inset 0 1px 0 rgba(255,255,255,0.07)',
            'inset 0 -1px 0 rgba(212,168,75,0.20)',
            'inset 1px 0 0 rgba(212,168,75,0.06)',
            'inset -1px 0 0 rgba(212,168,75,0.06)',
          ].join(', '),
          pointerEvents: 'none',
        }}
      />

      {/* Content — always above every gradient layer */}
      <div style={{ position: 'relative', zIndex: 10, padding: '28px' }}>
        {children}
      </div>
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
            <PremiumCard key={i} delay={i * 0.1}>
              {/* Amber number — glowing */}
              <div
                className="font-display font-bold mb-5"
                style={{
                  fontSize: '2rem',
                  letterSpacing: '-0.02em',
                  color: 'var(--accent)',
                  textShadow:
                    '0 0 16px rgba(212,168,75,0.7), 0 0 32px rgba(212,168,75,0.3)',
                }}
              >
                0{i + 1}
              </div>
              <h3
                className="font-display text-text mb-3"
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  letterSpacing: '-0.01em',
                }}
              >
                {step.title}
              </h3>
              <p
                className="font-body text-text-muted"
                style={{ fontSize: '0.9375rem', lineHeight: 1.65 }}
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
