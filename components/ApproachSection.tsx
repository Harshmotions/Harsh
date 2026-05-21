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
 * PremiumCard — cinematic dark glassmorphism card.
 *
 * Layer stack (bottom → top):
 *   0. Deep glass base                — near-black, very slight warm undertone
 *   1. Inner vignette                 — corners dark, pulls focus inward
 *   2. Volumetric core bloom          — dense bottom radial, main glow source
 *   3. Upward diffusion               — soft spread from the core, blurred wide
 *   4. Volumetric fog mid-layer       — trapped light feel, blurred wider
 *   5. Bottom-left cinematic halo     — corner warmth
 *   6. Bottom-right cinematic halo    — corner warmth
 *   7. Top surface vignette           — keeps text crisp, fades glow before content
 *   8. Layered glass border system    — inset multi-edge highlights + corner bloom
 *   9. Subtle noise / grain overlay   — ~3.5% opacity, cinematic texture
 *  10. Content                        — always z-10
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
    <motion.article
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'relative',
        borderRadius: 22,
        overflow: 'hidden',

        /* ── Deep glass base + vertical gradient glass stroke ──
             padding-box = card fill, border-box = gradient stroke.
             Bottom: warm white (0.55 opacity) → Top: same tone, near transparent (0.02).
             Single color family, only opacity changes — fades into darkness. */
        border: '1px solid transparent',
        background: [
          'linear-gradient(rgba(7,6,5,0.97), rgba(7,6,5,0.97)) padding-box',
          'linear-gradient(to top, rgba(255,248,228,0.55) 0%, rgba(255,248,228,0.08) 55%, rgba(255,248,228,0.02) 100%) border-box',
        ].join(', '),

        /* ── Multi-layer floating shadow system ──
             Cards feel suspended, not attached to the page. */
        boxShadow: [
          '0 1px 0 0 rgba(255,255,255,0.05)',         // top surface catch-light
          '0 4px 12px rgba(0,0,0,0.55)',              // near shadow — tight depth
          '0 12px 32px rgba(0,0,0,0.50)',             // mid shadow — lift
          '0 28px 64px rgba(0,0,0,0.42)',             // far shadow — float
          '0 48px 96px rgba(0,0,0,0.30)',             // atmospheric spread
          '0 0 18px rgba(255,248,228,0.04)',           // soft warm outer border bloom
          '0 0 60px rgba(212,168,75,0.04)',            // ambient amber haze
        ].join(', '),
      }}
    >

      {/* ── Layer 1: Inner vignette ────────────────────────────────────────
            Corners pull slightly darker. Creates focused center, luxury feel. */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0,
          background:
            'radial-gradient(ellipse 80% 70% at 50% 38%, transparent 25%, rgba(0,0,0,0.28) 100%)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* ── Layer 2: Volumetric core bloom ────────────────────────────────
            Dense amber radial anchored below card bottom — main light source.
            Minimal blur to keep the core tight and bright. */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0,
          background:
            'radial-gradient(ellipse 105% 80% at 50% 125%, rgba(212,168,75,0.58) 0%, rgba(196,152,40,0.35) 22%, rgba(160,112,16,0.18) 42%, rgba(100,68,6,0.07) 60%, transparent 75%)',
          filter: 'blur(3px)',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />

      {/* ── Layer 3: Upward diffusion ──────────────────────────────────────
            Soft spread rising from the core. Creates the volumetric fog feel. */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0,
          background:
            'radial-gradient(ellipse 85% 65% at 50% 115%, rgba(212,168,75,0.24) 0%, rgba(184,136,26,0.12) 38%, rgba(120,84,10,0.05) 60%, transparent 75%)',
          filter: 'blur(18px)',
          pointerEvents: 'none',
          zIndex: 3,
        }}
      />

      {/* ── Layer 4: Volumetric fog — wide mid-layer ──────────────────────
            Wider, softer than layer 3. Simulates light trapped inside glass. */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0,
          background:
            'radial-gradient(ellipse 75% 55% at 50% 100%, rgba(212,168,75,0.13) 0%, rgba(184,136,26,0.06) 48%, transparent 72%)',
          filter: 'blur(32px)',
          pointerEvents: 'none',
          zIndex: 4,
        }}
      />

      {/* ── Layer 5: Bottom-left cinematic halo ───────────────────────────
            Warm amber drift bleeding from lower-left corner. */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0,
          background:
            'radial-gradient(ellipse 58% 48% at -6% 108%, rgba(200,155,40,0.30) 0%, rgba(180,130,20,0.12) 48%, transparent 70%)',
          filter: 'blur(20px)',
          pointerEvents: 'none',
          zIndex: 5,
        }}
      />

      {/* ── Layer 6: Bottom-right cinematic halo ──────────────────────────
            Slightly cooler amber — creates asymmetry, avoids flat strip look. */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0,
          background:
            'radial-gradient(ellipse 58% 48% at 106% 108%, rgba(212,168,75,0.24) 0%, rgba(184,136,26,0.09) 48%, transparent 70%)',
          filter: 'blur(20px)',
          pointerEvents: 'none',
          zIndex: 6,
        }}
      />

      {/* ── Layer 7: Top surface vignette ─────────────────────────────────
            Fades the glow before it reaches the content area. Crisp text. */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0,
          background:
            'linear-gradient(to bottom, rgba(7,6,5,0.90) 0%, rgba(7,6,5,0.60) 28%, rgba(7,6,5,0.20) 52%, rgba(7,6,5,0.06) 68%, transparent 82%)',
          pointerEvents: 'none',
          zIndex: 7,
        }}
      />

      {/* ── Layer 8: Layered glass border system ──────────────────────────
            Multi-edge inset highlights — top brighter, sides subtle,
            bottom amber, corners catch extra light. Non-uniform = natural. */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0,
          borderRadius: 22,
          boxShadow: [
            'inset 0 1px 0 rgba(255,255,255,0.07)',       // top inner highlight (subtle — border above already lit)
            'inset 0 -1px 0 rgba(255,248,228,0.18)',      // bottom inner rim — warm white echo
            'inset 1px 0 0 rgba(255,255,255,0.03)',       // left edge
            'inset -1px 0 0 rgba(255,255,255,0.02)',      // right edge
            'inset 3px 3px 0 rgba(255,255,255,0.025)',    // top-left corner brighter
            'inset -3px 3px 0 rgba(255,255,255,0.018)',   // top-right corner
            'inset 0 0 35px rgba(212,168,75,0.04)',       // inner ambient amber bloom
          ].join(', '),
          pointerEvents: 'none',
          zIndex: 8,
        }}
      />

      {/* ── Layer 9: Noise / grain overlay ────────────────────────────────
            ~3.5% opacity. Cinematic texture only — never distracting. */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0,
          borderRadius: 22,
          overflow: 'hidden',
          opacity: 0.035,
          pointerEvents: 'none',
          zIndex: 9,
        }}
      >
        <svg width="100%" height="100%" style={{ display: 'block' }}>
          <defs>
            <filter id={noiseId}>
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.72"
                numOctaves="4"
                stitchTiles="stitch"
              />
              <feColorMatrix type="saturate" values="0" />
            </filter>
          </defs>
          <rect width="100%" height="100%" filter={`url(#${noiseId})`} />
        </svg>
      </div>

      {/* ── Content ───────────────────────────────────────────────────────
            Always z-10. Fully readable against all gradient layers. */}
      <div style={{ position: 'relative', zIndex: 10, padding: '30px' }}>
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
            <PremiumCard key={i} delay={i * 0.12} index={i}>

              {/* ── Number — cinematic multi-layer bloom ── */}
              <div
                className="font-display font-bold mb-6"
                style={{
                  fontSize: '2.25rem',
                  letterSpacing: '-0.03em',
                  color: '#E8C060',
                  /* 5-layer bloom stack:
                     tight core → medium bloom → wide bloom → atmospheric → far glow */
                  textShadow: [
                    '0 0 6px rgba(232,192,96,0.95)',
                    '0 0 14px rgba(212,168,75,0.75)',
                    '0 0 30px rgba(212,168,75,0.48)',
                    '0 0 60px rgba(212,168,75,0.24)',
                    '0 0 100px rgba(184,136,26,0.10)',
                  ].join(', '),
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
