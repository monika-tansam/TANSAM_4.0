import React from 'react';
import LabsGrid from '../components/LabsGrid';
import AnimatedSection from '../components/AnimatedSection';

export default function LabsPage({ theme }) {
  return (
    <div style={{ paddingTop: '80px', minHeight: '80vh' }}>
      <AnimatedSection>
        <div style={{ textAlign: 'center', marginBottom: '40px', padding: '0 20px' }}>
          <h1 style={{ fontSize: '3rem', color: 'var(--text-color)', marginBottom: '20px' }}>
            Our <span className="highlight-gradient">Innovation Labs</span>
          </h1>
          <p style={{ fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto', opacity: 0.9 }}>
            Explore the diverse range of specialized labs at TANSAM, powered by Siemens technologies, designed to upskill and empower the next generation of engineers and innovators.
          </p>
        </div>
      </AnimatedSection>
      <AnimatedSection><LabsGrid theme={theme} /></AnimatedSection>
    </div>
  );
}
