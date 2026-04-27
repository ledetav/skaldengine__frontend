import React from 'react'
import type { GameModeType, Lorebook } from '@/core/types/chat'
import type { Character } from '@/core/types/character'
import type { UserProfile } from '@/core/types/profile'
import { LorebookSelector } from './LorebookSelector'
import styles from './AcquaintanceSection.module.css'

interface AcquaintanceSectionProps {
  areAcquainted: boolean
  relationshipDesc: string
  gameMode: GameModeType
  onToggle: (val: boolean) => void
  onDescChange: (val: string) => void
  customLocation: string
  customPlotHook: string
  onLocationChange: (val: string) => void
  onPlotHookChange: (val: string) => void
  lorebooks: Lorebook[]
  selectedLorebookId: string
  onLorebookSelect: (id: string) => void
  onCreateLorebook?: () => void
  currentUser: UserProfile | null
  currentCharacter?: Character | null
}

export const AcquaintanceSection: React.FC<AcquaintanceSectionProps> = ({
  areAcquainted,
  relationshipDesc,
  gameMode,
  onToggle,
  onDescChange,
  customLocation,
  customPlotHook,
  onLocationChange,
  onPlotHookChange,
  lorebooks,
  selectedLorebookId,
  onLorebookSelect,
  onCreateLorebook,
  currentUser,
  currentCharacter
}) => {
  const isAdmin = currentUser?.role === 'admin'
  const isModerator = currentUser?.role === 'moderator'
  const isSandbox = gameMode === 'sandbox'

  const filteredLorebooks = lorebooks.filter(lib => {
    // Admins see everything
    if (isAdmin) return true
    
    // Moderators see character lorebooks only if they created the character
    if (isModerator) {
      if (lib.character_id) {
         return currentCharacter?.creator_id === currentUser?.id
      }
      return true // See others (fandom/etc)? User didn't specify, assuming yes or just character filter
    }

    // Ordinary users see ONLY their own persona lorebooks
    if (lib.user_persona_id) return true
    
    return false
  })

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

      {isSandbox && (
        <div className={styles.sandboxAddons}>
          <div className={styles.formGroup}>
            <label className={styles.groupLabel}>Локация (где вы?)</label>
            <input 
              type="text"
              className={styles.input}
              placeholder="Например: Старая таверна, Заснеженный лес..."
              value={customLocation}
              onChange={(e) => onLocationChange(e.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.groupLabel}>Стартовая завязка (опционально)</label>
            <textarea 
              className={styles.textarea}
              placeholder="Опишите начало: 'Вы проснулись в кандалах...', 'Вас преследует стража...'"
              value={customPlotHook}
              onChange={(e) => onPlotHookChange(e.target.value)}
            />
          </div>
        </div>
      )}

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
            lorebooks={filteredLorebooks}
            selectedLorebookId={selectedLorebookId}
            onSelect={onLorebookSelect}
            onCreateClick={onCreateLorebook}
          />
        </div>
      )}
    </div>
  )
}
