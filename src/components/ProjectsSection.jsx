import React from 'react';
import { motion } from 'framer-motion';

const projectsData = [
  { title: 'Corporate Engagement', image: '/img/Type-11.png' },
  { title: 'AI / Vision-Based', image: '/img/Type-14.png' },
  { title: 'Predictive Engineering', image: '/img/Type-10.png' },
  { title: 'Smart Factory', image: '/img/Type-14.png' },
  { title: 'Asset Performance', image: '/img/Type-13.png' },
  { title: 'AR / VR Research', image: '/img/Type-12.png' },
];

export default function ProjectsSection() {
  return (
    <section className="projects-section" id="projects">
      <div className="projects-header text-center mb-12">
        <h2 className="section-title">
          Our Latest <span className="highlight-gradient">PROJECTS</span>
        </h2>
        <p className="projects-subtitle">Discover our cutting-edge solutions across various industries.</p>
      </div>

      <div className="projects-grid">
        {projectsData.map((project, i) => (
          <motion.div 
            key={i} 
            className="project-card"
            whileHover={{ y: -10, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div className="project-image-wrapper">
              <img src={project.image} alt={project.title} className="project-image" />
              <div className="project-overlay">
                <h3 className="project-title">{project.title}</h3>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
