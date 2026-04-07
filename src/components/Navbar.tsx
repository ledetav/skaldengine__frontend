import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../api/auth'
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
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    
    if (variant === 'dashboard') {
      authApi.getMe()
        .then(data => setUser(data))
        .catch(err => {
          console.error('Failed to fetch user:', err)
          // Optionally logout if token is invalid
        })
    }

    return () => window.removeEventListener('scroll', onScroll)
  }, [variant])

  const handleLogout = () => {
    localStorage.removeItem('token')
    window.dispatchEvent(new Event('auth-change'))
    navigate('/')
  }

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
              <span className={styles.userName}>{user?.username || 'Загрузка...'}</span>
              <div className={styles.avatarMini}>
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="Avatar" className={styles.avatarImg} />
                ) : (
                  user?.username?.charAt(0).toUpperCase() || 'U'
                )}
              </div>
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
                <Link to="/login" className={styles.btnSecondary} onClick={() => setMenuOpen(false)}>Войти</Link>
                <Link to="/register" className={styles.btnPrimary} onClick={() => setMenuOpen(false)}>Регистрация</Link>
              </div>
            </>
          ) : (
            <div className={styles.mobileActions}>
              <Link to="/chats" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Мои чаты</Link>
              <Link to="/profile" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
                Профиль ({user?.username || '...'})
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
