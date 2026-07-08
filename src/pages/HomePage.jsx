import React, { useEffect } from 'react';
import HeroSection from '../components/HeroSection';
import AboutSection from '../components/AboutSection';
import ServicesSummary from '../components/ServicesSummary';
import ClientsSection from '../components/ClientsSection';
import AnimatedSection from '../components/AnimatedSection';

export default function HomePage({ theme }) {
  useEffect(() => {
    // Only scroll if there is no hash
    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }
  }, []);

  return (
    <>
      <HeroSection theme={theme} />
      <AnimatedSection><AboutSection theme={theme} /></AnimatedSection>
      <AnimatedSection><ServicesSummary /></AnimatedSection>
      <AnimatedSection><ClientsSection /></AnimatedSection>
    </>
  );
}
