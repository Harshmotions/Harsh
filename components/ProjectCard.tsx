'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { urlForImage } from '@/lib/sanity';
import type { Project } from '@/lib/types';

interface ProjectCardProps {
  project: Project;
  index?: number;
  onClick?: () => void;
  /** Card variant. Defaults to project.type. */
  variant?: 'reel' | 'landscape';
  /** Tailwind width class override. */
  widthClass?: string;
}

export default function ProjectCard({
  project,
  index,
  onClick,
  variant,
  widthClass,
}: ProjectCardProps) {
  const isReel = (variant ?? project.type) === 'reel';
  const aspectClass = isReel ? 'aspect-[9/16]' : 'aspect-[16/9]';
  const defaultWidth = isReel
    ? 'w-[280px] sm:w-[320px] md:w-[360px]'
    : 'w-[480px] sm:w-[560px] md:w-[680px]';
  const finalWidth = widthClass ?? defaultWidth;

  const src = urlForImage(project.thumbnail).width(900).quality(85).url();
  const alt = project.thumbnail.alt || project.title;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      data-cursor="play"
      whileHover={{
        y: -6,
        /* Glow intensifies on card hover */
      }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative flex-shrink-0 ${finalWidth} text-left`}
    >
      <div
        className={`card-inner relative overflow-hidden rounded-2xl ${aspectClass}`}
        style={{
          background: 'var(--surface)',
          border: '1px solid rgba(212,168,75,0.14)',
          boxShadow: [
            '0 4px 20px rgba(0,0,0,0.45)',
            'inset 0 1px 0 rgba(255,255,255,0.04)',
          ].join(', '),
          transition: 'border-color 0.35s ease, box-shadow 0.35s ease',
        }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={
            isReel ? '(max-width: 768px) 80vw, 360px' : '(max-width: 768px) 90vw, 680px'
          }
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />

        {/* Amber tint on hover */}
        <div
          className="absolute inset-0 transition-colors duration-500 pointer-events-none"
          style={{ background: 'transparent' }}
        />
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ background: 'rgba(212,168,75,0.12)' }}
        />

        {/* Numbered overlay */}
        {typeof index === 'number' && (
          <span
            className="absolute top-4 left-4 font-display text-text font-medium text-sm"
            style={{ letterSpacing: '0.05em', opacity: 0.85 }}
          >
            {String(index + 1).padStart(2, '0')}
          </span>
        )}

        {/* Client logo top-right */}
        {project.client?.logoUrl && (
          <div className="absolute top-4 right-4 h-10 w-16 flex items-center justify-end">
            {/* Logos are user-supplied; keep <img> for SVG/url flexibility. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={project.client.logoUrl}
              alt={project.client.name}
              className="max-h-10 max-w-full object-contain opacity-80"
            />
          </div>
        )}

        {/* Role tag bottom-left pill */}
        {project.roleTag && (
          <div className="absolute bottom-4 left-4">
            <span
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-body font-medium"
              style={{
                background: 'rgba(10,10,10,0.7)',
                color: 'var(--text)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid var(--border)',
              }}
            >
              {project.roleTag}
            </span>
          </div>
        )}

        {/* Retainer badge bottom-right */}
        {project.isRetainer && (
          <div className="absolute bottom-4 right-4">
            <span
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-body font-semibold"
              style={{ background: 'var(--accent)', color: 'var(--bg)' }}
            >
              Retainer
            </span>
          </div>
        )}
      </div>

      {/* Title below card */}
      <h3 className="mt-4 font-display font-semibold text-text leading-tight text-lg">
        {project.title}
      </h3>
      {project.client?.name && (
        <p className="mt-1 font-body text-text-muted text-sm">
          {project.client.name}
        </p>
      )}
    </motion.button>
  );
}
