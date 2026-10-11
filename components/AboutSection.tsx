'use client';

import { motion } from 'framer-motion';
import { PortableText, type PortableTextComponents } from '@portabletext/react';
import type { PortableTextBlock } from '@portabletext/types';
import Container from '@/components/ui/Container';

interface AboutSectionProps {
  body?: PortableTextBlock[];
  portraitUrl?: string;
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
        text: "I'm a video editor based in India with 4+ years of experience in professional video editing and motion graphics. I've worked with brands across fintech, wellness, and digital businesses, handling everything from creative campaigns to landscape content.",
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
        text: "Currently, my focus is on performance ads, premium SaaS-style motion graphics, and long-form landscape editing. I work with both retainer and project-based clients, creating content designed not just to look polished, but to drive attention, engagement, and ultimately contribute to growth and revenue.",
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

const portableComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="font-body text-text mb-5 last:mb-0" style={{ fontSize: '1.0625rem', lineHeight: 1.7 }}>
        {children}
      </p>
    ),
  },
  marks: {
    em: ({ children }) => <em style={{ fontStyle: 'italic', color: 'var(--text)' }}>{children}</em>,
    strong: ({ children }) => <strong className="font-semibold text-text">{children}</strong>,
  },
};

export default function AboutSection({ body, portraitUrl }: AboutSectionProps) {
  const bodyContent = body && body.length > 0 ? body : FALLBACK_BODY;

  const text = (
    <>
      <h2
        className="font-display font-semibold text-text mb-8"
        style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', lineHeight: 1.1, letterSpacing: '-0.02em' }}
      >
        A real editor, not a template.
      </h2>
      <PortableText value={bodyContent} components={portableComponents} />
    </>
  );

  return (
    <section id="about" className="py-14 md:py-20" style={{ borderTop: '1px solid var(--border)' }}>
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

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className={portraitUrl ? 'grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center' : 'max-w-3xl'}
        >
          {portraitUrl ? (
            <>
              <div className="md:col-span-7 order-2 md:order-1">{text}</div>
              <div className="md:col-span-5 order-1 md:order-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${portraitUrl}?w=800&fit=max&auto=format`}
                  alt="Harsh Powar"
                  className="w-full max-w-sm md:max-w-none mx-auto rounded-3xl object-cover aspect-[4/5]"
                  style={{ border: '1px solid rgba(79,142,247,0.18)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
                />
              </div>
            </>
          ) : (
            text
          )}
        </motion.div>
      </Container>
    </section>
  );
}
