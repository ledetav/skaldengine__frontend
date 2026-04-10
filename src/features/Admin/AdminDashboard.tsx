import React, { useState } from 'react'
import styles from './Admin.module.css'
import { AdminSidebar, type AdminTab } from './components/AdminSidebar'
import { CharacterSection } from './components/CharacterSection'
import { LorebookSection } from './components/LorebookSection'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>('characters')

  return (
    <div className={styles.adminPage}>
      {/* Premium Background Elements */}
      <div className={styles.bgContainer}>
        <div className={styles.bgGrid} />
        <div className={styles.bgOverlay} />
        <div className={`${styles.orb} ${styles.orbPurple}`} />
        <div className={`${styles.orb} ${styles.orbPink}`} />
        <div className={`${styles.orb} ${styles.orbOrange}`} />
      </div>

      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className={styles.mainContainer}>
        <header className={styles.mainHeader}>
          <div className={styles.titleGroup}>
            <h1 className={styles.mainTitle}>
              {activeTab === 'characters' && 'Управление Персонажами'}
              {activeTab === 'lorebooks_fandom' && 'Лорбуки Миров'}
              {activeTab === 'lorebooks_character' && 'Лорбуки Героев'}
            </h1>
            <p className={styles.mainSubtitle}>Система мониторинга и редактирования контента</p>
          </div>
          
          <div className={styles.headerActions}>
            <div className={styles.userBadge}>
              <span className={styles.userRole}>Master Admin</span>
              <div className={styles.userAvatar}>A</div>
            </div>
          </div>
        </header>

        <section className={styles.contentArea}>
          {activeTab === 'characters' && <CharacterSection />}
          {(activeTab === 'lorebooks_fandom' || activeTab === 'lorebooks_character') && (
            <LorebookSection type={activeTab === 'lorebooks_fandom' ? 'fandom' : 'character'} />
          )}
        </section>
      </main>
    </div>
  )
}
