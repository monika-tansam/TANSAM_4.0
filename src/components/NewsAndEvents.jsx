import React from 'react';
import { motion } from 'framer-motion';
import { Phone, Calendar, ArrowRight } from 'lucide-react';

const newsItems = [
  {
    title: 'Industry 4.0 Workshop',
    desc: 'A hands-on training program covering IoT, AI, and Robotics for MSME engineers and managers.',
    date: 'Oct 12, 2026',
    category: 'Workshop',
    img: '/img/about11.jpg'
  },
  {
    title: 'AR/VR Immersive',
    desc: 'Showcasing TANSAM\'s latest projects in virtual reality training, holographic simulations, and digital factory planning.',
    date: 'Nov 05, 2026',
    category: 'Showcase',
    img: '/img/pro-1.png'
  },
  {
    title: 'Public Health Event',
    desc: 'Honourable Minister Thiru Ma. Subramanian launched a mobile app for field monitoring developed by TANSAM.',
    date: 'Nov 18, 2026',
    category: 'Event',
    img: '/img/Slider5 (1).jpeg'
  },
  {
    title: 'AI & Robotics',
    desc: 'A one-day summit bringing together experts to showcase AI, robotics, and digital twin innovations with live demos.',
    date: 'Dec 02, 2026',
    category: 'Summit',
    img: '/img/robotics.jpeg'
  }
];

export default function NewsAndEvents() {
  return (
    <section className="news-events-section" id="news">
      <div className="news-container">
        <div className="news-header">
          <h2 className="section-title">
            NEWS & <span className="highlight-gradient">EVENTS</span>
          </h2>
          <p className="news-lead">
            At TANSAM, innovation and collaboration shape the future of smart manufacturing in Tamil Nadu. Recent industry partnerships, technology showcases, and advanced training programs highlight our commitment to empowering businesses and individuals with the tools of Industry 4.0.
          </p>
          <p className="news-sublead">
            Discover TANSAM’s latest milestones, partnerships, and industry breakthroughs. From new training programs to smart factory innovations, our updates show how we are shaping the future of manufacturing in Tamil Nadu.
          </p>
          <div className="news-contact-card glass-panel">
            <div className="contact-icon">
              <Phone size={28} color="#00ffff" />
            </div>
            <div>
              <p className="contact-number">+91-98840 35145</p>
              <p className="contact-text">Call us direct 24/7 for a free consultation</p>
            </div>
          </div>
        </div>

        <div className="news-grid">
          {newsItems.map((item, idx) => (
            <motion.div 
              key={idx} 
              className="news-card glass-panel"
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="news-image-wrapper">
                <img src={item.img} alt={item.title} className="news-image" />
              </div>
              <div className="news-content-wrapper">
              <div className="news-card-header">
                <span className="news-category">{item.category}</span>
                <span className="news-date"><Calendar size={14} /> {item.date}</span>
              </div>
              <h3 className="news-card-title">{item.title}</h3>
              <p className="news-card-desc">{item.desc}</p>
              <button className="news-read-more">Read More <ArrowRight size={16} /></button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
