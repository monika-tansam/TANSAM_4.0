import React from 'react';
import ContactSection from '../components/ContactSection';
import AnimatedSection from '../components/AnimatedSection';

export default function ContactPage() {
  return (
    <div style={{ paddingTop: '80px', minHeight: '80vh' }}>
      <AnimatedSection>
        <ContactSection />
      </AnimatedSection>
    </div>
  );
}
