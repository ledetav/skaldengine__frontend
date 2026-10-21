import React from 'react'
import styles from './AdminProfileLayout.module.css'

interface AdminProfileLayoutProps {
  sidebar: React.ReactNode
  children: React.ReactNode
  className?: string
}

/**
 * 2-колоночный layout для всех профилей в Admin-панели.
 * sidebar — левая колонка (sticky), children — основной контент (правая)
 */
export function AdminProfileLayout({ sidebar, children, className = '' }: AdminProfileLayoutProps) {
  return (
    <div className={`${styles.layout} ${className}`}>
      <aside className={styles.sidebar}>
        {sidebar}
      </aside>
      <main className={styles.main}>
        {children}
      </main>
    </div>
  )
}
