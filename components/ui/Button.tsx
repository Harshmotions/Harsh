'use client';

import { forwardRef } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

type Variant = 'primary' | 'ghost';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  variant?: Variant;
  children?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', className = '', children, ...props }, ref) => {
    const isPrimary = variant === 'primary';

    const outerStyle: React.CSSProperties = {
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: 600,
      letterSpacing: '0.03em',
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'stretch',
      borderRadius: 9999,
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: isPrimary
        ? 'rgba(79,142,247,0.55)'
        : 'rgba(79,142,247,0.28)',
      boxShadow: isPrimary
        ? [
            '0 4px 16px rgba(0,0,0,0.55)',
            '0 0 18px rgba(79,142,247,0.14)',
            'inset 0 1px 0 rgba(255,255,255,0.06)',
          ].join(', ')
        : [
            '0 4px 14px rgba(0,0,0,0.45)',
            '0 0 10px rgba(79,142,247,0.07)',
          ].join(', '),
    };

    const innerStyle: React.CSSProperties = {
      padding: isPrimary ? '13px 28px' : '12px 26px',
      borderRadius: 9999,
      overflow: 'hidden',
      color: isPrimary
        ? 'rgba(224,236,255,0.96)'
        : 'rgba(240,237,232,0.90)',
      zIndex: 3,
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      width: '100%',
      background: isPrimary
        ? 'radial-gradient(circle 85px at 82% -45%, #0A1628, #060B14)'
        : 'radial-gradient(circle 85px at 82% -45%, #091220, #060B14)',
      whiteSpace: 'nowrap' as const,
    };

    const catchLightStyle: React.CSSProperties = {
      position: 'absolute',
      width: '62%',
      height: '58%',
      borderRadius: 120,
      top: 0,
      right: 0,
      boxShadow: isPrimary
        ? '0 0 18px rgba(147,197,253,0.22)'
        : '0 0 12px rgba(79,142,247,0.16)',
      pointerEvents: 'none',
      zIndex: 0,
    };

    const blobStyle: React.CSSProperties = {
      position: 'absolute',
      width: 68,
      height: '100%',
      borderRadius: 14,
      bottom: 0,
      left: 0,
      pointerEvents: 'none',
      zIndex: 1,
      background: isPrimary
        ? 'radial-gradient(circle 55px at 0% 100%, #3B6FCC, rgba(24,56,128,0.50), transparent)'
        : 'radial-gradient(circle 45px at 0% 100%, rgba(79,142,247,0.45), rgba(30,80,180,0.22), transparent)',
      boxShadow: isPrimary
        ? '-8px 8px 28px rgba(79,142,247,0.22)'
        : '-6px 6px 20px rgba(79,142,247,0.10)',
    };

    const innerTintStyle: React.CSSProperties = {
      position: 'absolute',
      inset: 0,
      borderRadius: 12,
      pointerEvents: 'none',
      background: isPrimary
        ? 'radial-gradient(circle 60px at 0% 100%, rgba(79,142,247,0.18), rgba(37,78,165,0.08), transparent)'
        : 'radial-gradient(circle 50px at 0% 100%, rgba(79,142,247,0.12), rgba(37,78,165,0.06), transparent)',
      zIndex: 0,
    };

    const hoverAnim = isPrimary
      ? {
          borderColor: 'rgba(79,142,247,0.80)',
          boxShadow: [
            '0 6px 22px rgba(0,0,0,0.60)',
            '0 0 28px rgba(79,142,247,0.32)',
            '0 0 8px rgba(79,142,247,0.20)',
            'inset 0 1px 0 rgba(255,255,255,0.08)',
          ].join(', '),
          filter: 'brightness(1.10)',
        }
      : {
          borderColor: 'rgba(79,142,247,0.50)',
          boxShadow: [
            '0 4px 16px rgba(0,0,0,0.50)',
            '0 0 20px rgba(79,142,247,0.20)',
          ].join(', '),
          filter: 'brightness(1.12)',
        };

    return (
      <motion.button
        ref={ref}
        style={outerStyle}
        whileHover={hoverAnim}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className={`font-body focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${className}`}
        {...props}
      >
        <div style={innerStyle}>
          <div aria-hidden="true" style={catchLightStyle} />
          <div aria-hidden="true" style={blobStyle} />
          <div aria-hidden="true" style={innerTintStyle} />
          <span style={{
            position: 'relative',
            zIndex: 4,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}>
            {children}
          </span>
        </div>
      </motion.button>
    );
  },
);

Button.displayName = 'Button';
export default Button;
