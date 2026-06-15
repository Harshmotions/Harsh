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
    value: '50+',
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
          className="font-body text-text-muted text-xs uppercase tracking-[0.2em] mb-10"
        >
          Impact, not just output
        </motion.p>

        <div className="flex flex-col md:flex-row">
          {STATS.map(({ value, label, description }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className={[
                'flex-1 flex flex-col gap-2',
                'py-8 md:py-0',
                'md:px-8',
                i === 0 ? 'md:pl-0' : '',
                i === STATS.length - 1 ? 'md:pr-0' : '',
                'border-b border-border last:border-b-0 md:border-b-0',
                i > 0 ? 'md:border-l border-border' : '',
              ].join(' ')}
            >
              <span
                className="font-display font-bold"
                style={{
                  fontSize: 'clamp(36px, 4.5vw, 56px)',
                  letterSpacing: '-0.03em',
                  lineHeight: 1,
                  color: 'var(--accent)',
                }}
              >
                {value}
              </span>
              <span
                className="font-display font-semibold text-text"
                style={{ fontSize: '1.0625rem', lineHeight: 1.2 }}
              >
                {label}
              </span>
              <span
                className="font-body text-text-muted"
                style={{ fontSize: '0.8125rem', lineHeight: 1.45 }}
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
