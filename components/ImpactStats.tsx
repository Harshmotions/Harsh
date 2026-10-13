'use client';

import { motion } from 'framer-motion';
import Container from '@/components/ui/Container';
import CountUp from '@/components/motion/CountUp';

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
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="font-body text-text-muted text-xs uppercase tracking-[0.2em] mb-8"
        >
          By the numbers
        </motion.p>

        {/* Button-card grid: 4-col desktop, 2×2 mobile */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {STATS.map(({ value, label, description }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
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
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
