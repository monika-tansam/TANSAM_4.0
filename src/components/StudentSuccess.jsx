import React from 'react';
import { motion } from 'framer-motion';
import { FaUserGraduate, FaLaptopCode, FaAward, FaCalendarCheck } from 'react-icons/fa';

const technologies = [
  "AI & ML", "Data Analytics", "Full-Stack Dev", "AR/VR/XR", 
  "NX CAD", "IoT", "PCB Design", "Automation",
  "Cloud Computing", "Cybersecurity"
];

export default function StudentSuccess() {
  return (
    <section className="student-success-section" id="internship">
      <div className="success-container">
        
        <div className="text-center mb-12">
          <p className="success-kicker">STUDENT SUCCESS STORY</p>
          <h2 className="section-title">
            TANSAM <span className="highlight-gradient">Internship Program</span>
          </h2>
          <p className="success-subtitle">Bridging Academia & Industry</p>
        </div>

        <div className="success-bento-grid">
          
          {/* Main Card 1 */}
          <motion.div className="glass-panel bento-panel p-8 bento-card-large" whileHover={{ y: -5 }}>
            <div className="icon-box mb-4"><FaUserGraduate size={24} /></div>
            <h3 className="content-title mb-4">Empowering the Next Generation</h3>
            <p className="content-text text-muted mb-4">
              TANSAM conducts industry-oriented internship programs in Industry 4.0 technologies. Students from engineering, arts, and science colleges across Tamil Nadu, as well as participants from other states and abroad, have actively taken part.
            </p>
          </motion.div>

          {/* Stats Card */}
          <motion.div className="glass-panel bento-panel p-8 text-center flex flex-col justify-center items-center" whileHover={{ y: -5 }}>
            <h3 className="stats-number highlight-gradient" style={{ fontSize: '4rem', lineHeight: '1' }}>4</h3>
            <p className="font-bold mt-2" style={{ fontSize: '1.2rem' }}>Completed Batches</p>
            <p className="text-muted text-sm mt-2">Outstanding response from students & colleges</p>
          </motion.div>

          {/* Practical Learning Card */}
          <motion.div className="glass-panel bento-panel p-8 bento-card-medium" whileHover={{ y: -5 }}>
            <div className="icon-box mb-4"><FaLaptopCode size={24} /></div>
            <h3 className="content-title mb-4">Practical Learning</h3>
            <p className="content-text text-muted text-sm">
              Hands-on training from experienced industry professionals. Build mini-projects, collaborate, and present your solutions at the end of the program.
            </p>
          </motion.div>

          {/* Technologies Card */}
          <motion.div className="glass-panel bento-panel p-8" whileHover={{ y: -5 }}>
            <h3 className="content-title mb-4">Tech Covered</h3>
            <div className="tech-tags-grid">
              {technologies.map((tech, i) => (
                <span key={i} className="tech-tag">{tech}</span>
              ))}
            </div>
          </motion.div>

          {/* Feedback Card */}
          <motion.div className="glass-panel bento-panel p-8 bento-card-large" whileHover={{ y: -5 }}>
            <div className="icon-box mb-4"><FaAward size={24} /></div>
            <h3 className="content-title mb-4">Feedback & Career Impact</h3>
            <p className="content-text text-muted">
              Overwhelmingly positive response! Participants noted significant enhancement of technical knowledge, improved confidence, and valuable exposure to industry practices. Project presentations strengthen teamwork and communication skills.
            </p>
          </motion.div>

          {/* CTA Card */}
          <motion.div className="glass-panel bento-panel p-8 flex flex-col justify-center items-center text-center" style={{ borderColor: 'var(--primary)', background: 'linear-gradient(135deg, rgba(0, 255, 255, 0.05), rgba(0, 153, 153, 0.1))' }} whileHover={{ y: -5 }}>
            <FaCalendarCheck size={32} className="mb-4 text-cyan" style={{ color: 'var(--primary)' }} />
            <h3 className="content-title mb-2">Join the Next Cohort</h3>
            <p className="content-text text-muted text-sm mb-6">
              Registrations for the upcoming batch are underway. Secure your seat today!
            </p>
            <motion.button 
              className="btn btn-primary w-full"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Register Now
            </motion.button>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
