import { Link } from 'react-router-dom';
import { ArrowUpRight, Building2, GraduationCap, Sprout } from 'lucide-react';
import { skillingPathways } from '../../data/skillingContent';

const icons = { corporate: Building2, academia: GraduationCap, naanmudhalvan: Sprout };

export default function PathwayCards({ exclude, compact = false }) {
  return <div className={`sk-pathways${compact ? ' sk-pathways--compact' : ''}`}>
    {skillingPathways.filter(pathway => pathway.id !== exclude).map(pathway => {
      const Icon = icons[pathway.id];
      return <Link to={pathway.path} key={pathway.id} className={`sk-pathway sk-pathway--${pathway.id}`}>
        {!compact && <div className="sk-pathway-image"><img src={pathway.image} alt={`${pathway.title} skilling illustration`} loading="lazy" /></div>}
        <div className="sk-pathway-body">
          <div className="sk-pathway-top"><span className="sk-pathway-icon"><Icon size={23} strokeWidth={1.5} aria-hidden="true" /></span><span>{pathway.audience}</span><ArrowUpRight className="sk-pathway-arrow" size={22} aria-hidden="true" /></div>
          <h3>{pathway.title}</h3><p>{pathway.description}</p>
          {!compact && <div className="sk-tags">{pathway.tags.map(tag => <span key={tag}>{tag}</span>)}</div>}
          <span className="sk-pathway-link">Explore {pathway.title}<Chevron aria-hidden="true" /></span>
        </div>
        <span className="sk-edge-light" aria-hidden="true"><span /></span>
      </Link>;
    })}
  </div>;
}

function Chevron() {
  return <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="m9 5 7 7-7 7" stroke="currentColor" strokeWidth="1.5" /></svg>;
}
