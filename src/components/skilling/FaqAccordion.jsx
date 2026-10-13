import { Plus } from 'lucide-react';

export default function FaqAccordion({ items }) {
  return <div className="sk-faqs">{items.map(([question, answer]) => (
    <details key={question} className="sk-faq">
      <summary>{question}<Plus size={19} aria-hidden="true" /></summary>
      <div className="sk-faq-answer"><p>{answer}</p></div>
    </details>
  ))}</div>;
}
