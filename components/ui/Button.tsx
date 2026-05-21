'use client';

import { forwardRef } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

type Variant = 'primary' | 'ghost';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  variant?: Variant;
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-body font-semibold text-sm tracking-wide focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent px-7 py-3.5';

/* Primary — amber gradient with real depth */
const primaryStyle: React.CSSProperties = {
  background:
    'linear-gradient(160deg, #E8C060 0%, #D4A84B 45%, #B8881A 100%)',
  boxShadow: [
    '0 0 18px rgba(212,168,75,0.45)',
    '0 4px 14px rgba(0,0,0,0.40)',
    'inset 0 1px 0 rgba(255,255,255,0.22)',
    'inset 0 -1px 0 rgba(0,0,0,0.18)',
  ].join(', '),
  color: '#0A0A0A',
  transition: 'box-shadow 0.25s ease, filter 0.2s ease',
};

const primaryHover = {
  boxShadow: [
    '0 0 32px rgba(212,168,75,0.65)',
    '0 8px 22px rgba(0,0,0,0.45)',
    'inset 0 1px 0 rgba(255,255,255,0.28)',
    'inset 0 -1px 0 rgba(0,0,0,0.18)',
  ].join(', '),
  filter: 'brightness(1.08)',
};

/* Ghost — amber border + subtle glow */
const ghostStyle: React.CSSProperties = {
  background: 'rgba(212,168,75,0.04)',
  border: '1px solid rgba(212,168,75,0.35)',
  boxShadow: '0 0 10px rgba(212,168,75,0.08)',
  color: 'var(--text)',
  transition: 'box-shadow 0.25s ease, background 0.25s ease, border-color 0.25s ease',
};

const ghostHover = {
  background: 'rgba(212,168,75,0.09)',
  borderColor: 'rgba(212,168,75,0.65)',
  boxShadow: '0 0 20px rgba(212,168,75,0.22)',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', className = '', children, ...props }, ref) => {
    const style    = variant === 'primary' ? primaryStyle : ghostStyle;
    const hoverAnim = variant === 'primary' ? primaryHover : ghostHover;

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.96 }}
        whileHover={hoverAnim}
        className={`${base} ${className}`}
        style={style}
        {...props}
      >
        {children}
      </motion.button>
    );
  },
);

Button.displayName = 'Button';
export default Button;
