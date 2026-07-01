import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';

const VIDEO_IDS = [
  "lUZMzLErt9Q", "DjvjZrjVe1o", "6fOJCAKgLxA", 
  "kuad2gShVGs", "2Lp2RHyMwsY", "xLI6-iw9pps", 
  "_d64qeG9oPs", "lwmlw79uss8", "kluNmcZ1I3U"
];

export default function TestimonialsAndNewsletter() {
  const [shuffledVideos, setShuffledVideos] = useState([]);
  const [width, setWidth] = useState(0);
  const carouselRef = useRef();

  // Shuffle videos on component mount
  useEffect(() => {
    const shuffled = [...VIDEO_IDS].sort(() => Math.random() - 0.5);
    setShuffledVideos(shuffled);
  }, []);

  // Calculate draggable width constraint based on content size
  useEffect(() => {
    if (carouselRef.current) {
      setWidth(carouselRef.current.scrollWidth - carouselRef.current.offsetWidth);
    }
  }, [shuffledVideos]);

  return (
    <>
      <section className="testimonials-section" id="testimonials" style={{ overflow: 'hidden' }}>
        <div className="text-center mb-12">
          <h2 className="section-title">
            STUDENT <span className="highlight-gradient">TESTIMONIALS</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '10px' }}>
            Drag to explore stories from our interns and partners.
          </p>
        </div>
        
        {/* Draggable Carousel Container */}
        <motion.div 
          ref={carouselRef} 
          className="carousel-container" 
          style={{ cursor: 'grab', overflow: 'hidden', padding: '20px 0' }}
          whileTap={{ cursor: 'grabbing' }}
        >
          <motion.div 
            drag="x" 
            dragConstraints={{ right: 0, left: -width - 40 }} // -40 for extra padding
            style={{ display: 'flex', gap: '30px', paddingLeft: '5vw' }}
          >
            {shuffledVideos.map((id, i) => (
              <motion.div 
                key={id} 
                className="testimonial-card glass-panel"
                style={{ 
                  minWidth: '315px', 
                  height: '560px', 
                  padding: '10px', 
                  borderRadius: '24px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  boxShadow: '0 10px 30px rgba(0, 255, 255, 0.1)',
                  border: '1px solid rgba(0, 255, 255, 0.2)'
                }}
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: '0 15px 40px rgba(0, 255, 255, 0.3)',
                  borderColor: 'rgba(0, 255, 255, 0.6)'
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div style={{ width: '100%', height: '100%', borderRadius: '16px', overflow: 'hidden' }}>
                  <iframe 
                    width="100%" 
                    height="100%" 
                    src={`https://www.youtube.com/embed/${id}`}
                    title={`Student Testimonial ${i + 1}`} 
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                    style={{ pointerEvents: 'auto' }}
                  ></iframe>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      <section className="newsletter-section" id="newsletter">
        <div className="newsletter-container glass-panel text-center">
          <h2 className="newsletter-title mb-2">SUBSCRIBE THE NEWSLETTER</h2>
          <p className="newsletter-text mb-8">Stay updated with the latest news, events, and Entrepreneurship Development!</p>
          
          <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              placeholder="Enter your email address..." 
              className="newsletter-input"
              required
            />
            <motion.button 
              type="submit" 
              className="btn btn-primary flex items-center justify-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Subscribe <Send size={18} />
            </motion.button>
          </form>
        </div>
      </section>
    </>
  );
}
