import React from 'react'
import type { Scenario } from '@/core/types/chat'
import styles from './ScenarioSelector.module.css'

interface ScenarioSelectorProps {
  scenarios: Scenario[]
  selectedScenarioId: string
  onSelect: (id: string) => void
  onCreateClick?: () => void
}

export const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({ 
  scenarios, 
  selectedScenarioId, 
  onSelect,
  onCreateClick
}) => {
  return (
    <div className={styles.formGroup}>
      <label className={styles.groupLabel}>Выберите сюжет (Сценарий)</label>
      <div className={styles.lorebookGrid}>
        {/* Create Button */}
        <div className={styles.lorebookCardCreate} onClick={onCreateClick}>
          <div className={styles.lorebookCreateIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L4 2l3.5 12.5L11 16l1 1"/><path d="M2 22l5-5"/><path d="M8 14l-4 4"/></svg>
          </div>
          <span className={styles.lorebookCreateLabel}>Создать сюжет</span>
        </div>

        {/* Real Scenarios */}
        {scenarios.map(scen => (
          <div 
            key={scen.id} 
            className={`${styles.lorebookCard} ${selectedScenarioId === scen.id ? styles.isSelectedScenario : ''}`}
            onClick={() => onSelect(scen.id)}
          >
            <div className={styles.lorebookHeader}>
              <span className={styles.lorebookName}>{scen.title}</span>
            </div>
            <p className={styles.lorebookDesc}>{scen.description}</p>
          </div>
        ))}
        {scenarios.length === 0 && (
          <p className={styles.emptyHint}>Для этого персонажа пока нет сценариев.</p>
        )}
      </div>
    </div>
  )
}
