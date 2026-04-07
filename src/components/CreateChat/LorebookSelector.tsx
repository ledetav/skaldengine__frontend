import React from 'react'
import type { Lorebook } from '../../types/chat'
import styles from './LorebookSelector.module.css'

interface LorebookSelectorProps {
  lorebooks: Lorebook[]
  selectedLorebookId: string
  onSelect: (id: string) => void
  onCreateClick?: () => void
}

export const LorebookSelector: React.FC<LorebookSelectorProps> = ({ 
  lorebooks, 
  selectedLorebookId, 
  onSelect,
  onCreateClick
}) => {
  return (
    <div className={styles.formGroup}>
      <label className={styles.groupLabel}>Локальная база знаний (Lorebook)</label>
      <div className={styles.lorebookGrid}>
        {/* Create Button */}
        <div className={styles.lorebookCardCreate} onClick={onCreateClick}>
          <div className={styles.lorebookCreateIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </div>
          <span className={styles.lorebookCreateLabel}>Создать новый</span>
        </div>

        {/* Real Lorebooks */}
        {lorebooks.map(lib => (
          <div 
            key={lib.id} 
            className={`${styles.lorebookCard} ${selectedLorebookId === lib.id ? styles.isSelected : ''}`}
            onClick={() => onSelect(lib.id === selectedLorebookId ? '' : lib.id)}
          >
            <div className={styles.lorebookHeader}>
              <span className={styles.lorebookName}>{lib.name}</span>
              <span className={styles.lorebookCount}>{lib.entries_count || 0} зап.</span>
            </div>
            <p className={styles.lorebookDesc}>{lib.description || 'База знаний для погружения в мир.'}</p>
          </div>
        ))}
        {lorebooks.length === 0 && (
          <p className={styles.emptyHint}>У вас пока нет созданных лорбуков.</p>
        )}
      </div>
    </div>
  )
}
