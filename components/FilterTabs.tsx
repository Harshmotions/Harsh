'use client';

import { motion } from 'framer-motion';

export interface FilterOption {
  value: string;
  label: string;
}

interface FilterTabsProps {
  options: FilterOption[];
  active: string;
  onChange: (value: string) => void;
}

export default function FilterTabs({
  options,
  active,
  onChange,
}: FilterTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Filter projects"
      className="flex flex-wrap gap-x-6 gap-y-2 mb-10"
    >
      {options.map((opt) => {
        const isActive = opt.value === active;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(opt.value)}
            className="relative font-body text-sm py-2 px-1 transition-colors"
            style={{
              color: isActive ? 'var(--text)' : 'var(--text-muted)',
            }}
          >
            {opt.label}
            {isActive && (
              <motion.span
                layoutId="filter-underline"
                className="absolute left-0 right-0 -bottom-px h-[2px]"
                style={{ background: 'var(--accent)' }}
                transition={{
                  type: 'spring',
                  stiffness: 380,
                  damping: 30,
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
