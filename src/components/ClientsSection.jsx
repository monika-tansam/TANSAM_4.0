import React, { useState, useEffect } from 'react';
import { Reorder } from 'framer-motion';

const defaultIndustryClients = [
  "/img/patners/jsw.png", "/img/patners/renault.png", "/img/patners/renalutnissan.png",
  "/img/patners/caterpiller.png", "/img/patners/flex2.png", "/img/patners/ortholite.png",
  "/img/patners/Highways_dept.png", "/img/patners/INDUSTY2.png"
];

const defaultAcademicClients = [
  "/img/patners/INDUSTRY1.png", "/img/patners/INDUSTRY3.png", "/img/patners/INDUSTRY4.png", "/img/patners/INDUSTRY_TOP.png",
  "/img/patners/Annauniversity.jpeg", "/img/patners/SVCE.jpeg", "/img/patners/Ramachandratech.jpeg",
  "/img/patners/REC.jpeg", "/img/patners/NICHE.jpeg", "/img/patners/KCG.jpeg",
  "/img/patners/Josepsch.jpeg", "/img/patners/JPCollege.jpeg", "/img/patners/Institution.jpeg",
  "/img/patners/IASC.jpeg", "/img/patners/Holycros.jpeg", "/img/patners/Faith.jpeg", "/img/patners/Easwari.jpeg", "/img/patners/AVIT.jpeg"
];

export default function ClientsSection() {
  const [industryClients, setIndustryClients] = useState([]);
  const [academicClients, setAcademicClients] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedIndustry = localStorage.getItem('tansam_industry_clients');
    const savedAcademic = localStorage.getItem('tansam_academic_clients');

    if (savedIndustry) {
      setIndustryClients(JSON.parse(savedIndustry));
    } else {
      setIndustryClients(defaultIndustryClients);
    }

    if (savedAcademic) {
      setAcademicClients(JSON.parse(savedAcademic));
    } else {
      setAcademicClients(defaultAcademicClients);
    }
    
    setIsLoaded(true);
  }, []);

  // Save to localStorage when changed
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('tansam_industry_clients', JSON.stringify(industryClients));
      localStorage.setItem('tansam_academic_clients', JSON.stringify(academicClients));
    }
  }, [industryClients, academicClients, isLoaded]);

  // Create duplicated arrays for infinite scroll effect
  const displayIndustry = [...industryClients.map(c => `${c}|1`), ...industryClients.map(c => `${c}|2`)];
  const displayAcademic = [...academicClients.map(c => `${c}|1`), ...academicClients.map(c => `${c}|2`)];

  const handleIndustryReorder = (newOrder) => {
    const newBase = Array.from(new Set(newOrder.map(id => id.split('|')[0])));
    setIndustryClients(newBase);
  };

  const handleAcademicReorder = (newOrder) => {
    const newBase = Array.from(new Set(newOrder.map(id => id.split('|')[0])));
    setAcademicClients(newBase);
  };

  const industryDuration = (industryClients.length) * 4; 
  const academicDuration = (academicClients.length) * 4;

  if (!isLoaded) return null;

  return (
    <section className="clients-section" id="clients">
      
      {/* Industry Clients */}
      <div className="client-block mb-12">
        <div className="text-center mb-8">
          <h2 className="section-title">
            INDUSTRY <span className="highlight-gradient">CLIENTS</span>
          </h2>
          <p className="clients-lead">
            TANSAM partners with leading manufacturing enterprises, MSMEs, and startups to accelerate digital transformation. Drag and drop the logos below to reorder them!
          </p>
        </div>
        
        <div className="marquee-container" style={{ paddingBottom: '30px', paddingTop: '30px' }}>
          <Reorder.Group 
            axis="x" 
            values={displayIndustry} 
            onReorder={handleIndustryReorder} 
            className="marquee-track"
            style={{ listStyleType: 'none', margin: 0, padding: '40px 20px', cursor: 'grab' }}
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, ease: "linear", duration: industryDuration }}
          >
            {displayIndustry.map((client) => (
              <Reorder.Item 
                key={client} 
                value={client} 
                className="client-logo-box glass-panel"
                whileDrag={{ scale: 1.1, cursor: 'grabbing', zIndex: 50, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
              >
                <img src={client.split('|')[0]} alt="Industry Client" className="client-logo-img" draggable="false" />
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>
      </div>

      {/* Academic Clients */}
      <div className="client-block">
        <div className="text-center mb-8">
          <h2 className="section-title">
            ACADEMIC <span className="highlight-gradient">CLIENTS</span>
          </h2>
          <p className="clients-lead">
            We collaborate with universities, research institutions, and faculty to advance Industry 4.0 education. Organize your favorite institutions by dragging them.
          </p>
        </div>

        <div className="marquee-container" style={{ paddingBottom: '30px', paddingTop: '30px' }}>
          <Reorder.Group 
            axis="x" 
            values={displayAcademic} 
            onReorder={handleAcademicReorder} 
            className="marquee-track"
            style={{ listStyleType: 'none', margin: 0, padding: '40px 20px', cursor: 'grab' }}
            animate={{ x: ["-50%", "0%"] }}
            transition={{ repeat: Infinity, ease: "linear", duration: academicDuration }}
          >
            {displayAcademic.map((client) => (
              <Reorder.Item 
                key={client} 
                value={client} 
                className="client-logo-box glass-panel"
                whileDrag={{ scale: 1.1, cursor: 'grabbing', zIndex: 50, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
              >
                <img src={client.split('|')[0]} alt="Academic Client" className="client-logo-img" draggable="false" />
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>
      </div>

    </section>
  );
}
