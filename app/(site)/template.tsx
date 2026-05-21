'use client';

import { motion } from 'framer-motion';

/**
 * template.tsx re-mounts on every route change (unlike layout.tsx which persists).
 * This gives us a clean per-page fade+slide entrance on every navigation.
 */
export default function SiteTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
