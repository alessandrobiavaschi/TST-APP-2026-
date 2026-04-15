import React from 'react'
import { motion } from 'framer-motion'

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
  }
}

const lineVariants = {
  hidden: { scaleX: 0, originX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: 0.4, delay: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }
  }
}

const stagger = {
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.15 }
  },
  hidden: {}
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 }
}

/**
 * Card hero con TST, linea, titolo, tagline e 3 CTA.
 * Props: onAccedi, onCreaAccount, onGuest (callback per i pulsanti)
 */
function HeroCard({ onAccedi, onCreaAccount, onGuest }) {
  return (
    <motion.div
      className="landing-hero-box landing-hero-box--card"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.section
        className="landing-hero-clean"
        aria-label="TST - Test Temperamentale"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        <h1 className="landing-hero-card-acronym">TST</h1>
        <motion.hr className="landing-hero-card-divider" variants={lineVariants} />
        <h2 className="landing-hero-clean-title">
          <motion.span className="landing-hero-clean-full" variants={itemVariants}>
            Test Temperamentale
          </motion.span>
          <motion.span className="landing-hero-clean-tagline" variants={itemVariants}>
            Per l&apos;auto-osservazione emotiva
          </motion.span>
        </h2>

        <motion.div className="landing-cta-clean" variants={stagger}>
          {onAccedi && (
            <motion.button
              type="button"
              className="landing-cta-btn landing-cta-btn--primary"
              variants={itemVariants}
              onClick={onAccedi}
              whileHover={{ scale: 1.02, boxShadow: '0 14px 36px rgba(111, 132, 105, 0.4)' }}
              whileTap={{ scale: 0.99 }}
            >
              Accedi all&apos;area operatori
            </motion.button>
          )}
          {onCreaAccount && (
            <motion.button
              type="button"
              className="landing-cta-btn landing-cta-btn--secondary"
              variants={itemVariants}
              onClick={onCreaAccount}
              whileHover={{ scale: 1.02, backgroundColor: 'var(--color-accent-green-soft)' }}
              whileTap={{ scale: 0.99 }}
            >
              Crea un account operatore
            </motion.button>
          )}
          {onGuest && (
            <motion.button
              type="button"
              className="landing-cta-btn landing-cta-btn--outline"
              variants={itemVariants}
              onClick={onGuest}
              whileHover={{ scale: 1.02, borderColor: 'var(--color-text-muted)' }}
              whileTap={{ scale: 0.99 }}
            >
              Fai il test senza accedere
            </motion.button>
          )}
        </motion.div>
      </motion.section>
    </motion.div>
  )
}

export default HeroCard
