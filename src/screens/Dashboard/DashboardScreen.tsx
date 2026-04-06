import React, { useState } from 'react'
import Navbar from '../../components/Navbar'
import { MOCK_CHARACTERS } from '../../mocks/characters'
import { CharacterCard } from '../../components/Dashboard/CharacterCard'
import styles from '../../styles/screens/Dashboard/DashboardScreen.module.css'

const DashboardScreen: React.FC = () => {
  const [nsfwEnabled, setNsfwEnabled] = useState(false)

  return (
    <div className={styles.dashboard}>
      <Navbar variant="dashboard" />
      
      {/* Landing-style Background Elements */}
      <div className={styles.bgContainer}>
        <div className={styles.bgGrid} />
        <div className={styles.bgOverlay} />
        <div className={`${styles.orb} ${styles.orbPurple}`} />
        <div className={`${styles.orb} ${styles.orbFuchsia}`} />
      </div>

      <div className={styles.mainLayout}>
        {/* Sidebar Filters */}
        <aside className={styles.sidebar}>
          <div className={styles.filterGroup}>
            <h4 className={styles.filterTitle}>Фандом</h4>
            <select className={styles.select}>
              <option>Все фандомы</option>
              <option>Cyberpunk</option>
              <option>Fantasy</option>
              <option>Horror</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <h4 className={styles.filterTitle}>Пол</h4>
            <select className={styles.select}>
              <option>Любой</option>
              <option>Мужской</option>
              <option>Женский</option>
              <option>Другой</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <h4 className={styles.filterTitle}>Контент 18+</h4>
            <div 
              className={styles.nsfwToggle} 
              onClick={() => setNsfwEnabled(!nsfwEnabled)}
            >
              <span className={styles.toggleLabel}>NSFW Режим</span>
              <div className={`${styles.toggleSwitch} ${nsfwEnabled ? styles.active : ''}`}>
                <div className={styles.toggleKnob} />
              </div>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className={styles.contentArea}>
          <header className={styles.contentHeader}>
            <div className={styles.searchBar}>
              <input 
                type="text" 
                placeholder="Поиск персонажей..." 
                className={styles.searchInput}
              />
            </div>
            <div className={styles.resultsRow}>
              <h2 className={styles.resultsCount}>{MOCK_CHARACTERS.length * 3} Персонажей</h2>
              <div className={styles.headerActions}>
                <div className={styles.viewToggles}>
                  <button className={`${styles.viewBtn} ${styles.viewActive}`}>▤</button>
                  <button className={styles.viewBtn}>☰</button>
                </div>
                <div className={styles.sortWrapper}>
                  <span className={styles.sortLabel}>Сортировка:</span>
                  <select className={styles.sortSelect}>
                    <option>По популярности</option>
                    <option>Сначала новые</option>
                    <option>А-Я</option>
                  </select>
                </div>
              </div>
            </div>
          </header>

          {/* Character Grid */}
          <div className={styles.characterGrid}>
            {MOCK_CHARACTERS.map(char => (
              <CharacterCard key={char.id} character={char} />
            ))}
            {/* Duplicating for density */}
            {MOCK_CHARACTERS.map(char => (
              <CharacterCard key={`${char.id}-2`} character={char} />
            ))}
            {MOCK_CHARACTERS.map(char => (
              <CharacterCard key={`${char.id}-3`} character={char} />
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}

export default DashboardScreen
