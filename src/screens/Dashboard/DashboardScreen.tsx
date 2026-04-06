import React, { useState } from 'react'
import Navbar from '../../components/Navbar'
import { MOCK_CHARACTERS } from '../../mocks/characters'
import { CharacterCard } from '../../components/Dashboard/CharacterCard'
import { CustomDropdown } from '../../components/Dashboard/CustomDropdown'
import styles from '../../styles/screens/Dashboard/DashboardScreen.module.css'

const DashboardScreen: React.FC = () => {
  const [nsfwEnabled, setNsfwEnabled] = useState(false)
  const [fandom, setFandom] = useState('Все фандомы')
  const [gender, setGender] = useState('Любой')
  const [sortBy, setSortBy] = useState('По популярности')

  return (
    <div className={styles.dashboard}>
      <Navbar variant="dashboard" />
      
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
            <CustomDropdown 
              options={['Все фандомы', 'Cyberpunk', 'Fantasy', 'Horror']} 
              value={fandom} 
              onChange={setFandom} 
            />
          </div>

          <div className={styles.filterGroup}>
            <h4 className={styles.filterTitle}>Пол</h4>
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
                  <CustomDropdown 
                    variant="header"
                    options={['По популярности', 'Сначала новые', 'А-Я']} 
                    value={sortBy} 
                    onChange={setSortBy} 
                  />
                </div>
              </div>
            </div>
          </header>

          {/* Character Grid */}
          <div className={styles.characterGrid}>
            {MOCK_CHARACTERS.map(char => (
              <CharacterCard key={char.id} character={char} />
            ))}
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
