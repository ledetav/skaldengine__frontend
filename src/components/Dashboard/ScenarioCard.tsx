import React from 'react'
import type { Scenario } from '../../types/character'
import styles from '../../styles/screens/Dashboard/DashboardScreen.module.css'

interface ScenarioCardProps {
  scenario: Scenario
}

export const ScenarioCard: React.FC<ScenarioCardProps> = ({ scenario }) => {
  const isHot = Math.random() > 0.5
  
  return (
    <div className={styles.scenarioCard}>
      <div className={styles.scenarioBadgeFloating}>
        {isHot ? 'Hot!' : 'New!'}
      </div>
      <div className={styles.scenarioContent}>
        <h4 className={styles.scenarioTitle}>{scenario.title}</h4>
        <p className={styles.scenarioDesc}>{scenario.description}</p>
      </div>
      <div className={styles.scenarioFooter}>
        <span className={styles.scenarioBadge}>Сценарий</span>
      </div>
    </div>
  )
}
