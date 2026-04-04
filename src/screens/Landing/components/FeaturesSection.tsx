import { Link } from 'react-router-dom'
import styles from '../../../styles/screens/Landing/FeaturesSection.module.css'

const FEATURES = [
  {
    id: 'branching',
    icon: (
      <svg width="84" height="84" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
        <line x1="6" y1="3" x2="6" y2="15" />
        <circle cx="18" cy="6" r="3" />
        <circle cx="6" cy="18" r="3" />
        <path d="M18 9a9 9 0 0 1-9 9" />
      </svg>
    ),
    color: 'orange',
    tag: 'Повествование',
    title: 'Художественный текст',
    description:
      'В отличие от систем, сфокусированных на коротких диалогах, мы сосредоточены на создании художественного текста. Это значит, что каждая сцена будет пропитана деталями: от описания окружения до эмоций героев.',
  },
  {
    id: 'memory',
    icon: (
      <svg width="84" height="84" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04z" />
        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04z" />
      </svg>
    ),
    color: 'fuchsia',
    tag: 'Память',
    title: 'Долгосрочная память',
    description:
      'Система вечно хранит детали мира от базовых законов выбранной вселенной до конкретных событий внутри чата. ИИ помнит все, что происходит в истории, и использует эти знания постоянно, когда пишет вам ответ.',
  },
  {
    id: 'personas',
    icon: (
      <svg width="84" height="84" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    color: 'purple',
    tag: 'Кастомизация',
    title: 'Персоны пользователя',
    description:
      'Создавайте героев для вашего отыгрыша, чтобы дать ИИ подсказку, как с вами взаимодействовать и какие между вами и персонажем отношения.',
  },
]

export default function FeaturesSection() {
  return (
    <section id="features" className={styles.section} aria-labelledby="features-heading">
      {/* Section Header */}
      <div className={styles.header}>
        <span className={styles.eyebrow}>Фундамент системы</span>
        <h2 id="features-heading" className={styles.title}>
          Больше чем{' '}
          <span className={styles.highlight}>просто нейросеть</span>
        </h2>
        <p className={styles.subtitle}>
          Мы создаем пространство для по-настоящему взрослого и осмысленного отыгрыша, пробуждая ностальгию по текстовым ролевым форумам нашего детства.
        </p>
      </div>

      {/* Feature Cards */}
      <div className={styles.grid}>
        {FEATURES.map((f, i) => (
          <article
            key={f.id}
            id={`feature-${f.id}`}
            className={`${styles.card} ${styles[`card-${f.color}`]}`}
            style={{ animationDelay: `${i * 0.12}s` }}
          >
            <div className={styles.cardImg}>
              <div className={styles.iconWrapper}>
                {f.icon}
              </div>
              <div className={`${styles.imgGlow} ${styles[`glow-${f.color}`]}`} />
            </div>

            <div className={styles.cardBody}>
              <span className={`${styles.tag} ${styles[`tag-${f.color}`]}`}>{f.tag}</span>
              <h3 className={styles.cardTitle}>{f.title}</h3>
              <p className={styles.cardDesc}>{f.description}</p>
            </div>
          </article>
        ))}
      </div>

      {/* CTA Banner */}
      <div className={styles.ctaBanner}>
        <div className={styles.bannerGlow} aria-hidden="true" />
        <div className={styles.bannerContent}>
          <h3 className={styles.bannerTitle}>Готов начать своё приключение?</h3>
          <p className={styles.bannerSub}>Регистрация бесплатная. Точно-точно.</p>
          <Link to="/register" id="features-cta-register" className={styles.bannerCta}>
            Создать аккаунт <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
