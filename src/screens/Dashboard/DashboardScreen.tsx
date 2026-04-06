import React, { useState, useMemo } from 'react'
import Navbar from '../../components/Navbar'
import { MOCK_CHARACTERS } from '../../mocks/characters'
import { CharacterCard } from '../../components/Dashboard/CharacterCard'
import { CustomDropdown } from '../../components/Dashboard/CustomDropdown'
import { FandomFilter } from '../../components/Dashboard/FandomFilter'
import styles from '../../styles/screens/Dashboard/DashboardScreen.module.css'

const DashboardScreen: React.FC = () => {
  const [nsfwEnabled, setNsfwEnabled] = useState(false)
  const [selectedFandoms, setSelectedFandoms] = useState<string[]>([])
  const [gender, setGender] = useState('Любой')
  const [sortBy, setSortBy] = useState('По популярности')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const availableFandoms = useMemo(() => {
    const counts: Record<string, number> = {}
    MOCK_CHARACTERS.forEach(c => {
      if (c.fandom) {
        counts[c.fandom] = (counts[c.fandom] || 0) + 1
      }
    })
    
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  }, [])

  const filteredCharacters = useMemo(() => {
    let result = [...MOCK_CHARACTERS]

    // 1. NSFW Filter
    if (nsfwEnabled) {
      result = result.filter(c => c.is_nsfw)
    }

    // 2. Fandom Filter (Multi-select)
    if (selectedFandoms.length > 0) {
      result = result.filter(c => c.fandom && selectedFandoms.includes(c.fandom))
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
      let comparison = 0
      if (sortBy === 'По популярности') {
        comparison = (b.total_chats || 0) - (a.total_chats || 0)
      } else if (sortBy === 'Сначала новые') {
        comparison = new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      } else if (sortBy === 'А-Я') {
        comparison = a.name.localeCompare(b.name)
      }
      
      return sortOrder === 'desc' ? comparison : -comparison
    })

    return result
  }, [nsfwEnabled, selectedFandoms, gender, searchQuery, sortBy, sortOrder])

  const getPlural = (n: number) => {
    const l1 = n % 10;
    const l2 = n % 100;
    if (l2 >= 11 && l2 <= 19) return 'персонажей';
    if (l1 === 1) return 'персонаж';
    if (l1 >= 2 && l1 <= 4) return 'персонажа';
    return 'персонажей';
  };

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
              <h2 className={styles.resultsCount}>{filteredCharacters.length} {getPlural(filteredCharacters.length)}</h2>
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
                  <button 
                    className={`${styles.viewBtn} ${styles.sortOrderBtn}`}
                    onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                    title={sortOrder === 'desc' ? 'По убыванию' : 'По возрастанию'}
                  >
                    {sortOrder === 'desc' ? '↓' : '↑'}
                  </button>
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
