'use client';

import Container from '@/components/ui/Container';
import CountUp from '@/components/motion/CountUp';
import ScrambleText from '@/components/motion/ScrambleText';
import Reveal from '@/components/motion/Reveal';

const STATS = [
  {
    value: '3M+',
    label: 'Views generated',
    description: 'Across client channels',
  },
  {
    value: '400+',
    label: 'Videos delivered',
    description: 'Ads, motion, long-form',
  },
  {
    value: '12+',
    label: 'Brands',
    description: 'Finance · SaaS · Gaming · Wellness',
  },
  {
    value: '5+',
    label: 'Years editing',
    description: 'Retainers and one-offs',
  },
] as const;

export default function ImpactStats() {
  return (
    <section
      className="py-12 md:py-16"
      style={{ borderTop: '1px solid var(--border)' }}
    >
      <Container>
        <Reveal as="p" y={10} className="font-body text-text-muted text-xs uppercase tracking-[0.2em] mb-8">
          <ScrambleText text="By the numbers" replayOnHover />
        </Reveal>

        {/* Button-card grid: 4-col desktop, 2×2 mobile */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {STATS.map(({ value, label, description }, i) => (
            <Reveal
              key={label}
              y={24}
              duration={1.1}
              delay={i * 0.09}
              className="flex flex-col gap-1.5 rounded-xl p-4 md:p-5"
              style={{
                border: '1px solid var(--border)',
                background: 'var(--surface)',
              }}
            >
              <span
                className="font-display font-bold"
                style={{
                  fontSize: 'clamp(26px, 3.2vw, 40px)',
                  letterSpacing: '-0.02em',
                  lineHeight: 1,
                  color: 'var(--accent)',
                }}
              >
                <CountUp value={value} />
              </span>
              <span
                className="font-display font-semibold text-text"
                style={{ fontSize: '0.9375rem', lineHeight: 1.2 }}
              >
                {label}
              </span>
              <span
                className="font-body text-text-muted"
                style={{ fontSize: '0.75rem', lineHeight: 1.4 }}
              >
                {description}
              </span>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
