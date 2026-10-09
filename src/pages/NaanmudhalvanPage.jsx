import { ArrowDown, CalendarDays, ClipboardCheck, Laptop, Users, BriefcaseBusiness, Lightbulb } from 'lucide-react';
import SkillingLayout, { SkillingHero, SectionHeading, EnquiryPanel } from '../components/skilling/SkillingLayout';
import PathwayCards from '../components/skilling/PathwayCards';
import TrainingTable from '../components/skilling/TrainingTable';
import { facultyRecords, studentRecords } from '../data/skillingTrainingData';

export default function NaanmudhalvanPage() {
  return <SkillingLayout title="Naanmudhalvan" variant="naanmudhalvan">
    <SkillingHero title="Developing skills for Tamil Nadu’s future." description="Under the Government of Tamil Nadu’s Naanmudhalvan initiative, TANSAM connects faculty and students with advanced manufacturing, emerging technologies, and practical industrial exposure." image="/img/skilling/naanmudhalvan.webp" imageAlt="Naanmudhalvan faculty and student skilling illustration">
      <a href="#student-development" className="sk-button sk-button--primary">Student development<ArrowDown size={17} aria-hidden="true" /></a>
      <a href="#faculty-development" className="sk-text-link">Faculty development<ArrowDown size={15} aria-hidden="true" /></a>
    </SkillingHero>

    <div className="sk-program-bridge"><Users size={26} strokeWidth={1.5} aria-hidden="true" /><p><strong>Equip educators. Empower students.</strong> Faculty preparation and student development connect academic teaching with the skills used in industry.</p></div>

    <section className="sk-section" aria-labelledby="faculty-development">
      <SectionHeading id="faculty-development" title="Faculty Development Program" description="Prepare educators to deliver Industry 4.0 training through focused learning, practical exposure, and assessment." />
      <div className="sk-program-structure">{[[CalendarDays, '6-day program', 'Four days of classroom learning followed by two days of assessment.'], [ClipboardCheck, 'Written & practical assessments', 'Evaluate technical understanding and its practical application.'], [Laptop, 'Flexible learning modes', 'Online and offline sessions, digital materials, and real-time project exposure.']].map(([Icon, title, text]) => <article key={title}><Icon size={25} strokeWidth={1.5} aria-hidden="true" /><h3>{title}</h3><p>{text}</p></article>)}</div>
      <TrainingTable records={facultyRecords} type="faculty" />
    </section>

    <section className="sk-section" aria-labelledby="student-development">
      <SectionHeading id="student-development" title="Student Development Program" description="A structured learning program for engineering and polytechnic students across Tamil Nadu, connecting technical skills with industry exposure." />
      <div className="sk-duration-strip"><div><strong>10 weeks</strong><span>Polytechnic students</span></div><div><strong>12 weeks</strong><span>Engineering students</span></div><p>Assessments take place during the final week of training.</p></div>
      <div className="sk-program-structure">{[[Lightbulb, 'Apply your learning', 'Take part in hackathons and practical activities that bring technical subjects to life.'], [Users, 'Experience industry', 'Industrial visits connect academic learning with real working environments.'], [BriefcaseBusiness, 'Build your next step', 'The program describes internship and placement-drive support after course completion.']].map(([Icon, title, text]) => <article key={title}><Icon size={25} strokeWidth={1.5} aria-hidden="true" /><h3>{title}</h3><p>{text}</p></article>)}</div>
      <TrainingTable records={studentRecords} type="student" />
    </section>

    <EnquiryPanel title="Learn more about Naanmudhalvan." description="Contact TANSAM for current program details, eligibility, and participation guidance." />
    <section className="sk-section sk-related" aria-labelledby="naan-related"><SectionHeading id="naan-related" title="Explore our other pathways." /><PathwayCards exclude="naanmudhalvan" compact /></section>
  </SkillingLayout>;
}
