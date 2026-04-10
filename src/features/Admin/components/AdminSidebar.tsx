import React from 'react'
import styles from '../Admin.module.css'

export type AdminTab = 'characters' | 'lorebooks_fandom' | 'lorebooks_character'

interface AdminSidebarProps {
  activeTab: AdminTab
  setActiveTab: (tab: AdminTab) => void
}

export function AdminSidebar({ activeTab, setActiveTab }: AdminSidebarProps) {
  const menuItems: { id: AdminTab; label: string; icon: React.ReactNode; color: string }[] = [
    { 
      id: 'characters', 
      label: 'Персонажи', 
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
      ), 
      color: 'var(--accent-orange)' 
    },
    { 
      id: 'lorebooks_fandom', 
      label: 'Лорбуки миров', 
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
      ), 
      color: 'var(--accent-pink)' 
    },
    { 
      id: 'lorebooks_character', 
      label: 'Лорбуки героев', 
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
        </svg>
      ), 
      color: 'var(--accent-purple)' 
    },
  ]

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
            onClick={() => setActiveTab(item.id)}
            style={{ '--item-accent': item.color } as React.CSSProperties}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            <span className={styles.navLabel}>{item.label}</span>
            {activeTab === item.id && <div className={styles.activeIndicator} />}
          </button>
        ))}
      </nav>

      <div className={styles.sidebarFooter}>
        <div className={styles.systemStatus}>
          <div className={styles.statusDot} />
          <span>Система активна</span>
        </div>
      </div>
    </aside>
  )
}
