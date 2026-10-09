import { Link } from 'react-router-dom';
import { ArrowUpRight, BookOpen, Award, Wrench } from 'lucide-react';
import SkillingLayout, { SkillingHero, SectionHeading, EnquiryPanel } from '../components/skilling/SkillingLayout';
import PathwayCards from '../components/skilling/PathwayCards';
import { corporateFocus } from '../data/skillingContent';

export default function CorporateSkillingPage() {
  return <SkillingLayout title="Corporate Skilling" variant="corporate">
    <SkillingHero title="Prepare your workforce for Industry 4.0." description="Connected systems, automation, and real-time data are changing manufacturing. Help your team build the knowledge and practical capabilities to work in this evolving industrial environment." image="/img/skilling/corporate.webp" imageAlt="Corporate skilling and connected manufacturing illustration">
      <Link to="/contact" className="sk-button sk-button--primary">Discuss your training needs<ArrowUpRight size={17} aria-hidden="true" /></Link>
    </SkillingHero>

    <section className="sk-section" aria-labelledby="corporate-focus">
      <SectionHeading id="corporate-focus" title="Skills for a connected workforce." description="Five complementary focus areas bring digital knowledge, manufacturing practice, and team problem-solving together." />
      <div className="sk-focus-list">{corporateFocus.map(({ title, text, items }) => <article className="sk-focus-row" key={title}><div><h3>{title}</h3><p>{text}</p></div><ul>{items.map(item => <li key={item}>{item}</li>)}</ul></article>)}</div>
    </section>

    <section className="sk-section sk-approach" aria-labelledby="corporate-approach">
      <SectionHeading id="corporate-approach" title="Learning built around your team." description="TANSAM describes a tailored approach, with training delivered by industry experts and designed to connect with corporate workflows." />
      <div className="sk-approach-grid">{[[BookOpen, 'Tailored workshops', 'Explore subjects that connect with your organisation’s training needs.'], [Award, 'Certification programs', 'Discuss available certifications and the requirements of each program.'], [Wrench, 'Hands-on training', 'Connect technical understanding with practical modules and industrial applications.']].map(([Icon, title, text]) => <article key={title}><Icon size={30} strokeWidth={1.5} aria-hidden="true" /><h3>{title}</h3><p>{text}</p></article>)}</div>
    </section>

    <EnquiryPanel title="What does your team need to learn?" description="Discuss your objectives, current programs, and training formats with TANSAM." label="Discuss corporate training" />
    <section className="sk-section sk-related" aria-labelledby="corporate-related"><SectionHeading id="corporate-related" title="Explore our other pathways." /><PathwayCards exclude="corporate" compact /></section>
  </SkillingLayout>;
}
