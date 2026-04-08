import React from 'react'
import styles from './Sidebar.module.css'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export function Sidebar({ isOpen, onClose, children }: SidebarProps) {
  return (
    <aside className={`${styles.sidebar} ${!isOpen ? styles.sidebarClosed : ''}`}>
      <button 
        className={styles.closeSidebarBtn} 
        onClick={onClose}
        title="Скрыть панель"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {children}
    </aside>
  )
}
