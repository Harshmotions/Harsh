'use client';

import { useState } from 'react';
import FeaturedStrip from '@/components/FeaturedStrip';
import ProjectModal from '@/components/ProjectModal';
import type { Project } from '@/lib/types';

interface HomeFeaturedClientProps {
  projects: Project[];
  whatsappNumber?: string;
}

export default function HomeFeaturedClient({ projects, whatsappNumber }: HomeFeaturedClientProps) {
  const reels = projects.filter((p) => p.type === 'reel').slice(0, 4);
  const landscape = projects.filter((p) => p.type === 'landscape').slice(0, 4);
  const shown = [...reels, ...landscape];

  const [selected, setSelected] = useState<number | null>(null);

  return (
    <>
      <FeaturedStrip
        reels={reels}
        landscape={landscape}
        onCardClick={(p) => setSelected(shown.indexOf(p))}
      />
      <ProjectModal
        projects={shown}
        index={selected}
        onIndexChange={setSelected}
        whatsappNumber={whatsappNumber}
      />
    </>
  );
}
