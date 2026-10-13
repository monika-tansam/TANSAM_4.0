import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';

export default function Footer() {
  const { pathname } = useLocation();

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
              <a href="https://www.facebook.com/people/TANSAM-Powered-by-Siemens/61556964369639/#" target="_blank" rel="noreferrer" className="social-icon-btn"><FaFacebook size={20} /></a>
              <a href="https://x.com/TANSAM2022" target="_blank" rel="noreferrer" className="social-icon-btn"><FaTwitter size={20} /></a>
              <a href="https://www.instagram.com/tansamcoe_2022/#" target="_blank" rel="noreferrer" className="social-icon-btn"><FaInstagram size={20} /></a>
              <a href="https://www.linkedin.com/company/tansam/" target="_blank" rel="noreferrer" className="social-icon-btn"><FaLinkedin size={20} /></a>
            </div>
          </div>

          <div className="footer-col links-col">
            <h3 className="footer-title">Popular Links</h3>
            <ul className="footer-links mt-4">
              <li><Link to="/" state={pathname === '/' ? { footerScroll: 'top' } : null}><ArrowRight size={14}/> Home</Link></li>
              <li><Link to="/#about-us"><ArrowRight size={14}/> About Us</Link></li>
              <li><a href="#services"><ArrowRight size={14}/> Services</a></li>
              <li><Link to="/labs" state={pathname === '/labs' ? { footerScroll: 'top' } : null}><ArrowRight size={14}/> Innovation Labs</Link></li>
              <li><Link to="/labs#projects" state={pathname === '/labs' ? { footerScroll: 'section' } : null}><ArrowRight size={14}/> Projects</Link></li>
              <li><Link to="/contact"><ArrowRight size={14}/> Contact Us</Link></li>
            </ul>
          </div>

          <div className="footer-col contact-col">
            <h3 className="footer-title">Get In Touch</h3>
            <ul className="footer-contact mt-4">
              <li>
                <FaMapMarkerAlt className="footer-contact-icon" aria-hidden="true" focusable="false" />
                <span>Mechatronics Lab, Anna University, Kotturpuram, Chennai, Tamil Nadu 600025</span>
              </li>
              <li>
                <FaPhoneAlt className="footer-contact-icon" aria-hidden="true" focusable="false" />
                <span>+91-98840 35145<br/>+91-96000 91359</span>
              </li>
              <li>
                <FaEnvelope className="footer-contact-icon" aria-hidden="true" focusable="false" />
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
