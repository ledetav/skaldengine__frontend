import React from 'react'
import type { GameModeType, Lorebook } from '@/core/types/chat'
import { LorebookSelector } from './LorebookSelector'
import styles from './AcquaintanceSection.module.css'

interface AcquaintanceSectionProps {
  areAcquainted: boolean
  relationshipDesc: string
  gameMode: GameModeType
  onToggle: (val: boolean) => void
  onDescChange: (val: string) => void
  lorebooks: Lorebook[]
  selectedLorebookId: string
  onLorebookSelect: (id: string) => void
  onCreateLorebook?: () => void
}

export const AcquaintanceSection: React.FC<AcquaintanceSectionProps> = ({
  areAcquainted,
  relationshipDesc,
  gameMode,
  onToggle,
  onDescChange,
  lorebooks,
  selectedLorebookId,
  onLorebookSelect,
  onCreateLorebook
}) => {
  return (
    <div className={styles.acquaintanceSection}>
      <div 
        className={`${styles.toggleCard} ${areAcquainted ? styles.isActive : ''} ${gameMode === 'scenario' ? styles.isScenarioMode : ''}`}
        onClick={() => onToggle(!areAcquainted)}
      >
        <div className={styles.toggleText}>
          <h4>Персонажи знакомы?</h4>
          <p>Включите, если герои уже встречались ранее или имеют общую историю.</p>
        </div>
        <div className={styles.toggleSwitch}>
          <div className={styles.toggleThumb} />
        </div>
      </div>

      {areAcquainted && (
        <div className={styles.acquaintedFields}>
          <div className={styles.formGroup}>
            <label className={styles.groupLabel}>Отношения персонажей</label>
            <textarea 
              className={`${styles.textarea} ${gameMode === 'scenario' ? styles.focusScenario : ''}`}
              placeholder="Опишите кратко: старые друзья, заклятые враги или может быть... случайные попутчики?"
              value={relationshipDesc}
              onChange={(e) => onDescChange(e.target.value)}
            />
          </div>
          <LorebookSelector 
            lorebooks={lorebooks}
            selectedLorebookId={selectedLorebookId}
            onSelect={onLorebookSelect}
            onCreateClick={onCreateLorebook}
          />
        </div>
      )}
    </div>
  )
}
