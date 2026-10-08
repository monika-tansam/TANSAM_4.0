import React, { Suspense, useState, useEffect, useLayoutEffect, useRef } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '../components/Footer';

// Homepage gap before the card reaches navigation: larger = hide earlier.
const HEADER_CARD_GAP = 25;
// Homepage fallback delay while the Industry 4.0 card is loading, in pixels.
const HEADER_HIDE_DISTANCE = 250;
// Labs landing spacing below navigation, matching the reference screenshot.
const LABS_NAV_GAP = 64;
const LABS_OPENING_OFFSET = 48;
const INTERNSHIPS_OPENING_OFFSET = 24;
const INTERNSHIPS_NAV_GAP = 56;

export default function MainLayout({ theme, toggleTheme }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSocialVisible, setIsSocialVisible] = useState(true);
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);
  const tickerRef = useRef(null);
  const headerShellRef = useRef(null);
  const brandingRef = useRef(null);
  const location = useLocation();
  const openingOffset = location.hash ? 0
    : location.pathname === '/labs' ? LABS_OPENING_OFFSET
    : location.pathname === '/success' ? INTERNSHIPS_OPENING_OFFSET : 0;

  // Inner pages open below branding; scrolling back to the top reveals it naturally.
  useLayoutEffect(() => {
    if (location.pathname !== '/') {
      const brandingHeight = brandingRef.current?.getBoundingClientRect().height ?? 0;
      const tickerHeight = tickerRef.current?.offsetHeight ?? 0;
      headerShellRef.current?.style.setProperty('--header-scroll-offset', `${brandingHeight}px`);
      setIsHeaderHidden(true);
      window.scrollTo({ top: Math.ceil(tickerHeight + brandingHeight + openingOffset), behavior: 'instant' });
    } else if (!location.hash) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [location.pathname, location.hash, location.key, openingOffset]);

  useEffect(() => {
    if (!['/labs', '/success'].includes(location.pathname) || location.hash) return;
    const isLabs = location.pathname === '/labs';
    const titleSelector = isLabs ? '.labs-header' : '.internships-page h1';
    const panelSelector = isLabs ? '.lab-panel' : '.success-bento-grid > .bento-panel';
    const navGap = isLabs ? LABS_NAV_GAP : INTERNSHIPS_NAV_GAP;
    const bottomGap = isLabs ? 24 : 12;
    const minimumTitleGap = isLabs ? 24 : 0;
    let cancelled = false;
    let scheduled = false;
    let frameId = null;
    const observer = new MutationObserver(() => scheduleLanding());
    const scheduleLanding = () => {
      const titleCard = document.querySelector(titleSelector);
      const panels = document.querySelectorAll(panelSelector);
      if (scheduled || !titleCard || !panels.length) return;
      scheduled = true;
      observer.disconnect();
      document.fonts.ready.then(() => {
        if (cancelled) return;
        frameId = window.requestAnimationFrame(() => {
          // Layout coordinates ignore the cards' entrance animation transforms.
          const documentTop = (element) => {
            let top = 0;
            for (let node = element; node; node = node.offsetParent) top += node.offsetTop;
            return top;
          };
          const navHeight = headerShellRef.current?.querySelector('nav')?.offsetHeight ?? 0;
          const titleTop = documentTop(titleCard);
          const firstRowTop = panels[0].offsetTop;
          const firstRow = Array.from(panels).filter(panel => panel.offsetTop === firstRowTop);
          const rowBottom = Math.max(...firstRow.map(panel => documentTop(panel) + panel.offsetHeight));
          const referenceTop = titleTop - navHeight - navGap;
          // If the first row fits, keep its bottom visible in shorter windows too.
          const fittedTop = Math.max(referenceTop, rowBottom + bottomGap - window.innerHeight);
          const top = Math.min(fittedTop, titleTop - navHeight - minimumTitleGap);
          window.scrollTo({ top: Math.max(0, top), behavior: 'instant' });
        });
      });
    };
    observer.observe(document.body, { childList: true, subtree: true });
    scheduleLanding();
    return () => {
      cancelled = true;
      observer.disconnect();
      if (frameId !== null) window.cancelAnimationFrame(frameId);
    };
  }, [location.pathname, location.hash, location.key]);

  useLayoutEffect(() => {
    let frameId = null;
    let brandingHeight = 0;
    let tickerHeight = 0;

    const updateHeader = () => {
      const isHome = location.pathname === '/';
      const heroCard = isHome ? document.querySelector('.hero-glass-card') : null;
      let hideStart = tickerHeight + (isHome ? HEADER_HIDE_DISTANCE : 0);
      if (heroCard) {
        // Document position stays stable because hiding does not shrink the header's layout space.
        const cardTop = heroCard.getBoundingClientRect().top + window.scrollY;
        const fullHeaderHeight = headerShellRef.current?.getBoundingClientRect().height ?? brandingHeight;
        hideStart = Math.max(tickerHeight, cardTop - fullHeaderHeight - HEADER_CARD_GAP);
      }
      const scrollOffset = Math.min(
        brandingHeight,
        Math.max(0, window.scrollY - hideStart),
      );
      headerShellRef.current?.style.setProperty('--header-scroll-offset', `${scrollOffset}px`);
      setIsHeaderHidden(brandingHeight > 0 && scrollOffset >= brandingHeight);
    };

    const onScroll = () => {
      if (frameId === null) {
        frameId = window.requestAnimationFrame(() => {
          frameId = null;
          updateHeader();
        });
      }
    };

    const measureBranding = () => {
      const wasAtPageStart = location.pathname !== '/' && brandingHeight > 0
        && Math.abs(window.scrollY - Math.ceil(tickerHeight + brandingHeight + openingOffset)) <= 2;
      const nextBrandingHeight = brandingRef.current?.getBoundingClientRect().height ?? 0;
      const nextTickerHeight = tickerRef.current?.offsetHeight ?? 0;
      const sizeChanged = Math.abs(nextBrandingHeight - brandingHeight) > 0.5
        || nextTickerHeight !== tickerHeight;
      brandingHeight = nextBrandingHeight;
      tickerHeight = nextTickerHeight;
      // Logos and fonts can finish loading after navigation; keep the compact landing aligned.
      // Observer's initial notification must not cancel a pending section scroll.
      if (wasAtPageStart && sizeChanged && !location.hash) {
        window.scrollTo({ top: Math.ceil(tickerHeight + brandingHeight + openingOffset), behavior: 'instant' });
      }
      updateHeader();
    };

    const observer = new ResizeObserver(measureBranding);
    observer.observe(brandingRef.current);
    observer.observe(tickerRef.current);
    measureBranding();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      observer.disconnect();
      if (frameId !== null) window.cancelAnimationFrame(frameId);
    };
  }, [location.pathname, location.hash, openingOffset]);

  // Close mobile menu on route change and handle hash scrolling
  useEffect(() => {
    setIsMobileMenuOpen(false);

    if (location.hash) {
      const id = location.hash.replace('#', '');
      let cancelled = false;
      let frameId = null;
      let scheduled = false;

      const scrollToTarget = () => {
        const element = document.getElementById(id);
        if (!element) return;

        const aboutCard = id === 'about-us' ? element.querySelector('.about-content') : null;
        if (aboutCard) {
          const navHeight = headerShellRef.current?.querySelector('nav')?.offsetHeight ?? 0;
          const availableHeight = window.innerHeight - navHeight;
          const cardHeight = aboutCard.offsetHeight;
          // Centre a card that fits; start taller cards below navigation for normal scrolling.
          const gap = cardHeight <= availableHeight ? (availableHeight - cardHeight) / 2 : 24;
          let cardTop = 0;
          // Use layout positions so entrance animations cannot move the scroll target.
          for (let node = aboutCard; node; node = node.offsetParent) {
            cardTop += node.offsetTop;
          }
          window.scrollTo({ top: Math.max(0, cardTop - navHeight - gap), behavior: 'smooth' });
        } else {
          const navHeight = headerShellRef.current?.querySelector('nav')?.offsetHeight ?? 0;
          let sectionTop = 0;
          for (let node = element; node; node = node.offsetParent) {
            sectionTop += node.offsetTop;
          }
          window.scrollTo({ top: Math.max(0, sectionTop - navHeight - 24), behavior: 'smooth' });
        }
      };

      const observer = new MutationObserver(() => scheduleScroll());
      const scheduleScroll = () => {
        if (scheduled || !document.getElementById(id)) return;
        scheduled = true;
        observer.disconnect();
        // Wait for lazy content and font metrics instead of guessing a mounting delay.
        document.fonts.ready.then(() => {
          if (!cancelled) frameId = window.requestAnimationFrame(scrollToTarget);
        });
      };
      observer.observe(document.body, { childList: true, subtree: true });
      scheduleScroll();

      return () => {
        cancelled = true;
        observer.disconnect();
        if (frameId !== null) window.cancelAnimationFrame(frameId);
      };
    } else if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.pathname, location.hash, location.key]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div>
      {/* Notification Bar */}
      <div className="notification-bar" ref={tickerRef}>
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

      {/* Move branding out as the hero card approaches navigation. */}
      <div ref={headerShellRef} className="header-shell">
      <header className="site-header" ref={brandingRef} inert={isHeaderHidden}>
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
            
          </div>
        </div>
      </header>

        {/* Bottom Header: Navigation Links */}
        <nav className="navbar-container header-bottom" aria-label="Main navigation">
          <div className="nav-links desktop-only">
            <Link to="/" className="nav-link">Home</Link>
            
            <Link to="/#about-us" className="nav-link">About Us</Link>

            <Link to="/labs" className="nav-link">Labs</Link>
            
            <div className="dropdown">
              <button className="dropdown-btn">
                Capabilities ▼
              </button>
              <div className="dropdown-content">
                <Link to="/#skilling">Skilling</Link>
              <Link to="/labs#projects" className="nav-link">Research & Projects</Link>
              </div>
            </div>
            
            <Link to="/news" className="nav-link">News & Events</Link>
            <Link to="/success" className="nav-link">Internships</Link>
            
            <Link to="/contact" className="nav-link">Contact</Link>
          </div>
          {/* Fade in the desktop control when the branding has scrolled away. */}
          <button
            onClick={toggleTheme}
            className={`theme-toggle nav-theme-toggle desktop-only${isHeaderHidden ? ' nav-theme-toggle--visible' : ''}`}
            aria-label="Toggle Theme"
            aria-pressed={theme === 'dark'}
            aria-hidden={!isHeaderHidden}
            disabled={!isHeaderHidden}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          {/* Mobile controls remain accessible after the logos scroll away. */}
          <div className="mobile-only mobile-controls">
            <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle Theme">
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <button className="hamburger-btn" onClick={toggleMobileMenu} aria-label="Toggle Mobile Menu">
              ☰
            </button>
          </div>
        </nav>
      </div>

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
              <Link to="/#skilling" className="nav-link">Skilling</Link>
              <Link to="/labs#projects" className="nav-link">Research & Projects</Link>
              <Link to="/news" className="nav-link">News & Events</Link>
              <Link to="/success" className="nav-link">Internships</Link>
              <Link to="/contact" className="nav-link">Contact</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Social Media Bar */}
      <div className={`floating-social-bar desktop-only ${!isSocialVisible ? 'collapsed' : ''}`}>
        <button 
          className="social-toggle-btn"
          onClick={() => setIsSocialVisible(!isSocialVisible)}
          aria-label="Toggle Social Media Bar"
        >
          {isSocialVisible ? '❮' : '❯'}
        </button>
        <div className="social-icons-wrapper">
          <a href="https://www.facebook.com/people/TANSAM-Powered-by-Siemens/61556964369639/#" target="_blank" rel="noreferrer" className="social-icon-btn"><FaFacebook size={20} /></a>
          <a href="https://x.com/TANSAM2022" target="_blank" rel="noreferrer" className="social-icon-btn"><FaTwitter size={20} /></a>
          <a href="https://www.instagram.com/tansamcoe_2022/#" target="_blank" rel="noreferrer" className="social-icon-btn"><FaInstagram size={20} /></a>
          <a href="https://www.linkedin.com/company/tansam/" target="_blank" rel="noreferrer" className="social-icon-btn"><FaLinkedin size={20} /></a>
        </div>
      </div>

      <main>
        <Suspense fallback={<div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>Loading...</div>}>
          <Outlet />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
