import { useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Button, Input, Card, Badge, useToast } from '@/components/ui'
import styles from '../Admin.module.css'
import type { Lorebook } from '../types'

interface LorebookSectionProps {
  type: 'fandom' | 'character' | 'persona'
  lorebooks: Lorebook[]
}

type ViewMode = 'grid' | 'table'

export function LorebookSection({ type, lorebooks }: LorebookSectionProps) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const navigateDebug = (route: string) => {
    const isDebug = pathname.includes('/debug')
    const finalRoute = isDebug && !route.endsWith('/debug') ? route.replace(/\/?$/, '/debug') : route
    navigate(finalRoute)
  }

  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const { success } = useToast()

  const isEditMode = pathname.includes('/edit/')
  const isDetailMode = !!id

  const filteredLorebooks = lorebooks.filter(lb => {
    const matchesSearch = lb.name.toLowerCase().includes(search.toLowerCase()) || 
                         lb.fandom?.toLowerCase().includes(search.toLowerCase()) ||
                         lb.user_persona_name?.toLowerCase().includes(search.toLowerCase())
    
    if (type === 'fandom') return matchesSearch && !!lb.fandom && !lb.character_id && !lb.user_persona_id
    if (type === 'character') return matchesSearch && !!lb.character_id
    if (type === 'persona') return matchesSearch && !!lb.user_persona_id
    return matchesSearch
  })

  const handleEdit = (lbId: string) => navigateDebug(`/admin/lorebooks/${lbId}/edit`)
  const handleView = (lbId: string) => navigateDebug(`/admin/lorebooks/${lbId}`)
  const handleBack = () => navigateDebug('/admin')
  const handleSave = () => {
    navigateDebug(`/admin/lorebooks/${id}`)
    success('Лорбук успешно обновлен')
  }

  if (isDetailMode) {
    const lb = lorebooks.find(l => l.id === id)
    if (!lb) return <div style={{ color: 'var(--accent-red)', padding: '40px' }}>Лорбук не найден</div>

    return (
      <div className={styles.sectionContainer}>
        <header className={styles.backHeader} style={{ marginBottom: '24px' }}>
          <button className={styles.backBtn} onClick={handleBack}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
          </button>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className={styles.mainSubtitle}>Управление лорбуком</span>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900 }}>{lb.name}</h2>
          </div>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* 1. Main Info Card */}
          <div className={styles.detailGroup}>
            <div className={styles.detailTitle}>Основная информация</div>
            <Card className={styles.detailsCard} style={{ padding: '32px', gap: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                <div className={styles.detailGroup}>
                  <div className={styles.detailTitle} style={{ fontSize: '0.6rem', letterSpacing: '0.1em' }}>Название</div>
                  {isEditMode ? (
                    <Input defaultValue={lb.name} />
                  ) : (
                    <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--white)' }}>{lb.name}</div>
                  )}
                </div>

                <div className={styles.detailGroup}>
                  <div className={styles.detailTitle} style={{ fontSize: '0.6rem', letterSpacing: '0.1em' }}>Тип / Привязка</div>
                  {isEditMode ? (
                    <Input defaultValue={type === 'fandom' ? lb.fandom : lb.character_id} />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Badge variant={type === 'fandom' ? 'fuchsia' : type === 'persona' ? 'teal' : 'purple'}>
                      {type === 'fandom' ? 'Фандом' : type === 'persona' ? 'Персона' : 'Персонаж'}
                    </Badge>
                      <span style={{ fontWeight: 700, fontSize: '1rem', opacity: 0.8 }}>
                        {type === 'fandom' ? lb.fandom : type === 'persona' ? lb.user_persona_name || lb.user_persona_id : lb.character_name || lb.character_id}
                      </span>
                    </div>
                  )}
                </div>

                <div className={styles.detailGroup} style={{ gridColumn: 'span 2' }}>
                  <div className={styles.detailTitle} style={{ fontSize: '0.6rem', letterSpacing: '0.1em' }}>Описание</div>
                  {isEditMode ? (
                    <Input defaultValue={lb.description || ''} />
                  ) : (
                    <div style={{ opacity: 0.7, lineHeight: 1.6 }}>{lb.description || 'Описание отсутствует'}</div>
                  )}
                </div>
              </div>

              <div className={styles.actionRow} style={{ border: 'none', padding: 0, marginTop: 0 }}>
                {isEditMode ? (
                  <>
                    <Button variant="ghost" onClick={() => handleView(lb.id)}>Отмена</Button>
                    <Button variant="orange" onClick={handleSave}>Сохранить изменения</Button>
                  </>
                ) : (
                  <Button variant="orange" onClick={() => handleEdit(lb.id)}>Редактировать</Button>
                )}
              </div>
            </Card>
          </div>

          {/* 2. Entries Table Section */}
          <div className={styles.detailGroup}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div className={styles.detailTitle}>Записи в лорбуке ({lb.entries?.length || 0})</div>
              <Button variant="ghost" style={{ fontSize: '0.75rem', padding: '8px 16px' }}>+ Добавить записи</Button>
            </header>
            
            <div className={styles.tableWrapper}>
              <table className={styles.compactTable}>
                <thead>
                  <tr>
                    <th style={{ width: '80px' }}>ID</th>
                    <th style={{ width: '250px' }}>Тэги</th>
                    <th>Содержание</th>
                    <th style={{ width: '100px', textAlign: 'right' }}>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {lb.entries?.map((entry, i) => (
                    <tr key={i}>
                      <td><code style={{ fontSize: '0.7rem', opacity: 0.5 }}>{entry.id.split('-')[0]}</code></td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {entry.keywords?.map(kw => (
                            <Badge key={kw} variant={type === 'fandom' ? 'fuchsia' : type === 'persona' ? 'teal' : 'purple'} style={{ fontSize: '0.6rem', padding: '2px 6px' }}>{kw}</Badge>
                          ))}
                        </div>
                      </td>
                      <td>
                        <div style={{ 
                          fontSize: '0.85rem', 
                          opacity: 0.7, 
                          maxWidth: '500px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis' 
                        }}>
                          {entry.content}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button className={styles.iconBtn} title="Редактировать">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </button>
                          <button className={styles.iconBtn} title="Удалить" style={{ color: 'var(--accent-red)' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!lb.entries?.length && (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: '40px', opacity: 0.5 }}>Записей пока нет</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
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
                <th>{type === 'fandom' ? 'Вселенная' : type === 'persona' ? 'Владелец' : 'Персонаж'}</th>
                <th>Записей</th>
                <th>ID</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredLorebooks.map(lb => (
                <tr key={lb.id} onClick={() => handleView(lb.id)} style={{ cursor: 'pointer' }}>
                  <td><span style={{ fontWeight: 700 }}>{lb.name}</span></td>
                  <td><Badge variant={type === 'fandom' ? 'fuchsia' : type === 'persona' ? 'teal' : 'purple'}>{type === 'fandom' ? lb.fandom : type === 'persona' ? lb.user_persona_name || lb.user_persona_id : lb.character_id}</Badge></td>
                  <td>{lb.entries.length}</td>
                  <td><code style={{ fontSize: '0.7rem', opacity: 0.5 }}>{lb.id}</code></td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className={styles.iconBtn} onClick={(e) => { e.stopPropagation(); handleEdit(lb.id); }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
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
            <div key={lb.id} className={styles.adminCard} onClick={() => handleView(lb.id)} style={{ cursor: 'pointer' }}>
              <div className={styles.cardActions}>
                <button className={`${styles.iconBtn} ${styles.editBtn}`} onClick={(e) => { e.stopPropagation(); handleEdit(lb.id); }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
              </div>

              <div className={styles.cardTop}>
                <div className={styles.cardInfo}>
                  <h3 className={styles.cardName}>{lb.name}</h3>
                  <div style={{ marginTop: '6px' }}>
                    <Badge variant={type === 'fandom' ? 'fuchsia' : type === 'persona' ? 'teal' : 'purple'}>
                      {type === 'fandom' ? lb.fandom : type === 'persona' ? lb.user_persona_name || lb.user_persona_id : lb.character_name || lb.character_id}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className={styles.cardStats} style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Записей</span>
                  <span className={styles.statValue}>{lb.entries?.length || lb.entries_count || 0}</span>
                </div>
                <div className={styles.statItem} style={{ gridColumn: 'span 2' }}>
                  <span className={styles.statLabel}>ID Лорбука</span>
                  <span className={styles.statValue} style={{ fontSize: '0.75rem', opacity: 0.4, fontFamily: 'monospace' }}>
                    {lb.id.split('-')[0]}...
                  </span>
                </div>
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
