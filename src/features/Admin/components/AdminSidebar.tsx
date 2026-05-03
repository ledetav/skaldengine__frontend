import { useNavigate, useLocation } from 'react-router-dom'
import styles from '../styles'

export type AdminTab = 'users' | 'personas' | 'characters' | 'lorebooks_fandom' | 'lorebooks_character' | 'lorebooks_persona' | 'scenarios'

interface AdminSidebarProps {
  activeTab: AdminTab
  role?: string | null
}

const MODERATOR_HIDDEN: AdminTab[] = ['users', 'lorebooks_fandom', 'lorebooks_persona']

export function AdminSidebar({ activeTab, role }: AdminSidebarProps) {
  const allMenuItems: { id: AdminTab; label: string; route: string; icon: React.ReactNode; color: string }[] = [
    { 
      id: 'users', 
      label: 'Пользователи', 
      route: '/admin/users',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ), 
      color: 'var(--accent-blue, #3b82f6)' 
    },
    { 
      id: 'personas', 
      label: 'Персоны пользователей', 
      route: '/admin/personas',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M15 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ), 
      color: 'var(--accent-teal, #14b8a6)' 
    },
    { 
      id: 'characters', 
      label: 'Персонажи', 
      route: '/admin/characters',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
      ), 
      color: 'var(--accent-orange)' 
    },
    { 
      id: 'lorebooks_fandom', 
      label: 'Лорбуки фандомов', 
      route: '/admin/lorebooks/fandom',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
      ), 
      color: 'var(--accent-pink)' 
    },
    { 
      id: 'lorebooks_character', 
      label: 'Лорбуки персонажей', 
      route: '/admin/lorebooks/characters',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
        </svg>
      ), 
      color: 'var(--accent-purple)' 
    },
    { 
      id: 'lorebooks_persona', 
      label: 'Лорбуки персон', 
      route: '/admin/lorebooks/personas',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
        </svg>
      ), 
      color: 'var(--accent-green, #10b981)' 
    },
    { 
      id: 'scenarios', 
      label: 'Сценарии', 
      route: '/admin/scenarios',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ), 
      color: 'var(--accent-yellow, #eab308)' 
    },
  ]

  const menuItems = role === 'moderator'
    ? allMenuItems.filter(item => !MODERATOR_HIDDEN.includes(item.id))
    : allMenuItems

  const navigate = useNavigate()
  const { pathname } = useLocation()

  const handleNavigate = (route: string) => {
    // If we are currently in debug mode, and target route doesn't have it, append it
    const isDebug = pathname.includes('/debug')
    const finalRoute = isDebug && !route.endsWith('/debug') ? route.replace(/\/?$/, '/debug') : route
    navigate(finalRoute)
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <div className={styles.logoBadge}>⚙</div>
        <div className={styles.logoTextWrapper}>
          <div className={styles.sidebarTitle}>
            Skald<span className={styles.logoAccent}>Engine</span>
          </div>
          <div className={styles.sidebarSubtitle}>admin</div>
        </div>
      </div>
      
      <nav className={styles.sidebarNav}>
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`${styles.navItem} ${activeTab === item.id ? styles.activeNavItem : ''}`}
            onClick={() => handleNavigate(item.route)}
            style={{ '--item-accent': item.color } as React.CSSProperties}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            <span className={styles.navLabel}>{item.label}</span>
            {activeTab === item.id && <div className={styles.activeIndicator} />}
          </button>
        ))}
      </nav>

      <div className={styles.sidebarFooter}>
        <button
          className={styles.backHomeBtn}
          onClick={() => navigate('/dashboard')}
          title="Назад на главную"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span className={styles.backHomeBtnLabel}>Назад на главную</span>
        </button>
      </div>
    </aside>
  )
}
