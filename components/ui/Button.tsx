'use client';

import { forwardRef } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

type Variant = 'primary' | 'ghost';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  variant?: Variant;
  children?: React.ReactNode;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Button architecture (adapted from layered glass button pattern):

   <motion.button>                  ← outer gradient "border" shell
     <div aria-hidden />            ← top-right catch-light glow
     <div aria-hidden />            ← bottom-left colored blob
     <div>                          ← dark inner content surface
       <div aria-hidden />          ← inner bottom-left tint layer
       <span>{children}</span>      ← text / icon content (always z-10)
     </div>
   </motion.button>

   Primary: amber blob, warm-dark inner, warm-white catch-light
   Ghost:   subdued amber, near-transparent inner, text stays bright
───────────────────────────────────────────────────────────────────────────── */

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', className = '', children, ...props }, ref) => {
    const isPrimary = variant === 'primary';

    /* ── Outer shell — the gradient "border" ── */
    const outerStyle: React.CSSProperties = {
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: 600,
      letterSpacing: '0.03em',
      borderRadius: 14,
      border: 'none',
      padding: 2,
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'stretch',
      overflow: 'hidden',
      /* Dark fallback — spinning div provides the animated border color */
      background: isPrimary ? 'rgba(10,8,4,0.97)' : 'rgba(14,11,5,0.96)',
      boxShadow: isPrimary
        ? [
            '0 4px 16px rgba(0,0,0,0.50)',
            '0 1px 0 rgba(255,255,255,0.06)',
            '0 0 0 1px rgba(212,168,75,0.10)',
          ].join(', ')
        : [
            '0 4px 14px rgba(0,0,0,0.40)',
            '0 0 0 1px rgba(212,168,75,0.08)',
          ].join(', '),
      transition: 'filter 0.2s ease',
    };

    /* ── Top-right catch-light (replaces ::after) ── */
    const catchLightStyle: React.CSSProperties = {
      position: 'absolute',
      width: '62%',
      height: '58%',
      borderRadius: 120,
      top: 0,
      right: 0,
      boxShadow: isPrimary
        ? '0 0 18px rgba(255,248,220,0.28)'
        : '0 0 14px rgba(212,168,75,0.20)',
      pointerEvents: 'none',
      zIndex: 0,
    };

    /* ── Bottom-left blob ── */
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
        ? 'radial-gradient(circle 55px at 0% 100%, #E8C060, rgba(160,96,0,0.50), transparent)'
        : 'radial-gradient(circle 45px at 0% 100%, rgba(212,168,75,0.45), rgba(140,90,0,0.22), transparent)',
      boxShadow: isPrimary
        ? '-8px 8px 28px rgba(212,168,75,0.24)'
        : '-6px 6px 20px rgba(212,168,75,0.12)',
    };

    /* ── Inner dark content surface ── */
    const innerStyle: React.CSSProperties = {
      padding: isPrimary ? '13px 28px' : '12px 26px',
      borderRadius: 12,
      color: isPrimary
        ? 'rgba(255,248,215,0.96)'
        : 'rgba(240,237,232,0.90)',
      zIndex: 3,
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      width: '100%',
      background: isPrimary
        ? /* warm dark — amber-tinted top-right, deep bottom */
          'radial-gradient(circle 85px at 82% -45%, #2C2008, #0A0805)'
        : 'radial-gradient(circle 85px at 82% -45%, #1A1309, #080704)',
      whiteSpace: 'nowrap' as const,
    };

    /* ── Inner bottom-left ambient tint (replaces .inner::before) ── */
    const innerTintStyle: React.CSSProperties = {
      position: 'absolute',
      inset: 0,
      borderRadius: 12,
      pointerEvents: 'none',
      background: isPrimary
        ? 'radial-gradient(circle 60px at 0% 100%, rgba(232,192,96,0.20), rgba(184,136,26,0.10), transparent)'
        : 'radial-gradient(circle 50px at 0% 100%, rgba(212,168,75,0.14), rgba(184,136,26,0.07), transparent)',
      zIndex: 0,
    };

    /* ── Hover animation on outer shell ── */
    const hoverAnim = isPrimary
      ? {
          filter: 'brightness(1.10)',
          boxShadow: [
            '0 6px 22px rgba(0,0,0,0.55)',
            '0 1px 0 rgba(255,255,255,0.08)',
            '0 0 0 1px rgba(212,168,75,0.18)',
            '0 0 32px rgba(212,168,75,0.22)',
          ].join(', '),
        }
      : {
          filter: 'brightness(1.12)',
          boxShadow: [
            '0 4px 16px rgba(0,0,0,0.45)',
            '0 0 0 1px rgba(212,168,75,0.22)',
            '0 0 22px rgba(212,168,75,0.18)',
          ].join(', '),
        };

    return (
      <motion.button
        ref={ref}
        style={outerStyle}
        whileHover={hoverAnim}
        whileTap={{ scale: 0.97 }}
        className={`font-body focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${className}`}
        {...props}
      >
        {/* Spinning border — conic-gradient rotates to create animated border glow */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            width: '250%',
            height: '250%',
            top: '50%',
            left: '50%',
            zIndex: 0,
            animation: 'btn-border-spin 4s linear infinite',
            background: isPrimary
              ? 'conic-gradient(from 0deg, rgba(10,8,4,0.97) 0%, rgba(10,8,4,0.97) 50%, rgba(212,168,75,0.60) 65%, rgba(255,248,220,0.88) 75%, rgba(212,168,75,0.60) 85%, rgba(10,8,4,0.97) 95%)'
              : 'conic-gradient(from 0deg, rgba(14,11,5,0.96) 0%, rgba(14,11,5,0.96) 50%, rgba(212,168,75,0.35) 65%, rgba(212,168,75,0.62) 75%, rgba(212,168,75,0.35) 85%, rgba(14,11,5,0.96) 95%)',
          }}
        />

        {/* Catch-light: top-right glow */}
        <div aria-hidden="true" style={catchLightStyle} />

        {/* Blob: bottom-left amber bloom */}
        <div aria-hidden="true" style={blobStyle} />

        {/* Inner content surface */}
        <div style={innerStyle}>
          {/* Ambient bottom-left tint */}
          <div aria-hidden="true" style={innerTintStyle} />
          {/* Actual content — always on top */}
          <span style={{
            position: 'relative',
            zIndex: 4,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}>{children}</span>
        </div>
      </motion.button>
    );
  },
);

Button.displayName = 'Button';
export default Button;
