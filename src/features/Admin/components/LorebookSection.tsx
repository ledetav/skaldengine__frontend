import { useState, useMemo } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Button, Input, Card, Badge, useToast } from '@/components/ui'
import styles from '../Admin.module.css'
import type { Lorebook, Character, User, UserPersona } from '../types'

interface LorebookSectionProps {
  type: 'fandom' | 'character' | 'persona'
  lorebooks: Lorebook[]
  characters?: Character[]
  users?: User[]
  personas?: UserPersona[]
  onToggleFilter?: () => void
  isFilterActive?: boolean
  onSort?: (field: string) => void
  renderSortIcon?: (field: string) => React.ReactNode
}

type ViewMode = 'grid' | 'table'

export function LorebookSection({ 
  type: initialType, 
  lorebooks, 
  characters = [], 
  users = [], 
  personas = [],
  onToggleFilter,
  isFilterActive,
  onSort,
  renderSortIcon
}: LorebookSectionProps) {
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
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const isCreateMode = id === 'create'
  const isEditMode = pathname.includes('/edit/') || isCreateMode
  const isDetailMode = !!id

  const draftLb = useMemo(() => isCreateMode ? {
    id: 'create',
    name: 'Новый лорбук',
    type: initialType === 'fandom' ? 'Fandom' : initialType === 'persona' ? 'Persona' : 'Character',
    fandom: '',
    description: '',
    entries_count: 0,
    entries: []
  } as Lorebook : undefined, [isCreateMode, initialType])

  const lb = useMemo(() => isCreateMode ? draftLb : lorebooks.find(l => l.id === id), [lorebooks, id, isCreateMode, draftLb])

  const [editType, setEditType] = useState<'fandom' | 'character' | 'persona'>(initialType)
  const [selectedFandom, setSelectedFandom] = useState(lb?.fandom || '')
  const [isNewFandom, setIsNewFandom] = useState(false)
  const [selectedCharId, setSelectedCharId] = useState(lb?.character_id || '')
  const [selectedUserId, setSelectedUserId] = useState(lb?.owner_id || personas.find(p => p.id === lb?.user_persona_id)?.owner_id || '')
  const [selectedPersonaId, setSelectedPersonaId] = useState(lb?.user_persona_id || '')

  const allFandoms = useMemo(() => {
    const s = new Set<string>()
    lorebooks.forEach(l => { if (l.fandom) s.add(l.fandom) })
    characters.forEach(c => { if (c.fandom) s.add(c.fandom) })
    return Array.from(s).sort()
  }, [lorebooks, characters])

  const userPersonas = useMemo(() => {
    return personas.filter(p => p.owner_id === selectedUserId)
  }, [personas, selectedUserId])

  const filteredLorebooks = lorebooks.filter(lb => {
    const matchesSearch = lb.name.toLowerCase().includes(search.toLowerCase()) || 
                         lb.fandom?.toLowerCase().includes(search.toLowerCase()) ||
                         lb.user_persona_name?.toLowerCase().includes(search.toLowerCase())
    
    if (initialType === 'fandom') return matchesSearch && !!lb.fandom && !lb.character_id && !lb.user_persona_id
    if (initialType === 'character') return matchesSearch && !!lb.character_id
    if (initialType === 'persona') return matchesSearch && !!lb.user_persona_id
    return matchesSearch
  })

  const handleEdit = (lbId: string) => navigateDebug(`/admin/lorebooks/${lbId}/edit`)
  const handleView = (lbId: string) => navigateDebug(`/admin/lorebooks/${lbId}`)
  const handleBack = () => {
    const tab = initialType === 'fandom' ? 'fandom' : initialType === 'persona' ? 'personas' : 'characters'
    navigateDebug(`/admin/lorebooks/${tab}`)
  }
  const handleSave = () => {
    if (isCreateMode) {
      handleBack()
      success('Лорбук успешно создан')
    } else {
      navigateDebug(`/admin/lorebooks/${id}`)
      success('Лорбук успешно обновлен')
    }
  }

  if (isDetailMode) {
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div className={styles.roleBtnGroup} style={{ margin: 0 }}>
                        <button 
                          className={`${styles.roleBtn} ${editType === 'fandom' ? styles.roleBtnActive : ''}`}
                          onClick={() => setEditType('fandom')}
                        >
                          Фандом
                        </button>
                        <button 
                          className={`${styles.roleBtn} ${editType === 'character' ? styles.roleBtnActive : ''}`}
                          onClick={() => setEditType('character')}
                        >
                          Персонаж
                        </button>
                        <button 
                          className={`${styles.roleBtn} ${editType === 'persona' ? styles.roleBtnActive : ''}`}
                          onClick={() => setEditType('persona')}
                        >
                          Персона
                        </button>
                      </div>

                      {/* Binding Inputs */}
                      {editType === 'fandom' && (
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <select 
                            className={styles.dropdownSelected} 
                            style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '0 12px' }}
                            value={isNewFandom ? 'new' : selectedFandom}
                            onChange={(e) => {
                              if (e.target.value === 'new') {
                                setIsNewFandom(true)
                                setSelectedFandom('')
                              } else {
                                setIsNewFandom(false)
                                setSelectedFandom(e.target.value)
                              }
                            }}
                          >
                            <option value="">Выберите фандом...</option>
                            <option value="new">+ Создать свой</option>
                            {allFandoms.map(f => <option key={f} value={f}>{f}</option>)}
                          </select>
                          {isNewFandom && (
                            <Input 
                              placeholder="Название нового фандома" 
                              value={selectedFandom} 
                              onChange={(e) => setSelectedFandom(e.target.value)} 
                            />
                          )}
                        </div>
                      )}

                      {editType === 'character' && (
                        <select 
                          className={styles.dropdownSelected} 
                          style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '0 12px' }}
                          value={selectedCharId}
                          onChange={(e) => setSelectedCharId(e.target.value)}
                        >
                          <option value="">Выберите персонажа...</option>
                          {characters.map(c => <option key={c.id} value={c.id}>{c.name} ({c.fandom || 'Независимый'})</option>)}
                        </select>
                      )}

                      {editType === 'persona' && (
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <select 
                            className={styles.dropdownSelected} 
                            style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '0 12px' }}
                            value={selectedUserId}
                            onChange={(e) => {
                              setSelectedUserId(e.target.value)
                              setSelectedPersonaId('')
                            }}
                          >
                            <option value="">Выберите пользователя...</option>
                            {users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
                          </select>
                          <select 
                            className={styles.dropdownSelected} 
                            style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '0 12px' }}
                            value={selectedPersonaId}
                            onChange={(e) => setSelectedPersonaId(e.target.value)}
                            disabled={!selectedUserId}
                          >
                            <option value="">Выберите персону...</option>
                            {userPersonas.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Badge variant={initialType === 'fandom' ? 'fuchsia' : initialType === 'persona' ? 'teal' : 'orange'}>
                      {initialType === 'fandom' ? 'Фандом' : initialType === 'persona' ? 'Персона' : 'Персонаж'}
                    </Badge>
                      <span style={{ fontWeight: 700, fontSize: '1rem', opacity: 0.8 }}>
                        {initialType === 'fandom' 
                          ? lb.fandom 
                          : initialType === 'persona' 
                            ? (lb.user_persona_name || personas.find(p => p.id === lb.user_persona_id)?.name || lb.user_persona_id)
                            : (lb.character_name || characters.find(c => c.id === lb.character_id)?.name || lb.character_id)}
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

              <div className={styles.actionRow} style={{ border: 'none', padding: 0, marginTop: 0, justifyContent: 'space-between' }}>
                {isEditMode ? (
                  <>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <Button variant="ghost" onClick={() => handleView(lb.id)}>Отмена</Button>
                      <Button variant="orange" onClick={handleSave}>Сохранить изменения</Button>
                    </div>
                  </>
                ) : (
                  <>
                    <Button variant="orange" onClick={() => handleEdit(lb.id)}>Редактировать</Button>
                    {initialType !== 'persona' && (
                      <Button variant="danger" onClick={() => setShowDeleteModal(true)}>Удалить лорбук</Button>
                    )}
                  </>
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
                            <Badge key={kw} variant={initialType === 'fandom' ? 'fuchsia' : initialType === 'persona' ? 'teal' : 'purple'} style={{ fontSize: '0.6rem', padding: '2px 6px' }}>{kw}</Badge>
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
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                          <button className={styles.iconBtn}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></button>
                          <button className={styles.iconBtn}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {showDeleteModal && (
          <div className={styles.modalOverlay} onClick={() => setShowDeleteModal(false)}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
              <h3 className={styles.modalTitle}>Удалить лорбук?</h3>
              <p className={styles.modalDescription}>
                Это действие необратимо. Лорбук <strong>{lb.name}</strong> будет полностью удален.
              </p>
              <div className={styles.modalActions}>
                <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>Отмена</Button>
                <Button variant="danger" onClick={() => { setShowDeleteModal(false); handleBack(); }}>Да, удалить</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
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
            placeholder="Поиск по названию или привязке..." 
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
          {initialType !== 'persona' && <button className={styles.createBtn} onClick={() => navigateDebug('/admin/lorebooks/create')}>+ Создать</button>}
        </div>
      </div>

      {viewMode === 'table' ? (
        <div className={styles.tableWrapper}>
          <table className={styles.compactTable}>
            <thead>
              <tr>
                <th onClick={() => onSort?.('name')} style={{ cursor: 'pointer' }}>Название {renderSortIcon?.('name')}</th>
                <th onClick={() => onSort?.(initialType === 'fandom' ? 'fandom' : initialType === 'persona' ? 'user_persona_id' : 'character_id')} style={{ cursor: 'pointer' }}>
                  {initialType === 'fandom' ? 'Вселенная' : initialType === 'persona' ? 'Владелец' : 'Персонаж'} {renderSortIcon?.(initialType === 'fandom' ? 'fandom' : initialType === 'persona' ? 'user_persona_id' : 'character_id')}
                </th>
                <th onClick={() => onSort?.('entries_count')} style={{ cursor: 'pointer' }}>Записей {renderSortIcon?.('entries_count')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredLorebooks.map(lb => (
                <tr key={lb.id} onClick={() => handleView(lb.id)} style={{ cursor: 'pointer' }}>
                  <td><span style={{ fontWeight: 700 }}>{lb.name}</span></td>
                  <td>
                    <Badge variant={initialType === 'fandom' ? 'fuchsia' : initialType === 'persona' ? 'teal' : 'orange'}>
                      {initialType === 'fandom' 
                        ? lb.fandom 
                        : initialType === 'persona' 
                          ? (lb.user_persona_name || personas.find(p => p.id === lb.user_persona_id)?.name || lb.user_persona_id)
                          : (lb.character_name || characters.find(c => c.id === lb.character_id)?.name || lb.character_id)}
                    </Badge>
                  </td>
                  <td>{lb.entries?.length || lb.entries_count || 0}</td>
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
                {initialType !== 'persona' && (
                  <button 
                    className={`${styles.iconBtn} ${styles.dangerBtn}`} 
                    style={{ '--btn-accent': 'var(--accent-red)' } as React.CSSProperties}
                    onClick={(e) => { e.stopPropagation(); setShowDeleteModal(true); }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                )}
              </div>

              <div className={styles.cardTop}>
                <div className={styles.cardInfo}>
                  <h3 className={styles.cardName}>{lb.name}</h3>
                  <div style={{ marginTop: '6px' }}>
                    <Badge variant={initialType === 'fandom' ? 'fuchsia' : initialType === 'persona' ? 'teal' : 'orange'}>
                      {initialType === 'fandom' 
                        ? lb.fandom 
                        : initialType === 'persona' 
                          ? (lb.user_persona_name || personas.find(p => p.id === lb.user_persona_id)?.name || lb.user_persona_id)
                          : (lb.character_name || characters.find(c => c.id === lb.character_id)?.name || lb.character_id)}
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
                  <span className={styles.statLabel}>Лорбук</span>
                  <span className={styles.statValue} style={{ fontSize: '0.75rem', opacity: 0.4, fontFamily: 'monospace' }}>
                    {initialType.toUpperCase()}
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
