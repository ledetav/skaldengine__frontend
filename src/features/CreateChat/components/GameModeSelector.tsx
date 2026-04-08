import React from 'react'
import type { GameModeType } from '@/core/types/chat'
import styles from './GameModeSelector.module.css'

interface GameMode {
  id: GameModeType
  title: string
  description: string
}

interface GameModeSelectorProps {
  modes: GameMode[]
  selectedMode: GameModeType
  onModeChange: (mode: GameModeType) => void
}

export const GameModeSelector: React.FC<GameModeSelectorProps> = ({ 
  modes, 
  selectedMode, 
  onModeChange 
}) => {
  return (
    <div className={styles.formGroup}>
      <label className={styles.groupLabel}>Режим</label>
      <div className={styles.gameModeGrid}>
        {modes.map(mode => (
          <div 
            key={mode.id}
            className={`
              ${styles.gameModeCard} 
              ${mode.id === 'sandbox' ? styles.isSandboxCard : styles.isScenarioCard}
              ${selectedMode === mode.id ? (mode.id === 'sandbox' ? styles.isSandboxSelected : styles.isScenarioSelected) : ''}
            `}
            onClick={() => onModeChange(mode.id)}
          >
            <h3>
              {mode.id === 'sandbox' ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 12c-2-2.67-4-4-6-4a4 4 0 0 0 0 8c2 0 4-1.33 6-4zm0 0c2 2.67 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.33-6 4z"/></svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
              )}
              {mode.title}
            </h3>
            <p>{mode.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
