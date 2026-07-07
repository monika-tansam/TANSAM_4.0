import React from 'react';
import HeroSection from '../components/HeroSection';
import AboutSection from '../components/AboutSection';
import ServicesSummary from '../components/ServicesSummary';
import ProjectsSection from '../components/ProjectsSection';
import ClientsSection from '../components/ClientsSection';
import AnimatedSection from '../components/AnimatedSection';

export default function HomePage({ theme }) {
  return (
    <>
      <HeroSection theme={theme} />
      <AnimatedSection><AboutSection theme={theme} /></AnimatedSection>
      <AnimatedSection><ServicesSummary /></AnimatedSection>
      <AnimatedSection><ProjectsSection /></AnimatedSection>
      <AnimatedSection><ClientsSection /></AnimatedSection>
    </>
  );
}
