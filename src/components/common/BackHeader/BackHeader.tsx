import React from 'react'
import styles from './BackHeader.module.css'

interface BackHeaderProps {
  onBack: () => void
  label?: string
  title: string
  actions?: React.ReactNode
}

export function BackHeader({ onBack, label, title, actions }: BackHeaderProps) {
  return (
    <header className={styles.backHeader}>
      <div className={styles.left}>
        <button className={styles.backBtn} onClick={onBack} aria-label="Назад">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
        </button>
        <div className={styles.titleGroup}>
          {label && <span className={styles.label}>{label}</span>}
          <h2 className={styles.title}>{title}</h2>
        </div>
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </header>
  )
}
