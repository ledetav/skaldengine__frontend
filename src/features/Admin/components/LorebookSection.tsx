import React, { useState } from 'react'
import { Button, Input, Card, Badge, useToast } from '@/components/ui'
import styles from '../Admin.module.css'
import { mockLorebooks } from '../mockData'
import type { Lorebook } from '../types'

interface LorebookSectionProps {
  type: 'fandom' | 'character'
  lorebooks: Lorebook[]
}

type ViewMode = 'grid' | 'table'

export function LorebookSection({ type, lorebooks }: LorebookSectionProps) {
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [editingId, setEditingId] = useState<string | null>(null)
  const { success } = useToast()

  const filteredLorebooks = lorebooks.filter(lb => {
    const matchesSearch = lb.name.toLowerCase().includes(search.toLowerCase()) || 
                         lb.fandom?.toLowerCase().includes(search.toLowerCase())
    
    if (type === 'fandom') return matchesSearch && !!lb.fandom && !lb.character_id
    return matchesSearch && !!lb.character_id
  })

  const handleEdit = (id: string) => setEditingId(id)
  const handleSave = () => {
    setEditingId(null)
    success('Лорбук успешно обновлен')
  }

  if (editingId) {
    const lb = lorebooks.find(l => l.id === editingId)
    if (!lb) return null

    return (
      <Card className={styles.sectionContainer} style={{ padding: '32px' }}>
        <header style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 className={styles.mainTitle} style={{ fontSize: '1.4rem' }}>Редактирование: {lb.name}</h2>
            <p className={styles.mainSubtitle}>ID: {lb.id}</p>
          </div>
          <Button variant="ghost" onClick={() => setEditingId(null)}>Назад к списку</Button>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Input label="Название лорбука" defaultValue={lb.name} />
          <Input label={type === 'fandom' ? 'Вселенная' : 'Персонаж (ID)'} defaultValue={type === 'fandom' ? lb.fandom : lb.character_id} />
          
          <div style={{ marginTop: '10px' }}>
            <h3 className={styles.dsLabel} style={{ marginBottom: '12px', fontSize: '0.7rem', opacity: 0.5, textTransform: 'uppercase', fontWeight: 800 }}>Записи ({lb.entries.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {lb.entries.map((entry, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '4px' }}>{entry.keys.join(', ')}</div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{entry.content.slice(0, 100)}...</div>
                </div>
              ))}
              <Button variant="ghost" style={{ width: 'fit-content' }}>+ Добавить запись</Button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '24px' }}>
            <Button variant="orange" onClick={handleSave}>Сохранить изменения</Button>
            <Button variant="ghost" onClick={() => setEditingId(null)}>Отмена</Button>
          </div>
        </div>
      </Card>
    )
  }


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
                      <button className={styles.iconBtn} onClick={() => handleEdit(lb.id)}>
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
                <button className={`${styles.iconBtn} ${styles.editBtn}`} onClick={() => handleEdit(lb.id)}>
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
                <Button variant="ghost" style={{ width: '100%' }} onClick={() => handleEdit(lb.id)}>
                  Редактировать записи
                </Button>
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
