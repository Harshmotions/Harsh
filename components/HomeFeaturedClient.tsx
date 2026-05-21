'use client';

import { useState } from 'react';
import FeaturedStrip from '@/components/FeaturedStrip';
import ProjectModal from '@/components/ProjectModal';
import type { Project } from '@/lib/types';

interface HomeFeaturedClientProps {
  projects: Project[];
}

export default function HomeFeaturedClient({
  projects,
}: HomeFeaturedClientProps) {
  const [selected, setSelected] = useState<Project | null>(null);

  return (
    <>
      <FeaturedStrip projects={projects} onCardClick={setSelected} />
      <ProjectModal project={selected} onClose={() => setSelected(null)} />
    </>
  );
}
