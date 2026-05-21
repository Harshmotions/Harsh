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
        text: "I'm a video editor based out of Maharashtra. I've been editing professionally for a while now, but the last year has been mostly AI ads — for prop trading firms, wellness brands, finance platforms.",
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
        text: "Some clients keep me on monthly retainer. Some come for a one-off podcast cut or a UI motion piece. I've done poster animations where you have one frame and have to make it feel alive without a single cut. That kind of work is honestly my favorite.",
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
        text: "If you're paying for a video, you're paying for what it does after it's posted. That's the part I think about first.",
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

        {/* Client logos row */}
        {clients && clients.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-12 pt-10"
            style={{ borderTop: '1px solid var(--border)' }}
          >
            <p className="font-body text-text-muted text-xs uppercase tracking-[0.2em] mb-8">
              Trusted by
            </p>
            <div className="flex flex-wrap items-center gap-x-12 gap-y-6">
              {clients.map((c) =>
                c.logoUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    key={c._id}
                    src={c.logoUrl}
                    alt={c.name}
                    width={120}
                    height={40}
                    loading="lazy"
                    decoding="async"
                    className="h-8 md:h-10 w-auto opacity-50 hover:opacity-100 transition-opacity duration-300"
                    style={{ filter: 'grayscale(100%)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.filter = 'grayscale(0%)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.filter = 'grayscale(100%)';
                    }}
                  />
                ) : (
                  <span
                    key={c._id}
                    className="font-display text-text-muted hover:text-text transition-colors text-base"
                  >
                    {c.name}
                  </span>
                ),
              )}
            </div>
          </motion.div>
        )}
      </Container>
    </section>
  );
}
