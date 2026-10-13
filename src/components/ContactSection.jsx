import React from 'react';
import { motion } from 'framer-motion';

function ContactSection() {
  return (
    <section className="contact-section" id="contact" style={{ padding: '4rem 2rem', backgroundColor: 'var(--bg-color)' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: '3rem' }}
        >
          <h2 style={{ fontSize: '2.5rem', color: 'var(--text-color)', marginBottom: '1rem' }}>Contact Us</h2>
          <div style={{ width: '80px', height: '4px', backgroundColor: '#00e6e6', margin: '0 auto', borderRadius: '2px' }}></div>
        </motion.div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ 
              backgroundColor: 'var(--card-bg)', 
              padding: '2rem', 
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-color)'
            }}
          >
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#00e6e6' }}>Get in Touch</h3>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                📍 Location
              </h4>
              <p style={{ lineHeight: '1.6', opacity: 0.9 }}>
                Mechatronics Lab, 2nd Floor, Anna University, <br/>
                Sardar Patel Road, Guindy, <br/>
                Chennai - 600 025, Tamil Nadu, India.
              </p>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                ✉️ Email
              </h4>
              <p style={{ opacity: 0.9 }}>
                <a href="mailto:info@tansam.in" style={{ color: 'var(--text-color)', textDecoration: 'none' }}>info@tansam.in</a>
              </p>
            </div>
            
            <div>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                📞 Phone
              </h4>
              <p style={{ opacity: 0.9 }}>
                <a href="tel:+914422540000" style={{ color: 'var(--text-color)', textDecoration: 'none' }}>+91 44 2254 0000</a><br/>
                <a href="tel:+919600091359" style={{ color: 'var(--text-color)', textDecoration: 'none' }}>+91 96000 91359</a>
              </p>
            </div>
          </motion.div>

          {/* Google Maps Integration */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            style={{
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              minHeight: '350px'
            }}
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d288.19843605534646!2d80.2328095793514!3d13.012912331417507!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a525d210ee3c88b%3A0xf5aa43e3900fcbf!2sTANSAM%20-%20Tamil%20Nadu%20Smart%20and%20Advanced%20Manufacturing%20Centre!5e1!3m2!1sen!2sin!4v1791792780675!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '350px' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="TANSAM Location"
            ></iframe>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default ContactSection;
