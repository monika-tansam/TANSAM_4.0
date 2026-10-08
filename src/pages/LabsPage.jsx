import React from 'react';
import LabsGrid from '../components/LabsGrid';
import ProjectsSection from '../components/ProjectsSection';
import AnimatedSection from '../components/AnimatedSection';

export default function LabsPage({ theme }) {
  return (
    <div style={{ minHeight: '80vh' }}>
      <AnimatedSection>
        <LabsGrid theme={theme} />
      </AnimatedSection>
      <AnimatedSection>
        <ProjectsSection />
      </AnimatedSection>
    </div>
  );
}
