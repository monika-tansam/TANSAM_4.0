import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { boardDirectors } from '../data/boardDirectors';
import './BoardDirectorsPage.css';

export default function BoardDirectorsPage() {
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    const previous = document.title;
    document.title = 'Board Directors | TANSAM';
    return () => { document.title = previous; };
  }, []);

  return <div className="board-page">
    <div className="board-container">
      <nav className="board-breadcrumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link><ChevronRight size={13} aria-hidden="true" />
        <Link to="/#about-us">About Us</Link><ChevronRight size={13} aria-hidden="true" />
        <span aria-current="page">Board Directors</span>
      </nav>
      <motion.section aria-labelledby="board-title" initial={reducedMotion ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }} transition={{ duration: .5, ease: [.22, 1, .36, 1] }}>
        <header className="board-heading"><h1 id="board-title">Board of <span className="highlight-gradient">Directors</span></h1></header>
        <div className="board-grid">
          {boardDirectors.map(member => <article className="board-card" key={member.id} data-board-director={member.id} aria-labelledby={`director-${member.id}`}>
            <div className="board-initials" aria-hidden="true">{member.initials}</div>
            <h2 id={`director-${member.id}`}>{member.name}</h2>
            <p className="board-role">{member.role}</p>
          </article>)}
        </div>
      </motion.section>
    </div>
  </div>;
}
