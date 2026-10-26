import { useState, useMemo, useEffect, type ChangeEvent, type ReactNode } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Badge, useToast } from '@/components/ui'
import styles from '../styles'
import { ApiClient } from '@/core/api/client'
import type { Lorebook, LorebookEntry, Character, User, UserPersona } from '../types'
import { LorebookDetail, LorebookEntryList, LorebookEntryForm, LB_CATEGORY_MAP } from './lorebook'
import { ConfirmModal } from '@/components/common'

interface LorebookSectionProps {
  type: 'fandom' | 'character' | 'persona'
  lorebooks: Lorebook[]
  characters?: Character[]
  users?: User[]
  personas?: UserPersona[]
  onToggleFilter?: () => void
  isFilterActive?: boolean
  onSort?: (field: string) => void
  renderSortIcon?: (field: string) => ReactNode
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
  const [lbToDeleteId, setLbToDeleteId] = useState<string | null>(null)

  const isCreateMode = id === 'create'
  const isEditMode = pathname.includes('/edit') || isCreateMode
  const isDetailMode = !!id

  const draftLb = useMemo(() => isCreateMode ? {
    id: 'create',
    name: 'Новый лорбук',
    type: initialType === 'fandom' ? 'fandom' : initialType === 'persona' ? 'persona' : 'character',
    fandom: '',
    description: '',
    category: 'general',
    entries_count: 0,
    entries: []
  } as Lorebook : undefined, [isCreateMode, initialType])

  const [fetchedLb, setFetchedLb] = useState<Lorebook | null>(null)
  
  const lb = useMemo(() => {
    if (isCreateMode) return draftLb
    return lorebooks.find(l => l.id === id) || fetchedLb
  }, [lorebooks, id, isCreateMode, draftLb, fetchedLb])

