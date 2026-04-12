import { useState } from 'react'
import { Badge } from '@/components/ui'
import styles from '../Admin.module.css'
import type { Character } from '../types'

interface CharacterSectionProps {
  characters: Character[]
  onSelectCharacter: (id: string) => void
  onToggleFilter?: () => void
  isFilterActive?: boolean
  onSort?: (field: string) => void
  renderSortIcon?: (field: string) => React.ReactNode
}

type ViewMode = 'grid' | 'table'

export function CharacterSection({ 
  characters, 
  onSelectCharacter,
  onToggleFilter,
  isFilterActive,
  onSort,
  renderSortIcon
}: CharacterSectionProps) {
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('table')

  const filteredCharacters = characters.filter(char => 
    char.name.toLowerCase().includes(search.toLowerCase()) ||
    char.fandom?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className={styles.sectionContainer}>
      <div className={styles.sectionHeader}>
        <div className={styles.searchWrapper}>
          <svg className={styles.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input 
            type="text" 
            placeholder="Поиск персонажей..." 
            className={styles.searchBox}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className={styles.sectionActions}>
          <div className={styles.viewControls}>
            <button 
              className={`${styles.viewBtn} ${viewMode === 'table' ? styles.activeViewBtn : ''}`}
              onClick={() => setViewMode('table')}
            >
              Список
            </button>
            <button 
              className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.activeViewBtn : ''}`}
              onClick={() => setViewMode('grid')}
            >
              Карточки
            </button>

            <button 
              className={`${styles.filterBtn} ${isFilterActive ? styles.filterBtnActive : ''}`}
              onClick={onToggleFilter}
              style={{ padding: '8px', width: '38px', height: '38px', justifyContent: 'center', marginLeft: '8px' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            </button>
          </div>
          <button 
            className={styles.createBtn}
            onClick={() => onSelectCharacter('create')}
          >
            + Создать
          </button>
        </div>
      </div>

      {viewMode === 'table' ? (
        <div className={styles.tableWrapper}>
          <table className={styles.compactTable}>
            <thead>
              <tr>
                <th onClick={() => onSort?.('name')} style={{ cursor: 'pointer' }}>Имя персонажа {renderSortIcon?.('name')}</th>
                <th onClick={() => onSort?.('fandom')} style={{ cursor: 'pointer' }}>Вселенная {renderSortIcon?.('fandom')}</th>
                <th onClick={() => onSort?.('total_chats_count')} style={{ cursor: 'pointer' }}>Чатов/мес {renderSortIcon?.('total_chats_count')}</th>
                <th onClick={() => onSort?.('scenario_count')} style={{ cursor: 'pointer' }}>Сценариев {renderSortIcon?.('scenario_count')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredCharacters.map(char => (
                <tr key={char.id} onClick={() => onSelectCharacter(char.id)} style={{ cursor: 'pointer' }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className={styles.charAvatarWrapper} style={{ position: 'static', width: '28px', height: '28px', flexShrink: 0 }}>
                        <img src={char.avatar_url} className={styles.charAvatar} alt={char.name} />
                      </div>
                      <span style={{ fontWeight: 700 }}>{char.name}</span>
                    </div>
                  </td>
                  <td><Badge variant="orange">{char.fandom || 'Независимый'}</Badge></td>
                  <td>{char.total_chats_count.toLocaleString()}</td>
                  <td>{char.scenarios_count || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredCharacters.map(char => (
            <div key={char.id} className={styles.adminCard} onClick={() => onSelectCharacter(char.id)} style={{ cursor: 'pointer' }}>
              <div className={styles.cardTop}>
                <div className={styles.cardAvatarWrapper}>
                  <img src={char.avatar_url} className={styles.cardAvatar} alt={char.name} />
                </div>
                <div className={styles.cardInfo}>
                  <h3 className={styles.cardName}>{char.name}</h3>
                  <div className={styles.cardFandom}><Badge variant="orange">{char.fandom || 'Независимый'}</Badge></div>
                </div>
              </div>
              <div className={styles.cardStats}>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Чатов</span>
                  <span className={styles.statValue}>{char.total_chats_count.toLocaleString()}</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Сценариев</span>
                  <span className={styles.statValue}>{char.scenarios_count || 0}</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Лоры</span>
                  <span className={styles.statValue}>0</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
