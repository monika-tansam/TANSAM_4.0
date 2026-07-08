import React, { useEffect } from 'react';
import LabsGrid from '../components/LabsGrid';
import ProjectsSection from '../components/ProjectsSection';
import AnimatedSection from '../components/AnimatedSection';

export default function LabsPage({ theme }) {
  useEffect(() => {
    // Only scroll if there is no hash
    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }
  }, []);

  return (
    <div style={{ paddingTop: '80px', minHeight: '80vh' }}>
      <AnimatedSection>
        <LabsGrid theme={theme} />
      </AnimatedSection>
      <AnimatedSection>
        <ProjectsSection />
      </AnimatedSection>
    </div>
  );
}
