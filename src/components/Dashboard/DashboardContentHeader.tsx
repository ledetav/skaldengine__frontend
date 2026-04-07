import React from 'react'
import { CustomDropdown } from './CustomDropdown'
import styles from '../../styles/screens/Dashboard/DashboardScreen.module.css'

interface DashboardContentHeaderProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  resultsCount: number
  resultsLabel: string
  onOpenSidebar: () => void
  viewMode: 'grid' | 'list'
  setViewMode: (mode: 'grid' | 'list') => void
  sortBy: string
  setSortBy: (sort: string) => void
  sortOrder: 'asc' | 'desc'
  setSortOrder: (order: 'asc' | 'desc') => void
}

export const DashboardContentHeader: React.FC<DashboardContentHeaderProps> = ({
  searchQuery,
  setSearchQuery,
  resultsCount,
  resultsLabel,
  onOpenSidebar,
  viewMode,
  setViewMode,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder
}) => {
  return (
    <header className={styles.contentHeader}>
      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="Поиск персонажей..."
          className={styles.searchInput}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className={styles.resultsRow}>
        <h2 className={styles.resultsCount}>{resultsCount} {resultsLabel}</h2>
        <div className={styles.headerActions}>
          <button
            className={styles.mobileFilterToggle}
            onClick={onOpenSidebar}
            title="Фильтры"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" /><line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" /><line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" /><line x1="2" y1="14" x2="6" y2="14" /><line x1="10" y1="12" x2="14" y2="12" /><line x1="18" y1="16" x2="22" y2="16" /></svg>
          </button>
          <div className={styles.viewToggles}>
            <button
              className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.viewActive : ''}`}
              onClick={() => setViewMode('grid')}
            >
              ▤
            </button>
            <button
              className={`${styles.viewBtn} ${viewMode === 'list' ? styles.viewActive : ''}`}
              onClick={() => setViewMode('list')}
            >
              ☰
            </button>
          </div>
          <div className={styles.sortWrapper}>
            <span className={styles.sortLabel}>Сортировка:</span>
            <CustomDropdown
              variant="header"
              options={['По популярности', 'Сначала новые', 'А-Я']}
              value={sortBy}
              onChange={setSortBy}
            />
            <button
              className={`${styles.viewBtn} ${styles.sortOrderBtn}`}
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              title={sortOrder === 'desc' ? 'По убыванию' : 'По возрастанию'}
            >
              {sortOrder === 'desc' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="11" y1="5" x2="19" y2="5" /><line x1="11" y1="12" x2="16" y2="12" /><line x1="11" y1="19" x2="14" y2="19" /><path d="m3 12 3 3 3-3" /><path d="M6 5v10" /></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="11" y1="19" x2="19" y2="19" /><line x1="11" y1="12" x2="16" y2="12" /><line x1="11" y1="5" x2="14" y2="5" /><path d="m3 8 3-3 3 3" /><path d="M6 19V5" /></svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
