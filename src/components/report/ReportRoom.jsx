import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

void motion

/**
 * Contenitore puramente presentazionale per le stanze verticali del report.
 * Lo scroll resta nativo: l'animazione segnala soltanto l'ingresso nel viewport.
 */
export default function ReportRoom({
  as = 'section',
  children,
  className = '',
  id,
  labelledBy,
}) {
  const reduceMotion = useReducedMotion()
  const MotionElement = motion[as] || motion.section

  return (
    <MotionElement
      id={id}
      className={`report-room ${className}`.trim()}
      aria-labelledby={labelledBy}
      initial={reduceMotion ? false : { y: 56, scale: 0.985 }}
      whileInView={reduceMotion ? undefined : { y: 0, scale: 1 }}
      viewport={{ amount: 0.08, once: false }}
      transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionElement>
  )
}
