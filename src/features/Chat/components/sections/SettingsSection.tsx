import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CustomSelect } from '../common/CustomSelect'
import styles from './Sections.module.css'

interface SettingsSectionProps {
  perspective: string
  language: string
  fontSize: string
  autoScrollEnabled: boolean
  showThoughtsGlobal: boolean
  onPerspectiveChange: (val: string) => void
  onLanguageChange: (val: string) => void
  onFontSizeChange: (val: string) => void
  onAutoScrollToggle: () => void
  onShowThoughtsToggle: () => void
}

export function SettingsSection({
  perspective,
  language,
  fontSize,
  autoScrollEnabled,
  showThoughtsGlobal,
  onPerspectiveChange,
  onLanguageChange,
  onFontSizeChange,
  onAutoScrollToggle,
  onShowThoughtsToggle
}: SettingsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className={styles.sidebarSection}>
      <button 
        className={styles.sectionHeader}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className={styles.sectionTitle}>Настройки</h3>
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
            <div className={styles.settingsGrid}>
              <div className={styles.settingItem}>
                <label>Перспектива</label>
                <CustomSelect 
                  value={perspective} 
                  onChange={onPerspectiveChange}
                  options={[
                    { value: 'first', label: '1-е лицо (Я)' },
                    { value: 'second', label: '2-е лицо (Ты)' },
                    { value: 'third', label: '3-е лицо (Он/Она)' }
                  ]}
                />
              </div>
              <div className={styles.settingItem}>
                <label>Язык</label>
                <CustomSelect 
                  value={language} 
                  onChange={onLanguageChange}
                  options={[
                    { value: 'RU', label: 'Русский' },
                    { value: 'EN', label: 'English' }
                  ]}
                />
              </div>
              <div className={styles.localSettingsHint}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
                <span>Параметры ниже сохраняются только на этом устройстве</span>
              </div>

              <div className={styles.settingItem}>
                <label>Размер шрифта</label>
                <div className={styles.fontSizeGroup}>
                  {['small', 'medium', 'large'].map(s => (
                    <button 
                      key={s} 
                      className={`${styles.sizeBtn} ${fontSize === s ? styles.activeSize : ''}`}
                      onClick={() => onFontSizeChange(s)}
                    >
                      {s === 'small' ? 'A' : s === 'medium' ? 'AA' : 'AAA'}
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.settingToggle}>
                <label>Автопрокрутка</label>
                <button 
                  className={`${styles.toggleSwitch} ${autoScrollEnabled ? styles.toggleOn : ''}`}
                  onClick={onAutoScrollToggle}
                >
                  <div className={styles.toggleKnob} />
                </button>
              </div>
              <div className={styles.settingToggle}>
                <label>Показывать мысли</label>
                <button 
                  className={`${styles.toggleSwitch} ${showThoughtsGlobal ? styles.toggleOn : ''}`}
                  onClick={onShowThoughtsToggle}
                >
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
