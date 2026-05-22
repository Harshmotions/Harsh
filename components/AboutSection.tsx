'use client';

import { motion } from 'framer-motion';
import { PortableText, type PortableTextComponents } from '@portabletext/react';
import type { PortableTextBlock } from '@portabletext/types';
import Container from '@/components/ui/Container';
import type { ClientRef } from '@/lib/types';

interface AboutSectionProps {
  body?: PortableTextBlock[];
  tools?: string[];
  clients?: ClientRef[];
}

const FALLBACK_BODY: PortableTextBlock[] = [
  {
    _type: 'block',
    _key: '1',
    style: 'normal',
    markDefs: [],
    children: [
      {
        _type: 'span',
        _key: '1a',
        text: "I'm a video editor based in India with 4+ years of experience in professional video editing and motion graphics. I've worked with brands across fintech, wellness, and digital businesses, handling everything from creative campaigns to long-form content.",
        marks: [],
      },
    ],
  },
  {
    _type: 'block',
    _key: '2',
    style: 'normal',
    markDefs: [],
    children: [
      {
        _type: 'span',
        _key: '2a',
        text: "Currently, my focus is on AI creative ads and films, premium SaaS-style motion graphics, and long-form editing. I work with both retainer and project-based clients, creating content designed not just to look polished, but to drive attention, engagement, and ultimately contribute to growth and revenue.",
        marks: [],
      },
    ],
  },
  {
    _type: 'block',
    _key: '3',
    style: 'normal',
    markDefs: [],
    children: [
      {
        _type: 'span',
        _key: '3a',
        text: "I approach every project with the mindset that great videos shouldn't just perform visually, they should perform for the business too.",
        marks: [],
      },
    ],
  },
];

const FALLBACK_TOOLS = [
  'After Effects',
  'Premiere Pro',
  'CapCut',
  'Higgsfield',
  'Kling',
  'Runway',
  'Suno',
];

const portableComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p
        className="font-body text-text mb-5 last:mb-0"
        style={{ fontSize: '1.0625rem', lineHeight: 1.7 }}
      >
        {children}
      </p>
    ),
  },
  marks: {
    em: ({ children }) => (
      <em style={{ fontStyle: 'italic', color: 'var(--text)' }}>{children}</em>
    ),
    strong: ({ children }) => (
      <strong className="font-semibold text-text">{children}</strong>
    ),
  },
};

/* ── Seamless logo ticker ─────────────────────────────────────────────────── */
function LogoTicker({ clients }: { clients: ClientRef[] }) {
  // 4× copies so the track is always wider than the container on any screen — animate by -25%
  const quadrupled = [...clients, ...clients, ...clients, ...clients];

  return (
    <div className="logo-marquee-outer">
      <div className="logo-marquee-track">
        {quadrupled.map((c, i) => {
          // SharkFunded logo has heavy built-in whitespace — tighter padding + bigger render
          const isSharkFunded = c.name === 'SharkFunded';
          return (
          <div
            key={`${c._id}-${i}`}
            style={{
              padding: isSharkFunded ? '0 12px' : '0 36px',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {c.logoUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={c.logoUrl}
                alt={c.name}
                style={{
                  height: isSharkFunded ? 72 : 48,
                  width: 'auto',
                  maxWidth: isSharkFunded ? 220 : 160,
                  objectFit: 'contain',
                  opacity: 0.82,
                  display: 'block',
                }}
              />
            ) : (
              <span
                style={{
                  fontFamily: 'var(--font-sora, sans-serif)',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  color: 'rgba(240,237,232,0.70)',
                  letterSpacing: '-0.02em',
                  whiteSpace: 'nowrap',
                }}
              >
                {c.name}
              </span>
            )}
          </div>
        );})}
      </div>
    </div>
  );
}

export default function AboutSection({
  body,
  tools,
  clients,
}: AboutSectionProps) {
  const bodyContent = body && body.length > 0 ? body : FALLBACK_BODY;
  const toolsContent = tools && tools.length > 0 ? tools : FALLBACK_TOOLS;

  return (
    <section
      id="about"
      className="py-14 md:py-20"
      style={{ borderTop: '1px solid var(--border)' }}
    >
      <Container>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="font-body text-text-muted text-xs uppercase tracking-[0.2em] mb-8"
        >
          About
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          {/* Left: Body */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="md:col-span-7"
          >
            <h2
              className="font-display font-semibold text-text mb-10"
              style={{
                fontSize: 'clamp(28px, 3.5vw, 44px)',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
              }}
            >
              A real editor, not a template.
            </h2>
            <div className="text-text">
              <PortableText
                value={bodyContent}
                components={portableComponents}
              />
            </div>
          </motion.div>

          {/* Right: Tools */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{
              duration: 0.8,
              delay: 0.15,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="md:col-span-5"
          >
            <p className="font-body text-text-muted text-xs uppercase tracking-[0.2em] mb-6">
              Tools of the trade
            </p>
            <div className="flex flex-wrap gap-2">
              {toolsContent.map((tool, i) => (
                <motion.span
                  key={tool}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{
                    duration: 0.5,
                    delay: 0.25 + i * 0.04,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="inline-flex items-center px-3 py-1.5 rounded-full font-body text-sm text-text-muted hover:text-text transition-colors"
                  style={{ border: '1px solid var(--border)' }}
                >
                  {tool}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* "Trusted by" label + ticker — fully inside Container so it respects the separator line */}
        {clients && clients.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-12 pt-10"
            style={{ borderTop: '1px solid var(--border)' }}
          >
            <p className="font-body text-text-muted text-xs uppercase tracking-[0.2em] mb-6 text-center">
              Trusted by
            </p>
            <LogoTicker clients={clients} />
          </motion.div>
        )}
      </Container>
    </section>
  );
}
