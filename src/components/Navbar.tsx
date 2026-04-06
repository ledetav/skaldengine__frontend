import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import styles from '../styles/components/Navbar.module.css'

const NAV_LINKS = [
  { label: 'О системе', href: '#about' },
  { label: 'Возможности', href: '#features' },
  { label: 'Контакты', href: '#footer' },
]

interface NavbarProps {
  variant?: 'landing' | 'dashboard'
}

export default function Navbar({ variant = 'landing' }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isDashboard = variant === 'dashboard'

  return (
    <header className={`${styles.navbar} ${scrolled || isDashboard ? styles.scrolled : ''} ${isDashboard ? styles.dashboardMode : ''}`}>
      <div className={styles.inner}>
        {/* Logo - Always on the Left */}
        <Link to={isDashboard ? "/dashboard" : "/"} className={styles.logo} aria-label="SkaldEngine Home">
          <span className={styles.logoIcon}>⚙</span>
          <span className={styles.logoText}>
            Skald<span className={styles.logoAccent}>Engine</span>
          </span>
        </Link>

        {/* Desktop Nav Tools */}
        {!isDashboard ? (
          <>
            <nav className={styles.nav} aria-label="Основная навигация">
              {NAV_LINKS.map(link => (
                <a key={link.href} href={link.href} className={styles.navLink}>
                  {link.label}
                </a>
              ))}
            </nav>
            <div className={styles.actions}>
              <Link to="/login" className={styles.btnSecondary}>Войти</Link>
              <Link to="/register" className={styles.btnPrimary}>Регистрация</Link>
            </div>
          </>
        ) : (
          <div className={styles.dashboardActions}>
            <Link to="/chats" className={styles.navLink}>Мои чаты</Link>
            <div className={styles.userMenu}>
              <span className={styles.userName}>Профиль юзера</span>
              <div className={styles.avatarMini}>U</div>
            </div>
          </div>
        )}

        {/* Burger Button */}
        <button
          className={`${styles.burger} ${menuOpen ? styles.active : ''}`}
          onClick={() => setMenuOpen(v => !v)}
        >
          <span /><span /><span />
        </button>
      </div>

      {menuOpen && (
        <div className={styles.mobileMenu}>
          {!isDashboard ? (
            <>
              {NAV_LINKS.map(link => (
                <a key={link.href} href={link.href} className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
                  {link.label}
                </a>
              ))}
              <div className={styles.mobileActions}>
                <Link to="/login" className={styles.btnSecondary} onClick={() => setMenuOpen(false)}>Войти</Link>
                <Link to="/register" className={styles.btnPrimary} onClick={() => setMenuOpen(false)}>Регистрация</Link>
              </div>
            </>
          ) : (
            <div className={styles.mobileActions}>
              <Link to="/chats" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Мои чаты</Link>
              <Link to="/profile" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Профиль юзера</Link>
              <div className={styles.mobileDivider} />
              {/* Note: Filters will be added here or handled separately */}
              <div className={styles.mobileLogout}>
                <Link to="/login" className={styles.btnSecondary} onClick={() => setMenuOpen(false)}>Выйти</Link>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
