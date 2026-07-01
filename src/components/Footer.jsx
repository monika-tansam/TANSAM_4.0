import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, ArrowRight } from 'lucide-react';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="footer-section">
      <div className="footer-container">
        
        {/* Top Section */}
        <div className="footer-grid">
          
          <div className="footer-col brand-col">
            <h2 className="footer-brand">
              TAN<span className="highlight-gradient">SAM</span>
            </h2>
            <p className="footer-description">
              TANSAM (Tamil Nadu Smart and Advanced Manufacturing), powered by Siemens, is the state's arts Industry 4.0 Centre of Excellence.
            </p>
            <div className="footer-socials">
              <a href="https://www.facebook.com/people/TANSAM-Powered-by-Siemens/61556964369639/#" target="_blank" rel="noreferrer" className="social-link"><FaFacebook size={20} /></a>
              <a href="https://x.com/TANSAM2022" target="_blank" rel="noreferrer" className="social-link"><FaTwitter size={20} /></a>
              <a href="https://www.instagram.com/tansamcoe_2022/#" target="_blank" rel="noreferrer" className="social-link"><FaInstagram size={20} /></a>
              <a href="https://www.linkedin.com/company/tansam/" target="_blank" rel="noreferrer" className="social-link"><FaLinkedin size={20} /></a>
            </div>
          </div>

          <div className="footer-col links-col">
            <h3 className="footer-title">Popular Links</h3>
            <ul className="footer-links mt-4">
              <li><a href="#home"><ArrowRight size={14}/> Home</a></li>
              <li><a href="#about-us"><ArrowRight size={14}/> About Us</a></li>
              <li><a href="#services"><ArrowRight size={14}/> Services</a></li>
              <li><a href="#labs"><ArrowRight size={14}/> Innovation Labs</a></li>
              <li><a href="#projects"><ArrowRight size={14}/> Projects</a></li>
              <li><a href="#contact"><ArrowRight size={14}/> Contact Us</a></li>
            </ul>
          </div>

          <div className="footer-col contact-col">
            <h3 className="footer-title">Get In Touch</h3>
            <ul className="footer-contact mt-4">
              <li className="flex gap-3 mb-4">
                <MapPin size={20} className="text-cyan mt-1" color="#00ffff" />
                <span>TIDEL Park, Rajiv Gandhi IT Expy, Tharamani, Chennai, Tamil Nadu 600113</span>
              </li>
              <li className="flex gap-3 mb-4">
                <Phone size={20} className="text-cyan" color="#00ffff" />
                <span>+91-98840 35145</span>
              </li>
              <li className="flex gap-3">
                <Mail size={20} className="text-cyan" color="#00ffff" />
                <span>info@tansam.in</span>
              </li>
            </ul>
          </div>
          
        </div>

        {/* Bottom Section */}
        <div className="footer-bottom">
          <p>&copy; 2026 TANSAM. All Rights Reserved.</p>
          <div className="footer-legal-links">
            <a href="#">Disclaimer</a>
            <a href="#">Privacy and Copyright Policy</a>
            <a href="#">Terms of Use</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
