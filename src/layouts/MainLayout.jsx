import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaShoppingCart } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '../components/Footer';
import { useInternship } from '../context/InternshipContext';

export default function MainLayout({ theme, toggleTheme }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { cart } = useInternship();

  // Close mobile menu on route change and handle hash scrolling
  useEffect(() => {
    setIsMobileMenuOpen(false);
    
    if (location.hash) {
      setTimeout(() => {
        const id = location.hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100); // Give lazy loaded components a moment to mount
    } else if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.pathname, location.hash]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div>
      {/* Notification Bar */}
      <div className="notification-bar">
        <div className="marquee">
          <span>Welcome to TANSAM!</span>
          <span>Enroll now for our Industry 4.0 corporate skilling programs.</span>
          <span>Internship opportunities available - registrations open!</span>
          <span>Stay updated with the latest news and events across Tamil Nadu.</span>
          {/* Duplicate for loop */}
          <span aria-hidden="true">Welcome to TANSAM!</span>
          <span aria-hidden="true">Enroll now for our Industry 4.0 corporate skilling programs.</span>
          <span aria-hidden="true">Internship opportunities available - registrations open!</span>
          <span aria-hidden="true">Stay updated with the latest news and events across Tamil Nadu.</span>
        </div>
      </div>

      {/* Header Container */}
      <header className="navbar-container">
        {/* Top Header: Logos & Title */}
        <div className="header-top">
          {/* Left: TANSAM Logo */}
          <div className="header-left">
            <Link to="/">
              <img src="/img/Tansam.png" alt="TANSAM Logo" className="logo-main" onError={(e) => e.target.style.display = 'none'} />
            </Link>
          </div>

          {/* Center: TN Logo & Titles */}
          <div className="header-center">
            <img className="tn-logo" src="/img/tn-logo.png" alt="Tamil Nadu Government Logo" onError={(e) => e.target.style.display = 'none'} />
            <div className="header-titles desktop-only-text">
              <h2>TAMIL NADU SMART AND ADVANCED MANUFACTURING CENTER - (TANSAM)</h2>
              <p>Center of Excellence <span className="siemens-text">powered by SIEMENS</span></p>
            </div>
          </div>

          {/* Right: TIDCO Logo & Controls */}
          <div className="header-right">
            <img src="/img/tidcologo.png" alt="TIDCO Logo" className="logo-tidco" onError={(e) => e.target.style.display = 'none'} />
            
            {/* Desktop Theme Toggle */}
            <button onClick={toggleTheme} className="theme-toggle desktop-only" aria-label="Toggle Theme">
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            
            {/* Mobile Hamburger & Theme Toggle */}
            <div className="mobile-only mobile-controls">
              <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle Theme">
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
              <button className="hamburger-btn" onClick={toggleMobileMenu} aria-label="Toggle Mobile Menu">
                ☰
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Header: Navigation Links */}
        <nav className="header-bottom desktop-only">
          <div className="nav-links">
            <Link to="/" className="nav-link">Home</Link>
            
            <Link to="/#about-us" className="nav-link">About Us</Link>

            <Link to="/labs" className="nav-link">Labs</Link>
            
            <div className="dropdown">
              <button className="dropdown-btn">
                Capabilities ▼
              </button>
              <div className="dropdown-content">
                <Link to="/labs">Skilling</Link>
              <Link to="/labs#projects" className="nav-link">Research & Projects</Link>
              </div>
            </div>
            
            <Link to="/news" className="nav-link">News & Events</Link>
            <div className="dropdown">
              <button className="dropdown-btn">
                Internship ▼
              </button>
              <div className="dropdown-content">
                <Link to="/internships">Registrations</Link>
                <Link to="/internships/dashboard">My Dashboard</Link>
                <Link to="/success">Success Stories</Link>
              </div>
            </div>
            
            <Link to="/contact" className="nav-link">Contact</Link>
            
            <Link to="/internships/checkout" className="nav-link cart-link" style={{ position: 'relative', display: 'flex', alignItems: 'center', marginLeft: '10px' }}>
              <FaShoppingCart size={20} />
              {cart && cart.length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-12px',
                  background: '#ff0055',
                  color: 'white',
                  borderRadius: '50%',
                  padding: '2px 6px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  boxShadow: '0 0 10px #ff0055'
                }}>
                  {cart.length}
                </span>
              )}
            </Link>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            className="mobile-menu-overlay"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
          >
            <button className="close-menu-btn" onClick={toggleMobileMenu}>✕</button>
            <div className="mobile-nav-links">
              <Link to="/" className="nav-link">Home</Link>
              <Link to="/#about-us" className="nav-link">About Us</Link>
              <Link to="/labs" className="nav-link">Labs</Link>
              <Link to="/labs" className="nav-link">Skilling</Link>
              <Link to="/labs#projects" className="nav-link">Research & Projects</Link>
              <Link to="/news" className="nav-link">News & Events</Link>
              <Link to="/internships" className="nav-link">Internship Registration</Link>
              <Link to="/internships/dashboard" className="nav-link">My Dashboard</Link>
              <Link to="/success" className="nav-link">Internship Success</Link>
              <Link to="/contact" className="nav-link">Contact</Link>
              <Link to="/internships/checkout" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FaShoppingCart /> Cart ({cart?.length || 0})
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Social Media Bar */}
      <div className="floating-social-bar desktop-only">
        <a href="https://www.facebook.com/people/TANSAM-Powered-by-Siemens/61556964369639/#" target="_blank" rel="noreferrer" className="social-icon-btn"><FaFacebook size={20} /></a>
        <a href="https://x.com/TANSAM2022" target="_blank" rel="noreferrer" className="social-icon-btn"><FaTwitter size={20} /></a>
        <a href="https://www.instagram.com/tansamcoe_2022/#" target="_blank" rel="noreferrer" className="social-icon-btn"><FaInstagram size={20} /></a>
        <a href="https://www.linkedin.com/company/tansam/" target="_blank" rel="noreferrer" className="social-icon-btn"><FaLinkedin size={20} /></a>
      </div>

      <main>
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
