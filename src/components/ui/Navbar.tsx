import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/core/contexts/AuthContext'
import styles from '@/theme/components/Navbar.module.css'

const NAV_LINKS = [
  { label: 'О системе', href: '/#about' },
  { label: 'Возможности', href: '/#features' },
  { label: 'Контакты', href: '/#footer' },
]

interface NavbarProps {
  variant?: 'landing' | 'dashboard'
}

export default function Navbar({ variant = 'landing' }: NavbarProps) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { user, logout } = useAuth()
  
  const isDebug = pathname.includes('/debug')
  // Helper to ensure links maintain debug mode if active
  const getDebugHref = (baseHref: string) => {
    if (!isDebug) return baseHref;
    // Don't append if already there
    if (baseHref.endsWith('/debug')) return baseHref;
    // Append /debug, considering trailing slash
    return baseHref.replace(/\/?$/, '/debug');
  }

  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const isDashboard = variant === 'dashboard'

  return (
    <header className={`${styles.navbar} ${scrolled || isDashboard ? styles.scrolled : ''} ${isDashboard ? styles.dashboardMode : ''}`}>
      <div className={styles.inner}>
        {/* Logo - Always on the Left */}
        <Link to={getDebugHref(isDashboard ? "/dashboard" : "/")} className={styles.logo} aria-label="SkaldEngine Home">
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
              <Link to={getDebugHref("/login")} className={styles.btnSecondary}>Войти</Link>
              <Link to={getDebugHref("/register")} className={styles.btnPrimary}>Регистрация</Link>
            </div>
          </>
        ) : (
          <div className={styles.dashboardActions}>
            <Link to={getDebugHref("/dashboard")} className={styles.navLink}>Персонажи</Link>

            {(user?.role === 'admin' || user?.role === 'moderator') && (
              <Link to={getDebugHref("/admin")} className={`${styles.navLink} ${styles.adminLink}`}>
                Перейти в админ. панель
              </Link>
            )}

            <Link to={getDebugHref("/chats")} className={styles.navLink}>Мои чаты</Link>
            <Link to={getDebugHref("/personas")} className={styles.navLink}>Мои персоны</Link>
            <Link to={getDebugHref("/lorebooks")} className={styles.navLink}>Мои лорбуки</Link>

            <div className={styles.userMenu}>
              <Link to={getDebugHref("/profile")} className={styles.profileLink}>
                <span className={styles.userName}>{user?.full_name || user?.username || 'Профиль'}</span>
                <div className={styles.avatarMini}>
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt="Avatar" className={styles.avatarImg} />
                  ) : (
                    (user?.full_name || user?.username || 'U').charAt(0).toUpperCase()
                  )}
                </div>
              </Link>
              <button onClick={handleLogout} className={styles.logoutBtn} title="Выйти">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              </button>
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
                <Link to={getDebugHref("/login")} className={styles.btnSecondary} onClick={() => setMenuOpen(false)}>Войти</Link>
                <Link to={getDebugHref("/register")} className={styles.btnPrimary} onClick={() => setMenuOpen(false)}>Регистрация</Link>
              </div>
            </>
          ) : (
            <div className={styles.mobileActions}>
              <Link to={getDebugHref("/dashboard")} className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Персонажи</Link>

              {(user?.role === 'admin' || user?.role === 'moderator') && (
                <Link to={getDebugHref("/admin")} className={`${styles.mobileLink} ${styles.adminLink}`} onClick={() => setMenuOpen(false)}>
                  Перейти в админ. панель
                </Link>
              )}

              <Link to={getDebugHref("/chats")} className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Мои чаты</Link>
              <Link to={getDebugHref("/personas")} className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Мои персоны</Link>
              <Link to={getDebugHref("/lorebooks")} className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Мои лорбуки</Link>

              <Link to={getDebugHref("/profile")} className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
                Профиль ({user?.full_name || user?.username || '...'})
              </Link>
              <div className={styles.mobileDivider} />
              <div className={styles.mobileLogout}>
                <button className={styles.btnSecondary} onClick={handleLogout}>Выйти</button>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
