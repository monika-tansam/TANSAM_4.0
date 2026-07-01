import React from 'react';
import { motion } from 'framer-motion';

const industryClients = [
  "/img/patners/jsw.png", "/img/patners/renault.png", "/img/patners/renalutnissan.png",
  "/img/patners/caterpiller.png", "/img/patners/flex2.png", "/img/patners/ortholite.png",
  "/img/patners/Highways_dept.png", "/img/patners/INDUSTY2.png",
  // Repeat for smooth infinite scroll
  "/img/patners/jsw.png", "/img/patners/renault.png", "/img/patners/renalutnissan.png",
  "/img/patners/caterpiller.png", "/img/patners/flex2.png", "/img/patners/ortholite.png",
  "/img/patners/Highways_dept.png", "/img/patners/INDUSTY2.png"
];

const academicClients = [
  "/img/patners/INDUSTRY1.png", "/img/patners/INDUSTRY3.png", "/img/patners/INDUSTRY4.png", "/img/patners/INDUSTRY_TOP.png",
  "/img/patners/Annauniversity.jpeg", "/img/patners/SVCE.jpeg", "/img/patners/Ramachandratech.jpeg",
  "/img/patners/REC.jpeg", "/img/patners/NICHE.jpeg", "/img/patners/KCG.jpeg",
  "/img/patners/Josepsch.jpeg", "/img/patners/JPCollege.jpeg", "/img/patners/Institution.jpeg",
  "/img/patners/IASC.jpeg", "/img/patners/Holycros.jpeg", "/img/patners/Faith.jpeg", "/img/patners/Easwari.jpeg", "/img/patners/AVIT.jpeg",
  // Repeat for smooth infinite scroll
  "/img/patners/INDUSTRY1.png", "/img/patners/INDUSTRY3.png", "/img/patners/INDUSTRY4.png", "/img/patners/INDUSTRY_TOP.png",
  "/img/patners/Annauniversity.jpeg", "/img/patners/SVCE.jpeg", "/img/patners/Ramachandratech.jpeg",
  "/img/patners/REC.jpeg", "/img/patners/NICHE.jpeg", "/img/patners/KCG.jpeg",
  "/img/patners/Josepsch.jpeg", "/img/patners/JPCollege.jpeg", "/img/patners/Institution.jpeg",
  "/img/patners/IASC.jpeg", "/img/patners/Holycros.jpeg", "/img/patners/Faith.jpeg", "/img/patners/Easwari.jpeg", "/img/patners/AVIT.jpeg"
];

// Calculate duration based on the number of items so the scroll speed is identical.
// 4 seconds per unique item
const industryDuration = (industryClients.length / 2) * 4; 
const academicDuration = (academicClients.length / 2) * 4;

export default function ClientsSection() {
  return (
    <section className="clients-section" id="clients">
      
      {/* Industry Clients */}
      <div className="client-block mb-12">
        <div className="text-center mb-8">
          <h2 className="section-title">
            INDUSTRY <span className="highlight-gradient">CLIENTS</span>
          </h2>
          <p className="clients-lead">
            TANSAM partners with leading manufacturing enterprises, MSMEs, and startups to accelerate digital transformation. Our clients leverage IoT, AR/VR, AI, and digital twin technologies to build smarter factories and reduce time-to-market.
          </p>
        </div>
        
        <div className="marquee-container">
          <motion.div 
            className="marquee-track"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, ease: "linear", duration: industryDuration }}
          >
            {industryClients.map((client, i) => (
              <div key={i} className="client-logo-box glass-panel">
                <img src={client} alt="Industry Client" className="client-logo-img" />
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Academic Clients */}
      <div className="client-block">
        <div className="text-center mb-8">
          <h2 className="section-title">
            ACADEMIC <span className="highlight-gradient">CLIENTS</span>
          </h2>
          <p className="clients-lead">
            We collaborate with universities, research institutions, and faculty to advance Industry 4.0 education. Through courses, certifications, and joint research, academic partners gain hands-on exposure to smart manufacturing technologies and prepare students for future-ready careers.
          </p>
        </div>

        <div className="marquee-container">
          <motion.div 
            className="marquee-track"
            animate={{ x: ["-50%", "0%"] }}
            transition={{ repeat: Infinity, ease: "linear", duration: academicDuration }}
          >
            {academicClients.map((client, i) => (
              <div key={i} className="client-logo-box glass-panel">
                <img src={client} alt="Academic Client" className="client-logo-img" />
              </div>
            ))}
          </motion.div>
        </div>
      </div>

    </section>
  );
}
