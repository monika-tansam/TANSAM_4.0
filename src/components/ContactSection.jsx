import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

function ContactSection() {
  const reducedMotion = useReducedMotion();
  return (
    <section className="contact-section" id="contact">
      <div className="contact-container">
        <motion.div 
          initial={reducedMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="contact-heading"
        >
          <h1>Contact Us</h1>
          <div className="contact-heading-rule" aria-hidden="true"></div>
        </motion.div>
        
        <div className="contact-grid">
          {/* Contact Information */}
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="contact-info"
          >
            <h2>Get in Touch</h2>
            
            <div className="contact-detail">
              <h3>
                📍 Location
              </h3>
              <p>
                Mechatronics Lab, 2nd Floor, Anna University, <br/>
                Sardar Patel Road, Guindy, <br/>
                Chennai - 600 025, Tamil Nadu, India.
              </p>
            </div>
            
            <div className="contact-detail">
              <h3>
                ✉️ Email
              </h3>
              <p>
                <a href="mailto:info@tansam.in">info@tansam.in</a>
              </p>
            </div>
            
            <div className="contact-detail">
              <h3>
                📞 Phone
              </h3>
              <p>
                <a href="tel:+914422540000">+91 44 2254 0000</a><br/>
                <a href="tel:+919600091359">+91 96000 91359</a>
              </p>
            </div>
          </motion.div>

          {/* Google Maps Integration */}
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="contact-map"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d288.19843605534646!2d80.2328095793514!3d13.012912331417507!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a525d210ee3c88b%3A0xf5aa43e3900fcbf!2sTANSAM%20-%20Tamil%20Nadu%20Smart%20and%20Advanced%20Manufacturing%20Centre!5e1!3m2!1sen!2sin!4v1791792780675!5m2!1sen!2sin"
              width="100%"
              height="100%"
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
