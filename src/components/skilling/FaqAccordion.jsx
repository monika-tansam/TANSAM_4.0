import { useId, useState } from 'react';
import { Plus } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

export default function FaqAccordion({ items }) {
  const id = useId();
  const [openQuestion, setOpenQuestion] = useState(null);
  const reducedMotion = useReducedMotion();

  return <div className="sk-faqs">{items.map(([question, answer], index) => {
    const isOpen = openQuestion === question;
    const questionId = `${id}-${index}-question`;
    const answerId = `${id}-${index}-answer`;

    return <div key={question} className="sk-faq">
      <h3><button type="button" className="sk-faq-trigger" id={questionId}
        aria-expanded={isOpen} aria-controls={answerId}
        onClick={() => setOpenQuestion(current => current === question ? null : question)}>
        {question}<Plus size={19} aria-hidden="true" />
      </button></h3>
      <motion.div id={answerId} className="sk-faq-panel" role="region"
        aria-labelledby={questionId} aria-hidden={!isOpen} inert={!isOpen}
        initial={false} animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: reducedMotion ? 0 : .3, ease: [.22, 1, .36, 1] }}>
        <div className="sk-faq-answer"><p>{answer}</p></div>
      </motion.div>
    </div>;
  })}</div>;
}
