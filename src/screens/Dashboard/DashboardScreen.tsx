import React, { useState, useMemo } from 'react'
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
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const filteredCharacters = useMemo(() => {
    let result = [...MOCK_CHARACTERS]

    // 1. NSFW Filter
    if (nsfwEnabled) {
      result = result.filter(c => c.is_nsfw)
    }

    // 2. Fandom Filter
    if (fandom !== 'Все фандомы') {
      result = result.filter(c => c.fandom?.toLowerCase().includes(fandom.toLowerCase()))
    }

    // 3. Gender Filter
    if (gender !== 'Любой') {
      result = result.filter(c => c.gender === gender)
    }

    // 4. Search Query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(c => 
        c.name.toLowerCase().includes(query) || 
        c.description?.toLowerCase().includes(query)
      )
    }

    // 5. Sorting
    result.sort((a, b) => {
      if (sortBy === 'По популярности') {
        return (b.total_chats || 0) - (a.total_chats || 0)
      }
      if (sortBy === 'Сначала новые') {
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      }
      if (sortBy === 'А-Я') {
        return a.name.localeCompare(b.name)
      }
      return 0
    })

    return result
  }, [nsfwEnabled, fandom, gender, searchQuery, sortBy])

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
              options={['Все фандомы', 'Cthulhu', 'Cyberpunk', 'Fantasy', 'Horror', 'Sci-Fi']} 
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className={styles.resultsRow}>
              <h2 className={styles.resultsCount}>{filteredCharacters.length} Персонажей</h2>
              <div className={styles.headerActions}>
                <div className={styles.viewToggles}>
                  <button 
                    className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.viewActive : ''}`}
                    onClick={() => setViewMode('grid')}
                  >
                    ▤
                  </button>
                  <button 
                    className={`${styles.viewBtn} ${viewMode === 'list' ? styles.viewActive : ''}`}
                    onClick={() => setViewMode('list')}
                  >
                    ☰
                  </button>
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
          <div className={viewMode === 'grid' ? styles.characterGrid : styles.characterList}>
            {filteredCharacters.map(char => (
              <CharacterCard key={char.id} character={char} viewMode={viewMode} />
            ))}
            {filteredCharacters.length === 0 && (
              <div className={styles.noResults}>
                <h3>Персонажи не найдены</h3>
                <p>Попробуйте изменить параметры поиска или фильтры</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default DashboardScreen
