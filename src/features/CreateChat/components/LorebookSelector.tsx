import React from 'react'
import type { Lorebook } from '@/core/types/chat'
import styles from './LorebookSelector.module.css'

interface LorebookSelectorProps {
  lorebooks: Lorebook[]
  selectedLorebookId: string
  onSelect: (id: string) => void
  onCreateClick?: () => void
  type?: 'all' | 'persona' | 'character' | 'fandom'
}

export const LorebookSelector: React.FC<LorebookSelectorProps> = ({ 
  lorebooks, 
  selectedLorebookId, 
  onSelect,
  onCreateClick,
  type = 'all'
}) => {
  const getLabel = (lib: Lorebook) => {
    if (lib.user_persona_id) return 'Личный'
    if (lib.character_id) return 'Персонаж'
    if (lib.fandom) return 'Фандом'
    return 'Общий'
  }

  const filteredLorebooks = lorebooks.filter(lib => {
    if (type === 'all') return true
    if (type === 'persona') return !!lib.user_persona_id
    if (type === 'character') return !!lib.character_id
    if (type === 'fandom') return !!lib.fandom
    return true
  })

  return (
    <div className={styles.formGroup}>
      <label className={styles.groupLabel}>Локальная база знаний (Lorebook)</label>
      <div className={styles.lorebookGrid}>
        {/* Create Button */}
        {onCreateClick && (
          <div className={styles.lorebookCardCreate} onClick={onCreateClick}>
            <div className={styles.lorebookCreateIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </div>
            <span className={styles.lorebookCreateLabel}>Создать новый</span>
          </div>
        )}

        {/* Real Lorebooks */}
        {filteredLorebooks.map(lib => (
          <div 
            key={lib.id} 
            className={`${styles.lorebookCard} ${selectedLorebookId === lib.id ? styles.isSelected : ''}`}
            onClick={() => onSelect(lib.id === selectedLorebookId ? '' : lib.id)}
          >
            <div className={styles.lorebookHeader}>
              <div className={styles.lorebookMeta}>
                <span className={styles.lorebookBadge}>{getLabel(lib)}</span>
                <span className={styles.lorebookName}>{lib.name}</span>
              </div>
              <span className={styles.lorebookCount}>{lib.entries_count || 0} зап.</span>
            </div>
            <p className={styles.lorebookDesc}>{lib.description || 'База знаний для погружения в мир.'}</p>
          </div>
        ))}
        {filteredLorebooks.length === 0 && (
          <p className={styles.emptyHint}>Нет доступных лорбуков данного типа.</p>
        )}
      </div>
    </div>
  )
}
