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
const STEP_ICONS = ['/Brief.png', '/Concept.png', '/Cut.png'];

/**
 * PremiumCard — cinematic glassmorphism surface with button-consistent
 * radial gradient border (bright top-right → dark bottom-left).
 *
 * Layer stack (bottom → top):
 *   0. Outer shell: padding-box fill + radial border-box (matches button UI)
 *   1. Inner vignette          — corners dark, focus pulled inward
 *   2. Volumetric core bloom   — dense amber at bottom, main light source
 *   3. Upward diffusion        — fog rising from the core
 *   4. Wide fog mid-layer      — light trapped inside glass feel
 *   5. Bottom-left halo        — corner warmth
 *   6. Bottom-right halo       — asymmetric corner warmth
 *   7. Top surface vignette    — keeps text crisp
 *   8. Glass border inset      — edge highlights + corner bloom
 *   9. Noise grain             — 3.5% opacity, cinematic texture
 *  10. Content                 — z-10, always readable
 */
function PremiumCard({
  children,
  delay = 0,
  index = 0,
}: {
  children: React.ReactNode;
  delay?: number;
  index?: number;
}) {
  const noiseId = `card-grain-${index}`;

  return (
    <div className="card-glow-wrapper h-full">
      {/* Layer: large atmospheric glow behind card */}
      <div aria-hidden="true" className="card-ambient-glow" />
      {/* Layer: medium soft rotating ring */}
      <div aria-hidden="true" className="card-medium-glow" />
      {/* Layer: sharp tight white edge */}
      <div aria-hidden="true" className="card-white-glow" />

    <motion.article
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'relative',
        zIndex: 1,
        borderRadius: 22,
        overflow: 'hidden',
        height: '100%',

        /* ── Outer shell: same radial gradient border as buttons ──
             Top-right: warm white → Bottom-left: near-black.
             padding-box = card fill, border-box = gradient stroke. */
        border: '1px solid transparent',
        background: [
          'linear-gradient(rgba(6,11,20,0.97), rgba(6,11,20,0.97)) padding-box',
          'radial-gradient(circle 130px at 80% -15%, rgba(147,197,253,0.55) 0%, rgba(79,142,247,0.20) 32%, rgba(6,11,20,0.96) 68%) border-box',
        ].join(', '),

        /* ── Multi-layer floating shadow — cards suspended not attached ── */
        boxShadow: [
          '0 1px 0 0 rgba(255,255,255,0.05)',
          '0 4px 12px rgba(0,0,0,0.55)',
          '0 12px 32px rgba(0,0,0,0.50)',
          '0 28px 64px rgba(0,0,0,0.42)',
          '0 48px 96px rgba(0,0,0,0.30)',
          '0 0 18px rgba(147,197,253,0.04)',
          '0 0 60px rgba(79,142,247,0.08)',
        ].join(', '),
      }}
    >

      {/* ── Layer 1: Inner vignette ── */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 80% 70% at 50% 38%, transparent 25%, rgba(0,0,0,0.28) 100%)',
        pointerEvents: 'none', zIndex: 1,
      }} />

      {/* ── Layer 2: Volumetric core bloom ── */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 105% 80% at 50% 125%, rgba(79,142,247,0.58) 0%, rgba(59,117,230,0.35) 22%, rgba(37,78,165,0.18) 42%, rgba(20,50,120,0.07) 60%, transparent 75%)',
        filter: 'blur(3px)',
        pointerEvents: 'none', zIndex: 2,
      }} />

      {/* ── Layer 3: Upward diffusion ── */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 85% 65% at 50% 115%, rgba(79,142,247,0.24) 0%, rgba(37,78,165,0.12) 38%, rgba(24,56,128,0.05) 60%, transparent 75%)',
        filter: 'blur(18px)',
        pointerEvents: 'none', zIndex: 3,
      }} />

      {/* ── Layer 4: Volumetric fog ── */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 75% 55% at 50% 100%, rgba(79,142,247,0.13) 0%, rgba(37,78,165,0.06) 48%, transparent 72%)',
        filter: 'blur(32px)',
        pointerEvents: 'none', zIndex: 4,
      }} />

      {/* ── Layer 5: Bottom-left halo ── */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 58% 48% at -6% 108%, rgba(59,117,230,0.30) 0%, rgba(37,78,165,0.12) 48%, transparent 70%)',
        filter: 'blur(20px)',
        pointerEvents: 'none', zIndex: 5,
      }} />

      {/* ── Layer 6: Bottom-right halo ── */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 58% 48% at 106% 108%, rgba(79,142,247,0.24) 0%, rgba(37,78,165,0.09) 48%, transparent 70%)',
        filter: 'blur(20px)',
        pointerEvents: 'none', zIndex: 6,
      }} />

      {/* ── Layer 7: Top surface vignette ── */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, rgba(6,11,20,0.90) 0%, rgba(6,11,20,0.60) 28%, rgba(6,11,20,0.20) 52%, rgba(6,11,20,0.06) 68%, transparent 82%)',
        pointerEvents: 'none', zIndex: 7,
      }} />

      {/* ── Layer 8: Glass border inset system ── */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0,
        borderRadius: 22,
        boxShadow: [
          'inset 0 1px 0 rgba(255,255,255,0.07)',
          'inset 0 -1px 0 rgba(147,197,253,0.18)',
          'inset 1px 0 0 rgba(255,255,255,0.03)',
          'inset -1px 0 0 rgba(255,255,255,0.02)',
          'inset 3px 3px 0 rgba(255,255,255,0.025)',
          'inset -3px 3px 0 rgba(255,255,255,0.018)',
          'inset 0 0 35px rgba(79,142,247,0.04)',
        ].join(', '),
        pointerEvents: 'none', zIndex: 8,
      }} />

      {/* ── Layer 9: Noise grain ── */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0,
        borderRadius: 22, overflow: 'hidden',
        opacity: 0.035, pointerEvents: 'none', zIndex: 9,
      }}>
        <svg width="100%" height="100%" style={{ display: 'block' }}>
          <defs>
            <filter id={noiseId}>
              <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" stitchTiles="stitch" />
              <feColorMatrix type="saturate" values="0" />
            </filter>
          </defs>
          <rect width="100%" height="100%" filter={`url(#${noiseId})`} />
        </svg>
      </div>

      {/* ── Content ── */}
      <div style={{ position: 'relative', zIndex: 10, padding: '22px 24px' }}>
        {children}
      </div>
    </motion.article>
    </div>
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
            <PremiumCard key={i} delay={i * 0.12} index={i}>

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
                    filter: [
                      'drop-shadow(0 0 8px rgba(79,142,247,0.60))',
                      'drop-shadow(0 0 20px rgba(79,142,247,0.30))',
                      'drop-shadow(0 0 40px rgba(79,142,247,0.12))',
                    ].join(' '),
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
