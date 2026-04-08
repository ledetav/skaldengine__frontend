import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { UserPersona } from '../../../../types/chat'
import styles from './Sections.module.css'

export function PersonaSection({ persona }: { persona: UserPersona | null }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className={styles.sidebarSection}>
      <button 
        className={styles.sectionHeader}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className={styles.sectionTitle}>Ваша персона</h3>
        <svg 
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          className={`${styles.sectionChevron} ${isExpanded ? styles.chevronRotate : ''}`}
        >
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden' }}
            className={styles.sectionContent}
          >
            <div className={styles.personaCardSidebar}>
              {persona ? (
                <>
                  <div className={styles.personaHeaderSidebar}>
                    <div className={styles.personaAvatarSidebar}>
                      <img src={persona.avatar} alt="Avatar" />
                    </div>
                    <div className={styles.personaMetaSidebar}>
                      <h4 className={styles.personaNameSidebar}>{persona.name}</h4>
                      <span className={styles.personaMetaText}>
                        {persona.age} лет, {persona.gender}
                      </span>
                    </div>
                  </div>
                  <p className={styles.personaDescSidebar}>{persona.description}</p>
                </>
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
                  Загрузка персоны...
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
