import { Link } from 'react-router-dom'
import styles from './Sections.module.css'

export function ProfileSection() {
  return (
    <div className={styles.sidebarSection}>
      <Link to="/profile" className={styles.profileBtn}>
        <div className={styles.profileAvatar}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
        <div className={styles.profileText}>
          <span className={styles.profileName}>Вы</span>
          <div className={styles.profileAction}>
            <span>Перейти в профиль</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </div>
        </div>
      </Link>
    </div>
  )
}

import type { Scenario, Checkpoint } from '@/core/types/chat'

export function ScenarioSection({ 
  scenario, 
  checkpoints 
}: { 
  scenario: Scenario, 
  checkpoints: Checkpoint[] 
}) {
  return (
    <div className={styles.sidebarSection}>
      <div className={styles.scenarioCardSidebar}>
        <div className={styles.scenarioHeader}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <span className={styles.scenarioBadge}>Сценарий активен</span>
        </div>
        <h4 className={styles.scenarioTitleSidebar}>{scenario.title}</h4>
        
        <div className={styles.checkpointsList}>
          {checkpoints.map((cp, idx) => (
            <div 
              key={cp.id} 
              className={`${styles.checkpointItem} ${cp.is_completed ? styles.completed : ''}`}
            >
              <div className={styles.checkpointStatus}>
                {cp.is_completed ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ) : (
                  <span className={styles.checkpointNumber}>{idx + 1}</span>
                )}
              </div>
              <span className={styles.checkpointText}>{cp.goal_description}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
