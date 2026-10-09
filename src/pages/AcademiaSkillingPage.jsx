import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import SkillingLayout, { SkillingHero, SectionHeading, ContentGrid, EnquiryPanel } from '../components/skilling/SkillingLayout';
import PathwayCards from '../components/skilling/PathwayCards';
import FaqAccordion from '../components/skilling/FaqAccordion';
import { academicOfferings, academicBenefits, academicLearning, academiaFaqs } from '../data/skillingContent';

export default function AcademiaSkillingPage() {
  return <SkillingLayout title="Academia" variant="academia">
    <SkillingHero title="Bring industry-ready learning to your institution." description="Bridge classroom knowledge and industry needs. TANSAM works with engineering colleges, polytechnic institutions, and universities to connect theory with hands-on Industry 4.0 learning." image="/img/skilling/academia.webp" imageAlt="Academic learning and Industry 4.0 collaboration illustration" accent="ochre">
      <Link to="/contact" className="sk-button sk-button--primary">Explore academic collaboration<ArrowUpRight size={17} aria-hidden="true" /></Link>
    </SkillingHero>

    <section className="sk-section" aria-labelledby="academic-offerings"><SectionHeading id="academic-offerings" title="Connect your curriculum to industry." description="Explore five areas of advanced manufacturing education through TANSAM’s academic offerings." /><ContentGrid items={academicOfferings} className="sk-offerings" /></section>
    <section className="sk-section sk-section--learning" aria-labelledby="academic-benefits"><SectionHeading id="academic-benefits" title="Build a stronger learning ecosystem." description="Bring tools, educators, research, and industry partnerships closer together." /><ContentGrid items={academicBenefits} /></section>

    <section className="sk-section sk-learning-model" aria-labelledby="academic-learning"><SectionHeading id="academic-learning" title="More than classroom learning." description="A practical model that connects a modern curriculum with projects, faculty development, and industry experience." /><div>{academicLearning.map(({ title, text }) => <article key={title}><span className="sk-model-dot" aria-hidden="true" /><h3>{title}</h3><p>{text}</p></article>)}</div></section>
    <section className="sk-section sk-faq-section" aria-labelledby="academia-questions"><SectionHeading id="academia-questions" title="Planning a collaboration?" description="Start with the details that matter to your institution." /><FaqAccordion items={academiaFaqs} /></section>

    <div className="sk-vision"><p>Our vision</p><h2>An ecosystem of practical learning and innovation.</h2><p>Help shape engineers, technologists, and leaders who can contribute to the future of Industry 4.0.</p></div>
    <EnquiryPanel title="Let’s connect your institution with industry." description="Talk to TANSAM about your learning objectives, faculty development, and collaboration opportunities." label="Discuss a collaboration" />
    <section className="sk-section sk-related" aria-labelledby="academia-related"><SectionHeading id="academia-related" title="Explore our other pathways." /><PathwayCards exclude="academia" compact /></section>
  </SkillingLayout>;
}
