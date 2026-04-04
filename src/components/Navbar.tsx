import { useState, useEffect } from 'react'
import styles from '../styles/components/Navbar.module.css'

const NAV_LINKS = [
  { label: 'О системе', href: '#about' },
  { label: 'Возможности', href: '#features' },
  { label: 'Контакты', href: '#footer' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.inner}>
        {/* Logo */}
        <a href="#" className={styles.logo} aria-label="SkaldEngine Home">
          <span className={styles.logoIcon}>⚙</span>
          <span className={styles.logoText}>
            Skald<span className={styles.logoAccent}>Engine</span>
          </span>
        </a>

        {/* Desktop Nav */}
        <nav className={styles.nav} aria-label="Основная навигация">
          {NAV_LINKS.map(link => (
            <a key={link.href} href={link.href} className={styles.navLink}>
              {link.label}
            </a>
          ))}
        </nav>

        {/* CTA Buttons */}
        <div className={styles.actions}>
          <a href="/login" className={styles.btnSecondary} id="nav-login-btn">
            Войти
          </a>
          <a href="/register" className={styles.btnPrimary} id="nav-register-btn">
            Регистрация
          </a>
        </div>

        {/* Mobile Burger */}
        <button
          className={`${styles.burger} ${menuOpen ? styles.active : ''}`}
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Открыть меню"
          aria-expanded={menuOpen}
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          {NAV_LINKS.map(link => (
            <a
              key={link.href}
              href={link.href}
              className={styles.mobileLink}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className={styles.mobileActions}>
            <a href="/login" className={styles.btnSecondary}>Войти</a>
            <a href="/register" className={styles.btnPrimary}>Регистрация</a>
          </div>
        </div>
      )}
    </header>
  )
}
