import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, ChevronRight, MessageCircle, Check } from 'lucide-react';
import './Skilling.css';

export default function SkillingLayout({ title, children, variant = 'overview' }) {
  useEffect(() => {
    const previous = document.title;
    document.title = `${title} | TANSAM`;
    return () => { document.title = previous; };
  }, [title]);

  return (
    <div className={`skilling-page skilling-page--${variant}`}>
      <div className="skilling-container">
        <nav className="sk-breadcrumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link><ChevronRight size={13} aria-hidden="true" />
          {variant === 'overview' ? <span aria-current="page">Skilling</span> : <><Link to="/skilling">Skilling</Link><ChevronRight size={13} aria-hidden="true" /><span aria-current="page">{title}</span></>}
        </nav>
        {children}
      </div>
    </div>
  );
}

export function SkillingHero({ title, description, image, imageAlt, children, accent = 'teal' }) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.header className={`sk-hero sk-hero--${accent}`}
      initial={reducedMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}>
      <div className="sk-hero-copy">
        <h1>{title}</h1><p>{description}</p>
        <div className="sk-hero-actions">{children}</div>
      </div>
      {image && <figure className="sk-hero-image"><img src={image} alt={imageAlt} fetchPriority="high" /><figcaption>Practical learning. Industrial possibilities.</figcaption></figure>}
    </motion.header>
  );
}

export function SectionHeading({ id, title, description }) {
  return <div className="sk-section-heading"><h2 id={id}>{title}</h2>{description && <p>{description}</p>}</div>;
}

export function ContentGrid({ items, className = '' }) {
  return <div className={`sk-content-grid ${className}`}>{items.map(({ title, text, items: bullets }) => (
    <article className="sk-content-card" key={title}>
      <h3>{title}</h3><p>{text}</p>
      {bullets && <ul>{bullets.map(item => <li key={item}><Check size={15} aria-hidden="true" /><span>{item}</span></li>)}</ul>}
    </article>
  ))}</div>;
}

export function EnquiryPanel({ title = 'Find the right learning pathway.', description = 'Talk to TANSAM about current programs, eligibility, and how to participate.', label = 'Contact TANSAM' }) {
  return <section className="sk-enquiry" aria-label="Skilling enquiries">
    <div className="sk-enquiry-icon"><MessageCircle size={30} strokeWidth={1.5} aria-hidden="true" /></div>
    <div><h2>{title}</h2><p>{description}</p></div>
    <Link to="/contact" className="sk-button sk-button--primary">{label}<ArrowUpRight size={17} aria-hidden="true" /></Link>
  </section>;
}
