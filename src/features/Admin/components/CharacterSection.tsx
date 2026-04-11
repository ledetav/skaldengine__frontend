import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from '../Admin.module.css'
import { mockCharacters } from '../mockData'
import type { Character } from '../types'

type ViewMode = 'grid' | 'table'
type SortField = 'name' | 'total_chats_count' | 'monthly_chats_count'

interface CharacterSectionProps {
  characters: Character[]
  onSelectCharacter?: (id: string) => void
}

export function CharacterSection({ characters, onSelectCharacter }: CharacterSectionProps) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [sortField, setSortField] = useState<SortField>('name')

  const filteredCharacters = characters
    .filter(c => 
      c.name.toLowerCase().includes(search.toLowerCase()) || 
      c.fandom?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (typeof a[sortField] === 'string' && typeof b[sortField] === 'string') {
        return (a[sortField] as string).localeCompare(b[sortField] as string)
      }
      return (b[sortField] as number) - (a[sortField] as number)
    })

  return (
    <div className={styles.sectionContainer}>
      <div className={styles.sectionHeader}>
        <div className={styles.searchWrapper}>
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
          </div>
          <button className={styles.createBtn} onClick={() => navigate('/admin/characters/create/debug')}>+ Создать</button>
        </div>
      </div>

      {viewMode === 'table' ? (
        <div className={styles.tableWrapper}>
          <table className={styles.compactTable}>
            <thead>
              <tr>
                <th onClick={() => setSortField('name')} style={{ cursor: 'pointer' }}>Имя {sortField === 'name' && '↓'}</th>
                <th>Фандом</th>
                <th onClick={() => setSortField('total_chats_count')} style={{ cursor: 'pointer' }}>Чаты {sortField === 'total_chats_count' && '↓'}</th>
                <th>NSFW</th>
                <th>Доступ</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredCharacters.map(char => (
                <tr key={char.id} onClick={() => onSelectCharacter?.(char.id)} style={{ cursor: 'pointer' }}>
                  <td style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src={char.avatar_url} alt="" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
                    <span style={{ fontWeight: 700 }}>{char.name}</span>
                  </td>
                  <td><span className={styles.cardTag}>{char.fandom || '—'}</span></td>
                  <td>{char.total_chats_count.toLocaleString()}</td>
                  <td>{char.nsfw_allowed ? '✅' : '❌'}</td>
                  <td>
                    <span style={{ color: char.is_public ? '#4ade80' : '#fb7185', fontSize: '0.8rem', fontWeight: 700 }}>
                      {char.is_public ? 'PUBLIC' : 'PRIVATE'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className={styles.iconBtn} onClick={(e) => { e.stopPropagation(); navigate(`/admin/characters/${char.id}/edit/debug`) }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button className={styles.iconBtn}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredCharacters.map(char => (
            <div key={char.id} className={styles.adminCard} onClick={() => onSelectCharacter?.(char.id)} style={{ cursor: 'pointer' }}>
              <div className={styles.cardActions}>
                <button 
                  className={`${styles.iconBtn} ${styles.editBtn}`}
                  onClick={(e) => { e.stopPropagation(); navigate(`/admin/characters/${char.id}/edit/debug`) }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button className={`${styles.iconBtn} ${styles.deleteBtn}`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                </button>
              </div>
              
              <div className={styles.cardTop}>
                <img src={char.avatar_url} alt={char.name} className={styles.cardAvatar} />
                <div className={styles.cardInfo}>
                  <h3 className={styles.cardName}>{char.name}</h3>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span className={styles.cardTag} title="Публичный">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                      {char.is_public ? 'Public' : 'Private'}
                    </span>
                    {char.nsfw_allowed && (
                      <span className={styles.cardTag} style={{ color: '#ff4d4d' }} title="NSFW">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                        NSFW
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', height: '2.5rem', overflow: 'hidden', margin: '0' }}>
                {char.description}
              </p>

              <div className={styles.cardStats}>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Чаты</span>
                  <span className={styles.statValue}>{char.total_chats_count}</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Доступ</span>
                  <span className={styles.statValue} style={{ color: char.is_public ? '#4ade80' : '#fb7185' }}>
                    {char.is_public ? 'Public' : 'Private'}
                  </span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>NSFW</span>
                  <span className={styles.statValue}>
                    {char.nsfw_allowed ? '✅' : '❌'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
