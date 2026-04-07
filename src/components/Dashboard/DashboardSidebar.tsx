import React from 'react'
import { CustomDropdown } from './CustomDropdown'
import { FandomFilter } from './FandomFilter'
import styles from '../../styles/screens/Dashboard/DashboardScreen.module.css'

interface DashboardSidebarProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  availableFandoms: { name: string; count: number }[]
  selectedFandoms: string[]
  setSelectedFandoms: (fandoms: string[]) => void
  gender: string
  setGender: (gender: string) => void
  nsfwEnabled: boolean
  setNsfwEnabled: (enabled: boolean) => void
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  isOpen,
  setIsOpen,
  availableFandoms,
  selectedFandoms,
  setSelectedFandoms,
  gender,
  setGender,
  nsfwEnabled,
  setNsfwEnabled
}) => {
  return (
    <>
      {/* Overlay for mobile drawer */}
      {isOpen && (
        <div className={styles.sidebarOverlay} onClick={() => setIsOpen(false)} />
      )}

      {/* Sidebar Filters */}
      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarVisible : ''}`}>
        <div className={styles.sidebarHeader}>
          <h3 className={styles.drawerTitle}>Фильтры</h3>
          <button className={styles.closeDrawer} onClick={() => setIsOpen(false)}>✕</button>
        </div>

        <div className={styles.filterGroup}>
          <h4 className={styles.filterTitle}>Фандом</h4>
          <FandomFilter
            availableFandoms={availableFandoms}
            selectedFandoms={selectedFandoms}
            onChange={setSelectedFandoms}
          />
        </div>

        <div className={styles.filterGroup}>
          <h4 className={styles.filterTitle}>Пол персонажа</h4>
          <CustomDropdown
            options={['Любой', 'Мужской', 'Женский', 'Другой']}
            value={gender}
            onChange={setGender}
          />
        </div>

        <div className={styles.filterGroup}>
          <h4 className={styles.filterTitle}>Контент 18+</h4>
          <div
            className={styles.nsfwToggle}
            onClick={() => setNsfwEnabled(!nsfwEnabled)}
          >
            <span className={styles.toggleLabel}>Показать только NSFW</span>
            <div className={`${styles.toggleSwitch} ${nsfwEnabled ? styles.active : ''}`}>
              <div className={styles.toggleKnob} />
            </div>
          </div>
        </div>

        <button className={styles.applyFiltersBtn} onClick={() => setIsOpen(false)}>
          Применить
        </button>
      </aside>
    </>
  )
}
