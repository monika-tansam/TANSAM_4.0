import React, { useEffect } from 'react';
import NewsAndEvents from '../components/NewsAndEvents';
import TestimonialsAndNewsletter from '../components/TestimonialsAndNewsletter';
import AnimatedSection from '../components/AnimatedSection';

export default function NewsPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ paddingTop: '80px', minHeight: '80vh' }}>
      <AnimatedSection>
        <div style={{ textAlign: 'center', marginBottom: '20px', padding: '0 20px' }}>
          <h1 style={{ fontSize: '3rem', color: 'var(--text-color)', marginBottom: '20px' }}>
            News & <span className="highlight-gradient">Events</span>
          </h1>
          <p style={{ fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto', opacity: 0.9 }}>
            Stay up-to-date with the latest happenings, announcements, and newsletters from TANSAM.
          </p>
        </div>
      </AnimatedSection>
      
      <AnimatedSection>
        <NewsAndEvents />
      </AnimatedSection>

      <AnimatedSection>
        <TestimonialsAndNewsletter />
      </AnimatedSection>
    </div>
  );
}
