import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
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
        <Link to="/" className={styles.logo} aria-label="SkaldEngine Home">
          <span className={styles.logoIcon}>⚙</span>
          <span className={styles.logoText}>
            Skald<span className={styles.logoAccent}>Engine</span>
          </span>
        </Link>

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
          <Link to="/login" className={styles.btnSecondary} id="nav-login-btn">
            Войти
          </Link>
          <Link to="/register" className={styles.btnPrimary} id="nav-register-btn">
            Регистрация
          </Link>
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
            <Link to="/login" className={styles.btnSecondary} onClick={() => setMenuOpen(false)}>Войти</Link>
            <Link to="/register" className={styles.btnPrimary} onClick={() => setMenuOpen(false)}>Регистрация</Link>
          </div>
        </div>
      )}
    </header>
  )
}
