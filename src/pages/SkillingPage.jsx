import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUpRight, Network, Cpu, Wrench, ShieldCheck } from 'lucide-react';
import SkillingLayout, { SkillingHero, SectionHeading, ContentGrid, EnquiryPanel } from '../components/skilling/SkillingLayout';
import PathwayCards from '../components/skilling/PathwayCards';
import FaqAccordion from '../components/skilling/FaqAccordion';
import { skillingPathways, sampleCourses, skillingBenefits, careerPathways, overviewFaqs } from '../data/skillingContent';

const careerIcons = [Network, Wrench, Cpu, ShieldCheck];
const careerIconTypes = ['iot', 'automation', 'ev', 'security'];

export default function SkillingPage() {
  return <SkillingLayout title="Skilling">
    <div className="sk-overview-opening">
      <SkillingHero title={<>Build Practical Skills for <span className="highlight-gradient">Industry 4.0</span></>}
        description="Bring learning closer to industry. Explore hands-on training in smart manufacturing, automation, IoT, AI, and immersive technologies with TANSAM, powered by Siemens.">
        <a className="btn btn-primary sk-pathway-cta" href="#skilling-pathways">Choose your pathway<ArrowDown size={17} aria-hidden="true" /></a>
        <Link className="sk-text-link" to="/contact">Talk to TANSAM<ArrowUpRight size={16} aria-hidden="true" /></Link>
      </SkillingHero>
      <div className="sk-learning-composition" aria-label="Three connected skilling pathways">
        {skillingPathways.map(pathway => <Link key={pathway.id} to={pathway.path} className={`sk-composition-panel sk-composition-panel--${pathway.id}`}>
          <div className="sk-composition-surface">
            <img src={pathway.image} alt={`${pathway.title} learning illustration`} fetchPriority={pathway.id === 'corporate' ? 'high' : 'auto'} />
            <span>{pathway.title}<ArrowUpRight size={15} aria-hidden="true" /></span>
          </div>
        </Link>)}
        
      </div>
    </div>

    <section className="sk-section" aria-labelledby="skilling-pathways">
      <SectionHeading id="skilling-pathways" title="A pathway for every ambition." description="Choose the program that fits your team, institution, or learning journey." />
      <PathwayCards />
    </section>

    <section className="sk-section sk-section--learning" aria-labelledby="sk-learning">
      <SectionHeading id="sk-learning" title="Knowledge that connects to practice." description="TANSAM brings together students, MSMEs, professionals, and institutions to explore technologies shaping advanced manufacturing." />
      <ContentGrid items={skillingBenefits} />
    </section>

    <section className="sk-section" aria-labelledby="sk-subjects">
      <SectionHeading id="sk-subjects" title="Explore the skills of tomorrow." description="A selection of subjects from TANSAM’s skilling programs. Contact us for current courses and availability." />
      <div className="sk-course-grid">{sampleCourses.map(([title, description]) => <article className="sk-course" key={title}><span className="sk-course-marker" aria-hidden="true" /><div><h3>{title}</h3><p>{description}</p></div></article>)}</div>
    </section>

    <section className="sk-section" aria-labelledby="sk-careers">
      <SectionHeading id="sk-careers" title="Where your skills could take you." description="Explore career directions connected to Industry 4.0 learning." />
      <div className="sk-careers">{careerPathways.map(([title, description], index) => { const Icon = careerIcons[index]; return <article key={title} className={`sk-career sk-career--${careerIconTypes[index]}`}><Icon className="sk-career-icon" size={27} strokeWidth={1.5} aria-hidden="true" /><h3>{title}</h3><p>{description}</p></article>; })}</div>
    </section>

    <section className="sk-section sk-faq-section" aria-labelledby="sk-questions"><SectionHeading id="sk-questions" title="Before you get started." description="A few answers to help you choose your next step." /><FaqAccordion items={overviewFaqs} /></section>
    <EnquiryPanel />
  </SkillingLayout>;
}
