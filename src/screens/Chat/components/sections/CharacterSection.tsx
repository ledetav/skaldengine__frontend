import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Character } from '../../../../types/character'
import styles from './Sections.module.css'

export function CharacterSection({ character }: { character: Character | null }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className={styles.sidebarSection}>
      <button 
        className={styles.sectionHeader}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className={styles.sectionTitle}>Персонаж</h3>
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
            <div className={styles.charCardMini}>
              {character ? (
                <>
                  <div className={styles.charImageWrap}>
                    <img src={character.cover_image} alt="Cover" className={styles.charImage} />
                    <div className={styles.charCoverGradient} />
                    <div className={styles.charOverlayMini}>
                      <div className={styles.avatarCircleMini}>
                        <img src={character.avatar} alt={character.name} />
                      </div>
                      <div className={styles.charMainInfoMini}>
                        <h4>{character.name}</h4>
                        <span className={styles.fandomBadge}>{character.fandom}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.charDetailsMini}>
                    <p className={styles.charDescMini}>{character.description}</p>
                    
                    <div className={styles.statsGridMini}>
                      <div className={styles.statItemMini}>
                        <span className={styles.statLabelMini}>Месяц</span>
                        <span className={styles.statValueMini}>{character.monthly_chats_count?.toLocaleString() || 0}</span>
                      </div>
                      <div className={styles.statItemMini}>
                        <span className={styles.statLabelMini}>Всего</span>
                        <span className={styles.statValueMini}>{character.total_chats_count?.toLocaleString() || 0}</span>
                      </div>
                      <div className={styles.statItemMini}>
                        <span className={styles.statLabelMini}>Сценариев</span>
                        <span className={styles.statValueMini}>{character.scenarios_count || 0}</span>
                      </div>
                    </div>

                    {!character.has_lorebook && (
                      <div className={styles.loreWarningMini}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        <span>Лорбук не заполнен</span>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
                  Загрузка персонажа...
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
