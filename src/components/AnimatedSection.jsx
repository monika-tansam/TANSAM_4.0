import React from 'react';
import { motion } from 'framer-motion';

export default function AnimatedSection({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, rotateX: 15, scale: 0.95, y: 40 }}
      whileInView={{ opacity: 1, rotateX: 0, scale: 1, y: 0 }}
      viewport={{ once: false, amount: 0.1 }}
      transition={{ duration: 0.7, type: 'spring', bounce: 0.3 }}
      style={{ perspective: 1200 }}
    >
      {children}
    </motion.div>
  );
}
