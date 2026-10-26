import { Link } from 'react-router-dom'
import styles from '@/theme/components/Footer.module.css'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer id="footer" className={styles.footer} aria-label="Подвал сайта">
      <div className={styles.topGlow} aria-hidden="true" />

      <div className={styles.inner}>
        {/* Brand */}
        <div className={styles.brand}>
          <Link to="/" className={styles.logo} aria-label="SkaldEngine Home">
            <span className={styles.logoIcon}>⚙</span>
            <span>Skald<span className={styles.accent}>Engine</span></span>
          </Link>
          <p className={styles.tagline}>
            Интерактивная RPG-платформа нового поколения с ИИ-персонажами и ветвящимися нарративами.
          </p>
          <div className={styles.socials}>
            <a href="https://t.me/" target="_blank" rel="noopener noreferrer" className={styles.socialBtn} id="footer-telegram" aria-label="Telegram">
              <TelegramIcon />
            </a>
            <a href="https://github.com/" target="_blank" rel="noopener noreferrer" className={styles.socialBtn} id="footer-github" aria-label="GitHub">
              <GitHubIcon />
            </a>
            <a href="https://discord.com/" target="_blank" rel="noopener noreferrer" className={styles.socialBtn} id="footer-discord" aria-label="Discord">
              <DiscordIcon />
            </a>
          </div>
        </div>

        {/* Links */}
        <div className={styles.linksGroup}>
          <h3 className={styles.groupTitle}>Платформа</h3>
          <ul className={styles.linkList}>
            <li><a href="/#about" className={styles.link}>О системе</a></li>
            <li><a href="/#features" className={styles.link}>Возможности</a></li>
            <li><Link to="/register" className={styles.link}>Регистрация</Link></li>
            <li><Link to="/login" className={styles.link}>Войти</Link></li>
          </ul>
        </div>

        <div className={styles.linksGroup}>
          <h3 className={styles.groupTitle}>Правовое</h3>
          <ul className={styles.linkList}>
            <li><Link to="/privacy" className={styles.link}>Политика конфиденциальности</Link></li>
            <li><Link to="/terms" className={styles.link}>Условия использования</Link></li>
            <li><Link to="/age-check" className={styles.link}>Возрастные ограничения</Link></li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className={styles.bottom}>
        <span>© {year} SkaldEngine. Все права защищены.</span>
        <span className={styles.madeWith}>Сделано с ♥ на базе Polza.ai</span>
      </div>
    </footer>
  )
}

function TelegramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-2.04 9.613c-.153.674-.553.84-1.118.52l-3.085-2.27-1.486 1.43c-.165.165-.304.304-.623.304l.222-3.155 5.746-5.188c.25-.222-.055-.344-.384-.123L6.71 14.563 3.665 13.6c-.66-.206-.673-.66.138-.977l10.87-4.19c.548-.21 1.028.128.889.815z" />
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.1 3.3 9.42 7.87 10.95.575.1.79-.25.79-.555v-2.17c-3.2.695-3.875-1.54-3.875-1.54-.525-1.33-1.28-1.685-1.28-1.685-1.045-.715.08-.7.08-.7 1.155.08 1.765 1.185 1.765 1.185 1.025 1.76 2.695 1.25 3.35.955.1-.745.4-1.25.73-1.54-2.555-.29-5.24-1.275-5.24-5.67 0-1.255.445-2.28 1.18-3.085-.12-.29-.515-1.46.11-3.045 0 0 .965-.31 3.16 1.175.915-.255 1.9-.385 2.875-.39.975.005 1.955.135 2.875.39 2.195-1.485 3.155-1.175 3.155-1.175.63 1.585.235 2.755.115 3.045.735.805 1.18 1.83 1.18 3.085 0 4.405-2.69 5.375-5.25 5.66.41.355.78 1.055.78 2.125v3.15c0 .305.21.66.795.55C20.205 21.415 23.5 17.115 23.5 12 23.5 5.65 18.35.5 12 .5z" />
    </svg>
  )
}

function DiscordIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.032.055a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.04.001-.088-.041-.104a13.201 13.201 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  )
}
