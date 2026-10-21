import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './Sections.module.css'
import { type Lorebook } from '@/core/types/chat'

export function LorebookSection({ lorebooks, onPersonaLorebookChange }: { lorebooks: Lorebook[], onPersonaLorebookChange?: () => void }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className={styles.sidebarSection}>
      <button 
        className={styles.sectionHeader}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className={styles.sectionTitle}>База знаний (Лорбук)</h3>
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
            <div className={styles.loreList}>
              {lorebooks.length > 0 ? (
                lorebooks.map(lb => (
                  <div key={lb.id} className={styles.loreItem}>
                    <div className={styles.loreMainInfo}>
                      <span className={styles.loreType}>
                        {lb.type === 'persona' ? 'Персона' : lb.type === 'character' ? 'Персональный' : 'Фандомный'}
                      </span>
                      <span className={styles.loreName}>{lb.name}</span>
                    </div>
                    {lb.type === 'persona' && onPersonaLorebookChange && (
                      <button className={styles.loreChangeBtn} onClick={onPersonaLorebookChange}>Сменить</button>
                    )}
                  </div>
                ))
              ) : (
                <div style={{ padding: '10px 0', fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  Нет активных лорбуков
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
