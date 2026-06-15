'use client';

import { motion } from 'framer-motion';
import Container from '@/components/ui/Container';

const STATS = [
  {
    value: '3M+',
    label: 'Views Generated',
    description: 'Total reach across all client content',
  },
  {
    value: '5',
    label: 'Visual Identities',
    description: 'Brands with a consistent signature look',
  },
  {
    value: '400+',
    label: 'Videos Delivered',
    description: 'Across ads, motion, and long-form',
  },
  {
    value: '4',
    label: 'Industries',
    description: 'Finance · SaaS · Gaming · Wellness',
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
          Impact, not just output
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
                {value}
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