  useEffect(() => {
    const loadLb = async () => {
      if (id && id !== 'create' && !lorebooks.find(l => l.id === id)) {
        try {
          const res = await ApiClient.get<Lorebook>('core', `/lorebooks/${id}`)
          setFetchedLb(res)
        } catch (e) {
          console.error('Failed to fetch specific lorebook', e)
        }
      }
    }
    loadLb()
  }, [id, lorebooks])

  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editLorebookCategory, setEditLorebookCategory] = useState('general')

  const [editType, setEditType] = useState<'fandom' | 'character' | 'persona'>(initialType)
  const [selectedFandom, setSelectedFandom] = useState('')
  const [isNewFandom, setIsNewFandom] = useState(false)
  const [selectedCharId, setSelectedCharId] = useState('')
  const [selectedUserId, setSelectedUserId] = useState('')
  const [selectedPersonaId, setSelectedPersonaId] = useState('')
  const [isMain, setIsMain] = useState(false)

  useEffect(() => {
    if (lb && isEditMode) {
      setEditName(lb.name || '')
      setEditDescription(lb.description || '')
      setEditLorebookCategory(lb.category || 'general')
      setEditType(lb.type || initialType)
      setSelectedFandom(lb.fandom || '')
      setSelectedCharId(lb.character_id || '')
      setSelectedUserId(lb.owner_id || personas.find(p => p.id === lb.user_persona_id)?.owner_id || '')
      setSelectedPersonaId(lb.user_persona_id || '')
      setIsMain(lb.tags?.includes('main') || false)
      setIsNewFandom(false)
    } else if (isCreateMode) {
      setEditName('')
      setEditDescription('')
      setEditLorebookCategory('general')
      setEditType(initialType)
      setSelectedFandom('')
      setSelectedCharId('')
      setSelectedUserId('')
      setSelectedPersonaId('')
      setIsMain(false)
      setIsNewFandom(false)
    }
  }, [lb, isEditMode, isCreateMode, initialType, personas])

  const [isAddingEntry, setIsAddingEntry] = useState(false)
  const [entries, setEntries] = useState<LorebookEntry[]>([])
  const [entriesTotal, setEntriesTotal] = useState(0)
  const [entriesPage, setEntriesPage] = useState(1)
  const [entrySort, setEntrySort] = useState<'created_at' | 'priority'>('priority')
  const [entryCategoryFilter, setEntryCategoryFilter] = useState('all')
  const [isEntriesLoading, setIsEntriesLoading] = useState(false)

  const fetchEntries = async (page: number) => {
    if (!lb?.id || lb.id === 'create') return
    setIsEntriesLoading(true)
    const skip = (page - 1) * 20
    try {
      const res = await ApiClient.get<any>('core', `/lorebooks/${lb.id}/entries?skip=${skip}&limit=20&sort_by=${entrySort}`)
      if (res && res.items) {
        setEntries(res.items)
        setEntriesTotal(res.total)
      } else if (Array.isArray(res)) {
        setEntries(res)
        setEntriesTotal(res.length)
      }
    } catch (e) {
      console.error('Failed to fetch entries', e)
    } finally {
      setIsEntriesLoading(false)
    }
  }

  useEffect(() => {
    if (isDetailMode && lb?.id && lb.id !== 'create') {
      fetchEntries(entriesPage)
    }
  }, [lb?.id, isDetailMode, entriesPage, entrySort])

  useEffect(() => {
    if (!lb?.id || lb.id === 'create') return
    const wsUrl = import.meta.env.VITE_CORE_API_URL?.replace('http', 'ws') || 'ws://localhost:8002/api/v1'
    const socket = new WebSocket(`${wsUrl}/ws/updates`)
    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data)
        if (payload.type === 'REFRESH_LOREBOOK_ENTRIES' && payload.data.lorebook_id === lb.id) {
          fetchEntries(entriesPage)
        }
        if (payload.type === 'UPDATE_LOREBOOK' && payload.data.id === lb.id) {
          setFetchedLb(prev => prev ? { ...prev, ...payload.data } : payload.data)
        }
      } catch (err) {}
    }
    return () => { socket.close() }
  }, [lb?.id, entriesPage])

  const [editingEntryId, setEditingEntryId] = useState<string | null>(null)
  const [editEntryKeywords, setEditEntryKeywords] = useState('')
  const [editEntryContent, setEditEntryContent] = useState('')
  const [editEntryCategory, setEditEntryCategory] = useState('fact')
  const [editEntryAlwaysInc, setEditEntryAlwaysInc] = useState(false)
  const [editEntryPriority, setEditEntryPriority] = useState(3)
  const [entrySearch, setEntrySearch] = useState('')
  const [showEntryDeleteModal, setShowEntryDeleteModal] = useState(false)
  const [entryToDeleteId, setEntryToDeleteId] = useState<string | null>(null)

  const handleEntrySave = async (entryId: string) => {
    try {
      const { lorebooksApi } = await import('@/core/api/lorebooks')
      const keywords = editEntryKeywords.split(',').map((k: string) => k.trim()).filter(Boolean)
      setEntries(prev => prev.map(e => e.id === entryId ? {
        ...e, keywords, content: editEntryContent, category: editEntryCategory,
        is_always_included: editEntryAlwaysInc, priority: editEntryPriority
      } : e))
      setEditingEntryId(null)
      success('Запись обновлена')
      
      await lorebooksApi.updateLorebookEntry(lb!.id, entryId, {
        keywords, content: editEntryContent, category: editEntryCategory,
        is_always_included: editEntryAlwaysInc, priority: editEntryPriority
      })
      fetchEntries(entriesPage)
    } catch (e: any) {
      console.error(e)
      success('Ошибка обновления записи')
      fetchEntries(entriesPage)
    }
  }

  const handleEntryDelete = (entryId: string) => {
    setEntryToDeleteId(entryId)
    setShowEntryDeleteModal(true)
  }

  const confirmEntryDelete = async () => {
    if (!entryToDeleteId) return
    const idToDelete = entryToDeleteId
    try {
      const { lorebooksApi } = await import('@/core/api/lorebooks')
      setEntries(prev => prev.filter(e => e.id !== idToDelete))
      setEntriesTotal(prev => prev - 1)
      success('Запись удалена')
      setShowEntryDeleteModal(false)
      setEntryToDeleteId(null)

      await lorebooksApi.deleteAdminLorebookEntry(lb!.id, idToDelete)
      fetchEntries(entriesPage)
    } catch (e: any) {
      console.error(e)
      success('Ошибка удаления записи')
      fetchEntries(entriesPage)
    }
  }

  const allFandoms = useMemo(() => {
    const s = new Set<string>()
    lorebooks.forEach(l => { if (l.fandom) s.add(l.fandom) })
    characters.forEach(c => { if (c.fandom) s.add(c.fandom) })
    return Array.from(s).filter(Boolean).filter(f => !['original', 'оригинальный'].includes(f.toLowerCase())).sort()
  }, [lorebooks, characters])

  const filteredLorebooks = lorebooks.filter(l => {
    const s = search.toLowerCase()
    const matches = l.name.toLowerCase().includes(s) || 
                    l.fandom?.toLowerCase().includes(s) ||
                    l.user_persona_name?.toLowerCase().includes(s)
    
    if (initialType === 'fandom') return matches && !!l.fandom && !l.character_id && !l.user_persona_id
    if (initialType === 'character') return matches && !!l.character_id
    if (initialType === 'persona') return matches && !!l.user_persona_id
    return matches
  })

  const handleEdit = (lbId: string) => navigateDebug(`/admin/lorebooks/${lbId}/edit`)
  const handleView = (lbId: string) => navigateDebug(`/admin/lorebooks/${lbId}`)
  const handleBack = () => {
    const tab = initialType === 'fandom' ? 'fandom' : initialType === 'persona' ? 'personas' : 'characters'
    navigateDebug(`/admin/lorebooks/${tab}`)
  }

  const handleSave = async () => {
    try {
      const { lorebooksApi } = await import('@/core/api/lorebooks')
      const payload: Partial<Lorebook> = {
        name: editName,
        description: editDescription,
        category: editLorebookCategory,
        type: editType === 'fandom' ? 'fandom' : editType === 'persona' ? 'persona' : 'character',
        fandom: editType === 'fandom' ? selectedFandom : undefined,
        character_id: editType === 'character' ? (selectedCharId || null) : undefined,
        user_persona_id: editType === 'persona' ? (selectedPersonaId || null) : undefined,
        tags: isMain ? ['main'] : (lb?.tags || []).filter(t => t !== 'main')
      }

      if (isCreateMode) {
        await lorebooksApi.createAdminLorebook(payload as any)
        success('Лорбук успешно создан')
        handleBack()
      } else {
        await lorebooksApi.updateAdminLorebook(id!, payload as any)
        success('Лорбук успешно обновлен')
        handleView(id!)
      }
    } catch (e) {
      console.error('Failed to save lorebook', e)
      success('Ошибка при сохранении лорбука')
    }
  }

  const handleDelete = async () => {
    const targetId = lbToDeleteId || id
    if (!targetId) return

    try {
      const { lorebooksApi } = await import('@/core/api/lorebooks')
      await lorebooksApi.deleteAdminLorebook(targetId)
      success('Лорбук успешно удален')
      setShowDeleteModal(false)
      setLbToDeleteId(null)
      handleBack()
    } catch (e) {
      console.error('Failed to delete lorebook', e)
      success('Ошибка при удалении лорбука')
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
          <LorebookDetail 
            lb={lb}
            isEditMode={isEditMode}
                        initialType={initialType}
            characters={characters}
            users={users}
            personas={personas}
            allFandoms={allFandoms}
            
            editName={editName}
            setEditName={setEditName}
            editDescription={editDescription}
            setEditDescription={setEditDescription}
            editType={editType}
            setEditType={setEditType}
            editLorebookCategory={editLorebookCategory}
            setEditLorebookCategory={setEditLorebookCategory}
            
            selectedFandom={selectedFandom}
            setSelectedFandom={setSelectedFandom}
            isNewFandom={isNewFandom}
            setIsNewFandom={setIsNewFandom}
            selectedCharId={selectedCharId}
            setSelectedCharId={setSelectedCharId}
            selectedUserId={selectedUserId}
            setSelectedUserId={setSelectedUserId}
            selectedPersonaId={selectedPersonaId}
            setSelectedPersonaId={setSelectedPersonaId}
            isMain={isMain}
            setIsMain={setIsMain}
            
            onView={() => handleView(lb.id)}
            onEdit={() => handleEdit(lb.id)}
            onSave={handleSave}
            
            showDeleteModal={showDeleteModal}
            setShowDeleteModal={setShowDeleteModal}
            onDelete={handleDelete}
          />

          <div className={styles.detailGroup}>
            {!isCreateMode && (
              <>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                  <button className={styles.createBtn} onClick={() => setIsAddingEntry(!isAddingEntry)}>
                    {isAddingEntry ? 'Отмена' : '+ Добавить запись'}
                  </button>
                </div>

                {isAddingEntry && (
                  <LorebookEntryForm 
                    lorebookId={lb.id}
                    onSaved={() => {
                      setIsAddingEntry(false)
                      fetchEntries(entriesPage)
                    }}
                    onCancel={() => setIsAddingEntry(false)}
                  />
                )}

                <LorebookEntryList 
                  lorebookType={initialType}
                  entries={entries}
                  entriesTotal={entriesTotal}
                  entriesPage={entriesPage}
                  entrySort={entrySort}
                  entryCategoryFilter={entryCategoryFilter}
                  entrySearch={entrySearch}
                  isLoading={isEntriesLoading}
                  
                  editingEntryId={editingEntryId}
                  editKeywords={editEntryKeywords}
                  editContent={editEntryContent}
                  editCategory={editEntryCategory}
                  editAlwaysInc={editEntryAlwaysInc}
                  editPriority={editEntryPriority}
                  
                  showDeleteModal={false}
                  onDeleteRequest={handleEntryDelete}
                  onDeleteConfirm={confirmEntryDelete}
                  onDeleteCancel={() => setShowEntryDeleteModal(false)}
                  
                  onPageChange={setEntriesPage}
                  onSortChange={setEntrySort}
                  onCategoryFilterChange={setEntryCategoryFilter}
                  onSearchChange={setEntrySearch}
                  
                  onEditStart={(entry) => {
                    setEditingEntryId(entry.id)
                    setEditEntryKeywords(entry.keywords.join(', '))
                    setEditEntryContent(entry.content)
                    setEditEntryCategory(entry.category || 'fact')
                    setEditEntryAlwaysInc(!!entry.is_always_included)
                    setEditEntryPriority(entry.priority || 3)
                  }}
                  onEditSave={handleEntrySave}
                  onEditCancel={() => setEditingEntryId(null)}
                  onEditKeywordsChange={setEditEntryKeywords}
                  onEditContentChange={setEditEntryContent}
                  onEditCategoryChange={setEditEntryCategory}
                  onEditAlwaysIncChange={setEditEntryAlwaysInc}
                  onEditPriorityChange={setEditEntryPriority}
                />
                
                {showEntryDeleteModal && (
                  <ConfirmModal 
                    isOpen={showEntryDeleteModal}
                    title="Удалить запись?"
                    description="Это действие необратимо. Запись будет полностью удалена из лорбука."
                    confirmLabel="Да, удалить"
                    onConfirm={confirmEntryDelete}
                    onCancel={() => setShowEntryDeleteModal(false)}
                  />
                )}
              </>
            )}
          </div>
        </div>
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
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          />
        </div>
        
        <div className={styles.sectionActions}>
          <div className={styles.viewControls}>
            <button className={`${styles.viewBtn} ${viewMode === 'table' ? styles.activeViewBtn : ''}`} onClick={() => setViewMode('table')}>Список</button>
            <button className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.activeViewBtn : ''}`} onClick={() => setViewMode('grid')}>Карточки</button>
            <button className={`${styles.filterBtn} ${isFilterActive ? styles.filterBtnActive : ''}`} onClick={onToggleFilter} style={{ padding: '8px', width: '38px', height: '38px', justifyContent: 'center', marginLeft: '8px' }}>
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
                <th onClick={() => onSort?.('category')} style={{ cursor: 'pointer' }}>Категория {renderSortIcon?.('category')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredLorebooks.map(lb => (
                <tr key={lb.id} onClick={() => handleView(lb.id)} style={{ cursor: 'pointer' }}>
                  <td><span style={{ fontWeight: 700 }}>{lb.name}</span></td>
                  <td>
                    <Badge variant={initialType === 'fandom' ? 'fuchsia' : initialType === 'persona' ? 'teal' : 'orange'}>
                      {initialType === 'fandom' ? lb.fandom : initialType === 'persona' ? (lb.user_persona_name || personas.find(p => p.id === lb.user_persona_id)?.name || lb.user_persona_id) : (lb.character_name || characters.find(c => c.id === lb.character_id)?.name || lb.character_id)}
                    </Badge>
                  </td>
                  <td>{lb.entries?.length || lb.entries_count || 0}</td>
                  <td>
                    <Badge variant="purple" style={{ alignSelf: 'flex-start' }}>{LB_CATEGORY_MAP[lb.category || 'general'] || lb.category || 'Общая'}</Badge>
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
                {initialType !== 'persona' && (
                  <div style={{ position: 'relative', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {lb.tags?.includes('main') && (characters.find(c => String(c.id) === String(lb.character_id))?.type === 'original') && (
                      <div className={styles.infoNote} style={{ margin: '-20px -20px 16px -20px', padding: '10px 16px', fontSize: '0.75rem', borderLeft: 'none', borderRight: 'none', borderTop: 'none', width: 'auto' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px', color: 'var(--accent-orange)', flexShrink: 0}}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                        Основной лорбук
                      </div>
                    )}
                    <button className={`${styles.iconBtn} ${styles.dangerBtn}`} style={{ '--btn-accent': 'var(--accent-red)' } as React.CSSProperties} onClick={(e) => { e.stopPropagation(); setLbToDeleteId(lb.id); setShowDeleteModal(true); }} disabled={lb.tags?.includes('main') && (characters.find(c => String(c.id) === String(lb.character_id))?.type === 'original')} title={lb.tags?.includes('main') && (characters.find(c => String(c.id) === String(lb.character_id))?.type === 'original') ? "Основной лорбук нельзя удалить" : "Удалить"}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                )}
              </div>
              <div className={styles.cardTop}>
                <div className={styles.cardInfo}>
                  <h3 className={styles.cardName}>{lb.name}</h3>
                  <div style={{ marginTop: '6px' }}>
                    <Badge variant={initialType === 'fandom' ? 'fuchsia' : initialType === 'persona' ? 'teal' : 'orange'}>
                      {initialType === 'fandom' ? lb.fandom : initialType === 'persona' ? (lb.user_persona_name || personas.find(p => p.id === lb.user_persona_id)?.name || lb.user_persona_id) : (lb.character_name || characters.find(c => c.id === lb.character_id)?.name || lb.character_id)}
                    </Badge>
                    <Badge variant="purple" style={{ marginLeft: '6px', alignSelf: 'flex-start' }}>{LB_CATEGORY_MAP[lb.category || 'general'] || lb.category || 'Общая'}</Badge>
                  </div>
                </div>
              </div>
              <div className={styles.cardStats} style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Записей</span><span className={styles.statValue}>{lb.entries?.length || lb.entries_count || 0}</span>
                </div>
                <div className={styles.statItem} style={{ gridColumn: 'span 2' }}>
                  <span className={styles.statLabel}>Лорбук</span><span className={styles.statValue} style={{ fontSize: '0.75rem', opacity: 0.4, fontFamily: 'monospace' }}>{initialType.toUpperCase()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showDeleteModal && (
        <ConfirmModal 
          isOpen={showDeleteModal}
          title="Удалить лорбук?"
          description="Это действие необратимо. Лорбук будет полностью удален."
          confirmLabel="Да, удалить"
          onConfirm={handleDelete}
          onCancel={() => {
            setShowDeleteModal(false)
            setLbToDeleteId(null)
          }}
        />
      )}
    </div>
  )
}
