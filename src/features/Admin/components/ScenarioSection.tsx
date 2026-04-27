import React, { useState } from 'react'
import { Badge } from '@/components/ui'
import styles from '../Admin.module.css'
import type { Scenario } from '@/core/types/chat'
import type { Character } from '../types'

interface ScenarioSectionProps {
  scenarios: Scenario[]
  characters: Character[]
  onSelectScenario: (id: string) => void
  onToggleFilter?: () => void
  isFilterActive?: boolean
  onSort?: (field: string) => void
  renderSortIcon?: (field: string) => React.ReactNode
}

type ViewMode = 'grid' | 'table'

export function ScenarioSection({ 
  scenarios, 
  characters,
  onSelectScenario,
  onToggleFilter,
  isFilterActive,
  onSort,
  renderSortIcon
}: ScenarioSectionProps) {
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('table')

  const filteredScenarios = scenarios.filter(s => 
    s.title?.toLowerCase().includes(search.toLowerCase()) ||
    s.description?.toLowerCase().includes(search.toLowerCase()) ||
    (s.location || '').toLowerCase().includes(search.toLowerCase())
  )

  const getCharName = (id?: string | null) => {
    if (!id) return 'Общий'
    return characters.find(c => c.id === id)?.name || 'Неизвестен'
  }

  return (
    <div className={styles.sectionContainer}>
      <div className={styles.sectionHeader}>
        <div className={styles.searchWrapper}>
          <svg className={styles.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input 
            type="text" 
            placeholder="Поиск сценариев..." 
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
            onClick={() => onSelectScenario('create')}
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
                <th onClick={() => onSort?.('title')} style={{ cursor: 'pointer' }}>Заголовок {renderSortIcon?.('title')}</th>
                <th onClick={() => onSort?.('character_id')} style={{ cursor: 'pointer' }}>Персонаж {renderSortIcon?.('character_id')}</th>
                <th onClick={() => onSort?.('location')} style={{ cursor: 'pointer' }}>Локация {renderSortIcon?.('location')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredScenarios.map(s => (
                <tr key={s.id} onClick={() => onSelectScenario(s.id)} style={{ cursor: 'pointer' }}>
                  <td><span style={{ fontWeight: 700 }}>{s.title}</span></td>
                  <td>
                    <Badge variant={s.character_id ? 'orange' : 'blue'}>
                      {getCharName(s.character_id)}
                    </Badge>
                  </td>
                  <td><span style={{ opacity: 0.6 }}>{s.location || '—'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredScenarios.map(s => (
            <div key={s.id} className={styles.adminCard} onClick={() => onSelectScenario(s.id)} style={{ cursor: 'pointer' }}>
              <div className={styles.cardTop}>
                <div className={styles.cardInfo}>
                  <h3 className={styles.cardName}>{s.title}</h3>
                  <div className={styles.cardFandom}>
                    <Badge variant={s.character_id ? 'orange' : 'blue'}>
                      {getCharName(s.character_id)}
                    </Badge>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '12px', fontSize: '0.85rem', opacity: 0.7, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {s.description}
              </div>
              <div className={styles.cardStats} style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div className={styles.statItem} style={{ gridColumn: 'span 3' }}>
                  <span className={styles.statLabel}>Локация</span>
                  <span className={styles.statValue}>{s.location || '—'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
