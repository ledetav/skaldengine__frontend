import { useState, useEffect, useRef } from 'react'
import styles from '../../../styles/screens/Landing/HeroSection.module.css'

const TYPEWRITER_PHRASES = [
  'Расскажи свою историю...',
  'Выбери свой путь...',
  'Окунись в новый мир...',
  'Раскрой творческий потенциал...',
]

export default function HeroSection() {
  const [displayText, setDisplayText] = useState('')
  const [phraseIdx, setPhraseIdx] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const current = TYPEWRITER_PHRASES[phraseIdx]

    if (isPaused) {
      timerRef.current = setTimeout(() => {
        setIsPaused(false)
        setIsDeleting(true)
      }, 2000)
      return
    }

    if (isDeleting) {
      if (displayText.length === 0) {
        setIsDeleting(false)
        setPhraseIdx(i => (i + 1) % TYPEWRITER_PHRASES.length)
        return
      }
      timerRef.current = setTimeout(() => {
        setDisplayText(t => t.slice(0, -1))
      }, 40)
    } else {
      if (displayText.length === current.length) {
        setIsPaused(true)
        return
      }
      timerRef.current = setTimeout(() => {
        setDisplayText(current.slice(0, displayText.length + 1))
      }, 80)
    }

    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [displayText, phraseIdx, isDeleting, isPaused])

  return (
    <section id="hero" className={styles.hero} aria-labelledby="hero-heading">
      {/* Background */}
      <div className={styles.bg}>
        <div className={styles.bgOverlay} />
        <div className={styles.bgGrid} aria-hidden="true" />
      </div>

      {/* Orbs */}
      <div className={`${styles.orb} ${styles.orbCyan}`}   aria-hidden="true" />
      <div className={`${styles.orb} ${styles.orbFuchsia}`} aria-hidden="true" />
      <div className={`${styles.orb} ${styles.orbIndigo}`}  aria-hidden="true" />

      {/* Content */}
      <div className={styles.content}>

        <h1 id="hero-heading" className={styles.heading}>
          <span className={styles.headingTop}>SkaldEngine</span>
          <span className={styles.typewriterWrap} aria-live="polite">
            <span className={styles.typewriter}>{displayText}</span>
            <span className={styles.cursor} aria-hidden="true">|</span>
          </span>
        </h1>

        <p className={styles.sub}>
          Живите историями, которые сделаете вы сами. Здесь ваши напарники помнят каждое ваше слово, а сюжет адаптируется к любому, даже самому смелому решению. Ваше воображение — единственный предел.
        </p>

        <div className={styles.ctas}>
          <a href="/register" id="hero-cta-register" className={styles.ctaPrimary}>
            <span>Начать бесплатно</span>
            <span className={styles.ctaArrow}>→</span>
          </a>
          <a href="#about" id="hero-cta-about" className={styles.ctaSecondary}>
            Узнать больше
          </a>
        </div>

        {/* Features bar */}
        <div className={styles.stats} aria-label="Преимущества SkaldEngine">
          {[
            'Без амнезии.',
            'Без деперсонализации.',
            'Без галлюцинаций.',
          ].map(feature => (
            <div key={feature} className={styles.stat}>
              <span className={styles.statValue}>{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <a href="#about" className={styles.scrollHint} aria-label="Прокрутить вниз">
        <span className={styles.scrollDot} />
      </a>
    </section>
  )
}
