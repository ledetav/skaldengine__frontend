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

  const filteredCharacters = characters.filter(char => {
    if (!char) return false
    const n = (char.name || '').toLowerCase()
    const f = (char.fandom || '').toLowerCase()
    const s = search.toLowerCase()
    return n.includes(s) || f.includes(s) || (char.type === 'original' && 'оригинальный'.includes(s))
  })

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
                <th onClick={() => onSort?.('scenarios_count')} style={{ cursor: 'pointer' }}>Сценарии {renderSortIcon?.('scenarios_count')}</th>
                <th onClick={() => onSort?.('lorebook_count')} style={{ cursor: 'pointer' }}>Лорбуки {renderSortIcon?.('lorebook_count')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredCharacters.map(char => (
                <tr key={char.id} onClick={() => onSelectCharacter(char.id)} style={{ cursor: 'pointer' }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className={styles.charAvatarWrapper} style={{ position: 'static', width: '28px', height: '28px', flexShrink: 0, borderRadius: '50%', clipPath: 'none' }}>
                        <img src={char.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${char.name}`} className={styles.charAvatar} style={{ borderRadius: '50%', clipPath: 'none' }} alt={char.name} />
                      </div>
                      <span style={{ fontWeight: 700 }}>{char.name}</span>
                    </div>
                  </td>
                  <td><Badge variant={char.type === 'original' ? "orange" : "blue"}>{char.type === 'original' ? 'Оригинальный' : (char.fandom || 'Фандомный')}</Badge></td>
                  <td>{(char.total_chats_count || 0).toLocaleString()}</td>
                  <td>{char.scenarios_count || 0}</td>
                  <td>{char.lorebook_ids?.length || 0}</td>
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
                  <img src={char.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${char.name}`} className={styles.cardAvatar} alt={char.name} />
                </div>
                <div className={styles.cardInfo}>
                  <h3 className={styles.cardName}>{char.name}</h3>
                  <div className={styles.cardFandom}><Badge variant={char.type === 'original' ? "orange" : "blue"}>{char.type === 'original' ? 'Оригинальный' : (char.fandom || 'Фандомный')}</Badge></div>
                </div>
              </div>
              <div className={styles.cardStats}>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Чатов</span>
                  <span className={styles.statValue}>{(char.total_chats_count || 0).toLocaleString()}</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Сценариев</span>
                  <span className={styles.statValue}>{char.scenarios_count || 0}</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Лорбуков</span>
                  <span className={styles.statValue}>{char.lorebook_ids?.length || 0}</span>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  )
}
