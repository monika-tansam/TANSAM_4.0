import React, { useEffect } from 'react';
import ContactSection from '../components/ContactSection';
import AnimatedSection from '../components/AnimatedSection';

export default function ContactPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ paddingTop: '80px', minHeight: '80vh' }}>
      <AnimatedSection>
        <ContactSection />
      </AnimatedSection>
    </div>
  );
}
