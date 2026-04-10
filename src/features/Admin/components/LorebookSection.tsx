import React, { useState } from 'react'
import styles from '../Admin.module.css'
import { mockLorebooks } from '../mockData'
import type { Lorebook } from '../types'

interface LorebookSectionProps {
  type: 'fandom' | 'character'
}

type ViewMode = 'grid' | 'table'

export function LorebookSection({ type }: LorebookSectionProps) {
  const [lorebooks] = useState<Lorebook[]>(mockLorebooks)
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('table')

  const filteredLorebooks = lorebooks.filter(lb => {
    const matchesSearch = lb.name.toLowerCase().includes(search.toLowerCase()) || 
                         lb.fandom?.toLowerCase().includes(search.toLowerCase())
    
    if (type === 'fandom') return matchesSearch && !!lb.fandom && !lb.character_id
    return matchesSearch && !!lb.character_id
  })

  return (
    <div className={styles.sectionContainer}>
      <div className={styles.sectionHeader}>
        <div className={styles.searchWrapper}>
          <input 
            type="text" 
            placeholder={`Поиск лорбуков ${type === 'fandom' ? 'вселенных' : 'персонажей'}...`} 
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
          <button className={styles.createBtn}>+ Создать</button>
        </div>
      </div>

      {viewMode === 'table' ? (
        <div className={styles.tableWrapper}>
          <table className={styles.compactTable}>
            <thead>
              <tr>
                <th>Название</th>
                <th>{type === 'fandom' ? 'Вселенная' : 'Персонаж'}</th>
                <th>Записей</th>
                <th>ID</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredLorebooks.map(lb => (
                <tr key={lb.id}>
                  <td><span style={{ fontWeight: 700 }}>{lb.name}</span></td>
                  <td><span className={styles.cardTag}>{type === 'fandom' ? lb.fandom : lb.character_id}</span></td>
                  <td>{lb.entries.length}</td>
                  <td><code style={{ fontSize: '0.7rem', opacity: 0.5 }}>{lb.id}</code></td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className={styles.iconBtn}>
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
          {filteredLorebooks.map(lb => (
            <div key={lb.id} className={styles.adminCard}>
              <div className={styles.cardActions}>
                <button className={`${styles.iconBtn} ${styles.editBtn}`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button className={`${styles.iconBtn} ${styles.deleteBtn}`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                </button>
              </div>

              <h3 className={styles.cardName}>{lb.name}</h3>
              <span className={styles.cardTag} style={{ display: 'inline-block', marginBottom: '16px' }}>
                {type === 'fandom' ? `Фандом: ${lb.fandom}` : `Персонаж: ${lb.character_id}`}
              </span>

              <div className={styles.cardStats}>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Записей</span>
                  <span className={styles.statValue}>{lb.entries.length}</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>ID</span>
                  <span className={styles.statValue} style={{ fontSize: '0.7rem', opacity: 0.5 }}>
                    {lb.id.split('-')[0]}
                  </span>
                </div>
              </div>

              <div style={{ marginTop: '20px' }}>
                <button className={styles.createBtn} style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  Редактировать записи
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredLorebooks.length === 0 && (
        <div style={{ textAlign: 'center', padding: '100px 0', opacity: 0.5 }}>
          Лорбуки не найдены
        </div>
      )}
    </div>
  )
}
