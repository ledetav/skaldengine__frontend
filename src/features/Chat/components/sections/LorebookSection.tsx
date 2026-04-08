import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './Sections.module.css'

export function LorebookSection({ userRole }: { userRole: string }) {
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
              <div className={styles.loreItem}>
                <div className={styles.loreMainInfo}>
                  <span className={styles.loreType}>Персона</span>
                  <span className={styles.loreName}>Дневник Скитальца</span>
                </div>
                <button className={styles.loreChangeBtn}>Сменить</button>
              </div>

              {(userRole === 'admin' || userRole === 'mod') && (
                <>
                  <div className={styles.loreItem}>
                    <div className={styles.loreMainInfo}>
                      <span className={styles.loreType}>Мир</span>
                      <span className={styles.loreName}>Хроники Пепла</span>
                    </div>
                  </div>
                  <div className={styles.loreItem}>
                    <div className={styles.loreMainInfo}>
                      <span className={styles.loreType}>Лорбук персонажа</span>
                      <span className={styles.loreName}>История Skald</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
