import React from 'react'
import styles from './Pagination.module.css'

interface PaginationProps {
  currentPage: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
}

export function Pagination({ currentPage, totalItems, pageSize, onPageChange }: PaginationProps): React.JSX.Element | null {
  const totalPages = Math.ceil(totalItems / pageSize)
  
  if (!totalPages || totalPages <= 1 || isNaN(totalPages)) return null

  const start = Math.max(1, currentPage - 2)
  const end = Math.min(totalPages, start + 4)
  const pages = []
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return (
    <div className={styles.pagination}>
      <button 
        className={styles.pageBtn} 
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        &lt;
      </button>
      
      {start > 1 && (
        <>
          <button className={styles.pageBtn} onClick={() => onPageChange(1)}>1</button>
          {start > 2 && <span className={styles.sep}>...</span>}
        </>
      )}

      {pages.map(p => (
        <button 
          key={p} 
          className={`${styles.pageBtn} ${currentPage === p ? styles.active : ''}`}
          onClick={() => onPageChange(p)}
        >
          {p}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className={styles.sep}>...</span>}
          <button className={styles.pageBtn} onClick={() => onPageChange(totalPages)}>{totalPages}</button>
        </>
      )}

      <button 
        className={styles.pageBtn} 
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        &gt;
      </button>
    </div>
  )
}
