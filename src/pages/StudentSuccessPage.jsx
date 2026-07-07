import React, { useEffect } from 'react';
import StudentSuccess from '../components/StudentSuccess';
import AnimatedSection from '../components/AnimatedSection';

export default function StudentSuccessPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ paddingTop: '80px', minHeight: '80vh' }}>
      <AnimatedSection>
        <div style={{ textAlign: 'center', marginBottom: '20px', padding: '0 20px' }}>
          <h1 style={{ fontSize: '3rem', color: 'var(--text-color)', marginBottom: '20px' }}>
            Internships & <span className="highlight-gradient">Success Stories</span>
          </h1>
          <p style={{ fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto', opacity: 0.9 }}>
            Discover how TANSAM has transformed the careers of students through hands-on training, expert mentorship, and industry-recognized certifications.
          </p>
        </div>
      </AnimatedSection>
      <AnimatedSection>
        <StudentSuccess />
      </AnimatedSection>
    </div>
  );
}
