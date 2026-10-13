import React, { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'

/**
 * Rivelazione del contenuto legata allo scroll, condivisa da tutte le stanze
 * del report. Stessa formula già usata per la stanza Quattro Rapporti: il
 * contenuto prende opacità/posizione mentre la stanza entra nel viewport.
 */
export default function RoomRevealContent({ children, className = '', id, style, as = 'div', ...rest }) {
  const ref = useRef(null)
  const reduceMotion = useReducedMotion()
  const MotionTag = motion[as] || motion.div

  const { scrollYProgress: enter } = useScroll({
    target: ref,
    offset: ['start 80%', 'start 35%'],
  })
  const { scrollYProgress: exit } = useScroll({
    target: ref,
    offset: ['end 8%', 'end 0%'],
  })
  const lightProgress = useTransform([enter, exit], ([enterValue, exitValue]) =>
    Math.min(1, Math.max(0, enterValue - exitValue)),
  )

  const opacity = useTransform(lightProgress, [0, 0.6], [0, 1])
  const y = useTransform(lightProgress, [0, 0.6], [16, 0])

  return (
    <MotionTag
      id={id}
      ref={ref}
      className={className}
      style={reduceMotion ? style : { ...style, opacity, y }}
      {...rest}
    >
      {children}
    </MotionTag>
  )
}
