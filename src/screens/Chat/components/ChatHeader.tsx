import { Link } from 'react-router-dom'
import styles from './ChatHeader.module.css'

interface ChatHeaderProps {
  title: string
  isGenerating: boolean
  lastSaved: Date
  isSidebarOpen: boolean
  onToggleSidebar: () => void
}

export function ChatHeader({ title, isGenerating, lastSaved, isSidebarOpen, onToggleSidebar }: ChatHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <Link to="/dashboard" className={styles.backBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          <span>В хаб</span>
        </Link>
        <div className={styles.chatInfo}>
          <h1 className={styles.chatTitle}>
            {title || 'Загрузка...'}
          </h1>
          <div className={styles.saveStatus}>
            <span className={styles.saveTime}>
              {isGenerating ? 'Skald пишет...' : `Сохранено: ${lastSaved.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`}
            </span>
            <div className={styles.infoWrapper}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              <div className={styles.saveTooltip}>
                Все изменения сохраняются автоматически
              </div>
            </div>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button 
            className={`${styles.actionBtn} ${isSidebarOpen ? styles.actionActive : ''}`} 
            onClick={onToggleSidebar}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="15" y1="3" x2="15" y2="21"/>
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}
