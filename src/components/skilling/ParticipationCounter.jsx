/*!
 * Adapted from React Bits Counter by David Haz (copyright 2026).
 * https://github.com/DavidHDev/react-bits/tree/main/src/content/Components/Counter
 * MIT + Commons Clause; see ReactBitsCounter.LICENSE.txt.
 */
import { useEffect } from 'react';
import { motion, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import './ParticipationCounter.css';

const formatter = new Intl.NumberFormat('en-US');

function RollingNumber({ spring, digit }) {
  const y = useTransform(spring, latest => {
    const placeValue = latest % 10;
    let offset = (10 + digit - placeValue) % 10;
    if (offset > 5) offset -= 10;
    // Percentages follow the existing font size at browser zoom and avoid
    // measuring pixels for each wheel. Each number fills the digit slot.
    return `${offset * 100}%`;
  });
  return <motion.span className="participation-counter-number" style={{ y }}>{digit}</motion.span>;
}

function Digit({ place, value }) {
  const target = Math.floor(value / place);
  const spring = useSpring(target, { stiffness: 200, damping: 30, restDelta: .001, restSpeed: .001 });
  useEffect(() => { spring.set(target); }, [spring, target]);
  return <span className="participation-counter-digit" data-counter-place={place}>
    {Array.from({ length: 10 }, (_, digit) => <RollingNumber key={digit} spring={spring} digit={digit} />)}
  </span>;
}

export default function ParticipationCounter({ value }) {
  const reducedMotion = useReducedMotion();
  const formatted = formatter.format(value);
  let remainingDigits = String(value).length;

  return <span className="participation-counter" aria-hidden="true" data-counter-value={value}>
    {reducedMotion ? formatted : [...formatted].map((character, index) => {
      if (character === ',') return <span key={`comma-${index}`} className="participation-counter-separator">,</span>;
      const place = 10 ** (--remainingDigits);
      return <Digit key={place} place={place} value={value} />;
    })}
  </span>;
}
