
import styles from './FilterButton.module.css'

interface FilterButtonProps {
  isActive?: boolean
  onClick?: () => void
  className?: string
}

export function FilterButton({ isActive = false, onClick, className = '' }: FilterButtonProps) {
  return (
    <button
      className={`${styles.btn} ${isActive ? styles.active : ''} ${className}`}
      onClick={onClick}
      title={isActive ? 'Фильтры активны' : 'Открыть фильтры'}
      aria-label="Открыть фильтры"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
      </svg>
      {isActive && <span className={styles.dot} aria-hidden="true" />}
    </button>
  )
}
