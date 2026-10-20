'use client';

import { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import WorkCard from '@/components/work/WorkCard';
import WorkModal from '@/components/work/WorkModal';
import { EASE_SETTLE, useReplayInView } from '@/components/motion/useReplayInView';
import type { WorkItem } from '@/lib/work';

interface WorkGridProps {
  items: WorkItem[];
  whatsappNumber?: string;
  /** How many cards start loading their poster eagerly (the ones in the first view). */
  eagerCount?: number;
}

// Cards open like a curtain from the bottom edge. The clip lives on an inner element:
// Chrome treats a fully clipped element as not visible, so observing it directly would
// never trigger the reveal. The final inset is negative so hover lift and shadows never clip.
const curtain = (i: number): Variants => ({
  hidden: { clipPath: 'inset(100% -20% -20% -20%)', y: 60 },
  show: {
    clipPath: 'inset(-20% -20% -20% -20%)',
    y: 0,
    transition: { duration: 1.4, delay: (i % 2) * 0.12, ease: EASE_SETTLE },
  },
});

function Curtain({ i, children }: { i: number; children: React.ReactNode }) {
  const [ref, inView] = useReplayInView<HTMLDivElement>();
  return (
    <div ref={ref}>
      <motion.div variants={curtain(i)} initial="hidden" animate={inView ? 'show' : 'hidden'}>
        {children}
      </motion.div>
    </div>
  );
}

/** Every piece in one collection: 4:3 previews in two columns (one on phones). */
export default function WorkGrid({ items, whatsappNumber, eagerCount = 2 }: WorkGridProps) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 lg:gap-x-8 gap-y-12 md:gap-y-16">
        {items.map((item, i) => (
          <Curtain key={item.slug} i={i}>
            <WorkCard item={item} index={i} eager={i < eagerCount} onOpen={() => setOpen(i)} />
          </Curtain>
        ))}
      </div>
      <WorkModal items={items} index={open} onIndexChange={setOpen} whatsappNumber={whatsappNumber} />
    </>
  );
}
