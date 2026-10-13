import React from 'react';
import { Link } from 'react-router-dom';
import { Lightbulb, Wrench, Monitor, Cuboid, GraduationCap } from 'lucide-react';

export default function ServicesSummary() {
  const services = [
    { icon: <Cuboid size={24} />, text: "Industry Solutions from 7 specialized labs" },
    { icon: <Wrench size={24} />, text: "Practical skill development aligned with industrial needs" },
    { icon: <Monitor size={24} />, text: "Access to modern software and hardware" },
    { icon: <Lightbulb size={24} />, text: "Support in turning ideas into functional products" },
    { icon: <GraduationCap size={24} />, text: "Hands-on training and real-world use cases" },
  ];

  return (
    <div className="services-summary-container" id="skilling">
      {/* <Link className="services-skilling-link" to="/skilling">Explore TANSAM skilling programmes →</Link> */}
      <div className="services-summary-grid">
        {services.map((service, index) => (
          <div key={index} className="service-card">
            <div className="service-icon">{service.icon}</div>
            <p className="service-text">{service.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
