import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Points, PointMaterial } from '@react-three/drei';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import ServicesSummary from './components/ServicesSummary';
import HeroSection from './components/HeroSection';
import AboutSection from './components/AboutSection';
import LabsGrid from './components/LabsGrid';
import ProjectsSection from './components/ProjectsSection';
import NewsAndEvents from './components/NewsAndEvents';
import ClientsSection from './components/ClientsSection';
import StudentSuccess from './components/StudentSuccess';
import TestimonialsAndNewsletter from './components/TestimonialsAndNewsletter';
import Footer from './components/Footer';
import ContactPage from './components/ContactPage';
import ChatWidget from './components/ChatWidget';

function ParticleNetwork({ theme }) {
  const ref = useRef();

  // Generate random points for the particle system
  const count = 2000;
  const positions = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Create a spherical distribution for a "globe/network" look
      const radius = 3 + Math.random() * 2;
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos((Math.random() * 2) - 1);

      p[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      p[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      p[i * 3 + 2] = radius * Math.cos(phi);
    }
    return p;
  }, [count]);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.05;
      ref.current.rotation.x += delta * 0.02;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={theme === 'dark' ? "#00e6e6" : "#004d4d"}
        size={theme === 'dark' ? 0.05 : 0.09}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={theme === 'dark' ? 0.8 : 1}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  const handleNavClick = (tab, sectionId, e) => {
    e.preventDefault();
    if (tab !== activeTab) {
      setActiveTab(tab);
    }
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
    
    setTimeout(() => {
      if (sectionId) {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else if (tab === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

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
            <img src="/img/Tansam.png" alt="TANSAM Logo" className="logo-main" onError={(e) => e.target.style.display = 'none'} />
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
            <a href="#hero" className="nav-link" onClick={(e) => handleNavClick('home', 'hero', e)}>Home</a>

            <div className="dropdown">
              <button className="dropdown-btn">
                About Us ▼
              </button>
              <div className="dropdown-content">
                <a href="#about-us" onClick={(e) => handleNavClick('home', 'about-us', e)}>About Us</a>
                <a href="#about-us" onClick={(e) => handleNavClick('home', 'about-us', e)}>Board Directors</a>
              </div>
            </div>

            <a href="#labs" className="nav-link" onClick={(e) => handleNavClick('home', 'labs', e)}>Labs</a>

            <div className="dropdown">
              <button className="dropdown-btn">
                Capabilities ▼
              </button>
              <div className="dropdown-content">
                <a href="#skilling" onClick={(e) => handleNavClick('home', 'skilling', e)}>Skilling</a>
                <a href="#projects" onClick={(e) => handleNavClick('home', 'projects', e)}>Research & Projects</a>
              </div>
            </div>

            <a href="#news" className="nav-link" onClick={(e) => handleNavClick('home', 'news', e)}>News & Events</a>
            <a href="#internship" className="nav-link" onClick={(e) => handleNavClick('home', 'internship', e)}>Internship</a>
            <a href="#contact" className="nav-link" onClick={(e) => handleNavClick('contact', null, e)}>Contact</a>
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
              <a href="#hero" className="nav-link" onClick={(e) => handleNavClick('home', 'hero', e)}>Home</a>
              <a href="#about-us" className="nav-link" onClick={(e) => handleNavClick('home', 'about-us', e)}>About Us</a>
              <a href="#about-us" className="nav-link" onClick={(e) => handleNavClick('home', 'about-us', e)}>Board Directors</a>
              <a href="#labs" className="nav-link" onClick={(e) => handleNavClick('home', 'labs', e)}>Labs</a>
              <a href="#skilling" className="nav-link" onClick={(e) => handleNavClick('home', 'skilling', e)}>Skilling</a>
              <a href="#projects" className="nav-link" onClick={(e) => handleNavClick('home', 'projects', e)}>Research & Projects</a>
              <a href="#news" className="nav-link" onClick={(e) => handleNavClick('home', 'news', e)}>News & Events</a>
              <a href="#internship" className="nav-link" onClick={(e) => handleNavClick('home', 'internship', e)}>Internship</a>
              <a href="#contact" className="nav-link" onClick={(e) => handleNavClick('contact', null, e)}>Contact</a>
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

      {/* Main Content Sections */}
      {activeTab === 'home' ? (
        <>
          <HeroSection theme={theme} />
          <AboutSection theme={theme} />
          <ServicesSummary />
          <LabsGrid theme={theme} />
          <ProjectsSection />
          <NewsAndEvents />
          <ClientsSection />
          <StudentSuccess />
          <TestimonialsAndNewsletter />
        </>
      ) : (
        <ContactPage theme={theme} />
      )}
      <Footer />
      <ChatWidget />
    </div>
  );
}

export default App;
