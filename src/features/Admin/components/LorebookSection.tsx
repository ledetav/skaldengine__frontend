import { useState, useMemo, useEffect, type ChangeEvent, type ReactNode } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Button, Input, Card, Badge, useToast } from '@/components/ui'
import styles from '../Admin.module.css'
import { SearchableSelect } from './SearchableSelect'
import { Pagination } from './Pagination'
import { ApiClient } from '@/core/api/client'
import type { Lorebook, LorebookEntry, Character, User, UserPersona } from '../types'

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

  const isCreateMode = id === 'create'
  const isEditMode = pathname.includes('/edit') || isCreateMode
  const isDetailMode = !!id

  const draftLb = useMemo(() => isCreateMode ? {
    id: 'create',
    name: 'Новый лорбук',
    type: initialType === 'fandom' ? 'fandom' : initialType === 'persona' ? 'persona' : 'character',
    fandom: '',
    description: '',
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

  const [editType, setEditType] = useState<'fandom' | 'character' | 'persona'>(initialType)
  const [selectedFandom, setSelectedFandom] = useState('')
  const [isNewFandom, setIsNewFandom] = useState(false)
  const [selectedCharId, setSelectedCharId] = useState('')
  const [selectedUserId, setSelectedUserId] = useState('')
  const [selectedPersonaId, setSelectedPersonaId] = useState('')

  const [isMain, setIsMain] = useState(false)

  // Sync state when lb changes or entering edit mode (Bug fix: fields not populating without reload)
  useEffect(() => {
    if (lb && isEditMode) {
      setEditName(lb.name || '')
      setEditDescription(lb.description || '')
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

  const [entryAddType, setEntryAddType] = useState<'single' | 'batch' | 'json'>('single')
  const [newEntryKeywords, setNewEntryKeywords] = useState('')
  const [newEntryContent, setNewEntryContent] = useState('')
  const [batchText, setBatchText] = useState('')

  const [entries, setEntries] = useState<LorebookEntry[]>([])
  const [entriesTotal, setEntriesTotal] = useState(0)
  const [entriesPage, setEntriesPage] = useState(1)
  const [isEntriesLoading, setIsEntriesLoading] = useState(false)

  const fetchEntries = async (page: number) => {
    if (!lb?.id || lb.id === 'create') return
    setIsEntriesLoading(true)
    const skip = (page - 1) * 20
    try {
      const res = await ApiClient.get<any>('core', `/lorebooks/${lb.id}/entries?skip=${skip}&limit=20`)
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
  }, [lb?.id, isDetailMode, entriesPage])

  const [editingEntryId, setEditingEntryId] = useState<string | null>(null)
  const [editEntryKeywords, setEditEntryKeywords] = useState('')
  const [editEntryContent, setEditEntryContent] = useState('')
  const [entrySearch, setEntrySearch] = useState('')
  const [showEntryDeleteModal, setShowEntryDeleteModal] = useState(false)
  const [entryToDeleteId, setEntryToDeleteId] = useState<string | null>(null)

  const filteredEntries = useMemo(() => {
    if (!entries) return []
    if (!entrySearch) return entries
    const s = entrySearch.toLowerCase()
    return entries.filter((e: LorebookEntry) => 
      e.content.toLowerCase().includes(s) || 
      e.keywords.some((k: string) => k.toLowerCase().includes(s))
    )
  }, [entries, entrySearch])

  const handleEntrySave = async (entryId: string) => {
    try {
      const { lorebooksApi } = await import('@/core/api/lorebooks')
      const keywords = editEntryKeywords
        .replace(/,\s+/g, ',')
        .split(',')
        .map((k: string) => k.trim())
        .filter(Boolean)
      
      await lorebooksApi.updateLorebookEntry(lb!.id, entryId, {
        keywords,
        content: editEntryContent,
        priority: 100
      })
      success('Запись обновлена')
      setEditingEntryId(null)
    } catch (e: any) {
      console.error(e)
      success('Ошибка обновления записи')
    }
  }

  const handleEntryDelete = (entryId: string) => {
    setEntryToDeleteId(entryId)
    setShowEntryDeleteModal(true)
  }

  const confirmEntryDelete = async () => {
    if (!entryToDeleteId) return
    try {
      const { lorebooksApi } = await import('@/core/api/lorebooks')
      await lorebooksApi.deleteAdminLorebookEntry(lb!.id, entryToDeleteId)
      success('Запись удалена')
      setShowEntryDeleteModal(false)
      setEntryToDeleteId(null)
    } catch (e: any) {
      console.error(e)
      success('Ошибка удаления записи')
    }
  }

  const allFandoms = useMemo(() => {
    const s = new Set<string>()
    lorebooks.forEach(l => { if (l.fandom) s.add(l.fandom) })
    characters.forEach(c => { if (c.fandom) s.add(c.fandom) })
    return Array.from(s).filter(Boolean).filter(f => !['original', 'оригинальный'].includes(f.toLowerCase())).sort()
  }, [lorebooks, characters])

  const currentCharacter = useMemo(() => 
    characters.find(c => String(c.id) === String(selectedCharId || lb?.character_id)),
    [characters, selectedCharId, lb?.character_id]
  );
  
  const isOriginalChar = currentCharacter?.type === 'original';
  
  const mainLorebooksForChar = useMemo(() => 
    lorebooks.filter(l => String(l.character_id) === String(selectedCharId || lb?.character_id) && l.tags?.includes('main')),
    [lorebooks, selectedCharId, lb?.character_id]
  );

  const canToggleMain = useMemo(() => {
    if (!isOriginalChar) return true;
    if (!isMain) return true; // Can always turn ON
    
    // Check if the current lorebook is already main in the database
    const currentLb = lorebooks.find(l => l.id === id);
    const isStoredAsMain = currentLb?.tags?.includes('main');
    
    if (isStoredAsMain) {
      // If it's already main, it's the last one if length is 1
      return mainLorebooksForChar.length > 1;
    } else {
      // If it's NOT main yet (new or just toggled on), we can always turn it off 
      // as long as there's at least one OTHER main lorebook for the character
      return mainLorebooksForChar.length >= 1;
    }
  }, [isOriginalChar, isMain, mainLorebooksForChar, lorebooks, id]);

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
  const handleSave = async () => {
    try {
      const { lorebooksApi } = await import('@/core/api/lorebooks')
      const payload: Partial<Lorebook> = {
        name: editName,
        description: editDescription,
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
        handleView(id!) // or navigateDebug to view mode
      }
    } catch (e) {
      console.error('Failed to save lorebook', e)
      success('Ошибка при сохранении лорбука')
    }
  }

  const handleDelete = async () => {
    try {
      const { lorebooksApi } = await import('@/core/api/lorebooks')
      await lorebooksApi.deleteAdminLorebook(id!)
      success('Лорбук успешно удален')
      setShowDeleteModal(false)
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
          {/* 1. Main Info Card */}
          <div className={styles.detailGroup}>
            <div className={styles.detailTitle}>Основная информация</div>
            <Card className={styles.detailsCard} style={{ padding: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                <div className={styles.detailGroup}>
                  <div className={styles.detailTitle} style={{ fontSize: '0.6rem', letterSpacing: '0.1em' }}>Название</div>
                  {isEditMode ? (
                    <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
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
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <SearchableSelect 
                            options={allFandoms.map(f => ({ id: f, name: f }))}
                            value={isNewFandom ? 'new' : selectedFandom}
                            customValueLabel={isNewFandom ? '+ Создать свой' : undefined}
                            onChange={(val) => {
                              if (val === 'new') {
                                setIsNewFandom(true)
                                setSelectedFandom('')
                              } else {
                                setIsNewFandom(false)
                                setSelectedFandom(val)
                              }
                            }}
                            placeholder="Выберите фандом..."
                            onCreateNew={() => {
                              setIsNewFandom(true)
                              setSelectedFandom('')
                            }}
                            onCreateLabel="+ Создать свой фандом"
                          />
                          {isNewFandom && (
                            <Input 
                              placeholder="Название нового фандома" 
                              value={selectedFandom} 
                              onChange={(e: ChangeEvent<HTMLInputElement>) => setSelectedFandom(e.target.value)} 
                              autoFocus
                            />
                          )}
                        </div>
                      )}

                      {editType === 'character' && (
                        <SearchableSelect 
                          options={characters.map(c => ({ 
                            id: c.id, 
                            name: c.name, 
                            subtext: c.fandom || 'Независимый' 
                          }))}
                          value={selectedCharId}
                          onChange={setSelectedCharId}
                          placeholder="Выберите персонажа..."
                        />
                      )}

                      {editType === 'persona' && (
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <div style={{ flex: 1 }}>
                            <SearchableSelect 
                              options={users.map(u => ({ id: u.id, name: u.username }))}
                              value={selectedUserId}
                              onChange={(val) => {
                                setSelectedUserId(val)
                                setSelectedPersonaId('')
                              }}
                              placeholder="Пользователь..."
                            />
                          </div>
                          <div style={{ flex: 1 }}>
                            <SearchableSelect 
                              options={userPersonas.map(p => ({ id: p.id, name: p.name }))}
                              value={selectedPersonaId}
                              onChange={setSelectedPersonaId}
                              placeholder="Персона..."
                              disabled={!selectedUserId}
                            />
                          </div>
                        </div>
                      )}

                      {editType === 'character' && isOriginalChar && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div 
                            className={`${styles.toggleRow} ${isMain ? styles.toggleActive : ''} ${!canToggleMain ? styles.toggleLocked : ''}`}
                            onClick={() => canToggleMain && setIsMain(!isMain)}
                            style={{ marginTop: '4px', cursor: canToggleMain ? 'pointer' : 'not-allowed' }}
                          >
                            <div className={styles.toggleSwitch} />
                            <span className={styles.toggleLabel}>Основной лорбук персонажа</span>
                          </div>
                          {!canToggleMain && (
                            <div className={styles.infoNote} style={{ marginTop: '8px', marginBottom: 0 }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px', color: 'var(--accent-orange)', flexShrink: 0}}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                              <span style={{ fontSize: '0.8rem' }}>У оригинального персонажа должен быть хотя бы один основной лорбук</span>
                            </div>
                          )}
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
                      {lb.tags?.includes('main') && initialType === 'character' && (characters.find(c => String(c.id) === String(lb.character_id))?.type === 'original') && (
                        <Badge variant="orange">ОСНОВНОЙ</Badge>
                      )}
                    </div>
                  )}
                </div>

                <div className={styles.detailGroup} style={{ gridColumn: 'span 2' }}>
                  <div className={styles.detailTitle} style={{ fontSize: '0.6rem', letterSpacing: '0.1em' }}>Описание</div>
                  {isEditMode ? (
                    <Input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
                  ) : (
                    <div style={{ opacity: 0.7, lineHeight: 1.6 }}>{lb.description || 'Описание отсутствует'}</div>
                  )}
                </div>
              </div>

              <div className={styles.actionRow} style={{ border: 'none', padding: 0, marginTop: 0, justifyContent: 'space-between', alignItems: 'flex-end' }}>
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
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                        {lb.tags?.includes('main') && isOriginalChar && (
                          <div className={styles.infoNote} style={{ marginBottom: '12px', width: '100%' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px', color: 'var(--accent-orange)', flexShrink: 0}}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                            <span style={{ fontSize: '0.8rem' }}>Основной лорбук оригинального персонажа нельзя удалить</span>
                          </div>
                        )}
                        <Button 
                          variant="danger" 
                          onClick={() => setShowDeleteModal(true)}
                          disabled={lb.tags?.includes('main') && isOriginalChar}
                          title={lb.tags?.includes('main') && isOriginalChar ? "Основной лорбук нельзя удалить" : ""}
                        >
                          Удалить лорбук
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </Card>
          </div>

          {/* 2. Entries Table Section */}
          <div className={styles.detailGroup}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div className={styles.detailTitle}>Записи в лорбуке ({entriesTotal})</div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div className={styles.searchWrapper} style={{ margin: 0, height: '36px', width: '200px' }}>
                  <svg className={styles.searchIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input 
                    type="text" 
                    placeholder="Поиск по записям..." 
                    className={styles.searchBox}
                    style={{ padding: '6px 10px 6px 32px', fontSize: '0.75rem' }}
                    value={entrySearch}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setEntrySearch(e.target.value)}
                  />
                </div>
                <Button variant="ghost" style={{ fontSize: '0.75rem', padding: '8px 16px' }} onClick={() => setIsAddingEntry(!isAddingEntry)}>
                  {isAddingEntry ? 'Отмена' : '+ Добавить записи'}
                </Button>
              </div>
            </header>

            {isAddingEntry && (
              <Card style={{ padding: '24px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className={styles.roleBtnGroup} style={{ margin: 0, alignSelf: 'flex-start' }}>
                  <button 
                    className={`${styles.roleBtn} ${entryAddType === 'single' ? styles.roleBtnActive : ''}`}
                    onClick={() => setEntryAddType('single')}
                  >
                    Одиночная
                  </button>
                  <button 
                    className={`${styles.roleBtn} ${entryAddType === 'batch' ? styles.roleBtnActive : ''}`}
                    onClick={() => setEntryAddType('batch')}
                  >
                    Массовая
                  </button>
                  <button 
                    className={`${styles.roleBtn} ${entryAddType === 'json' ? styles.roleBtnActive : ''}`}
                    onClick={() => setEntryAddType('json')}
                  >
                    JSON
                  </button>
                </div>

                {entryAddType === 'single' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <Input placeholder="Ключевые слова (через запятую)" value={newEntryKeywords} onChange={(e: any) => setNewEntryKeywords(e.target.value)} />
                    <textarea 
                      className={styles.editTextarea} 
                      placeholder="Содержание записи..." 
                      value={newEntryContent} 
                      onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNewEntryContent(e.target.value)} 
                      style={{ minHeight: '80px' }}
                    />
                  </div>
                )}

                {entryAddType === 'batch' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <textarea 
                      className={styles.editTextarea} 
                      placeholder="Формат: ключевое слово | описание (каждая запись с новой строки)" 
                      value={batchText} 
                      onChange={(e: any) => setBatchText(e.target.value)} 
                      style={{ minHeight: '150px', fontFamily: 'monospace', fontSize: '0.8rem' }}
                    />
                  </div>
                )}

                {entryAddType === 'json' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <textarea 
                      className={styles.editTextarea} 
                      placeholder='[{"keywords": ["слово"], "content": "описание"}, ...]' 
                      value={batchText} 
                      onChange={(e: any) => setBatchText(e.target.value)} 
                      style={{ minHeight: '150px', fontFamily: 'monospace', fontSize: '0.8rem' }}
                    />
                  </div>
                )}

                <Button variant="orange" style={{ alignSelf: 'flex-start' }} onClick={async () => {
                  try {
                    const { lorebooksApi } = await import('@/core/api/lorebooks')
                    
                    if (entryAddType === 'single') {
                      await lorebooksApi.createLorebookEntry(lb!.id, {
                        keywords: newEntryKeywords.split(',').map((k: string) => k.trim()).filter(Boolean),
                        content: newEntryContent,
                        priority: 100
                      })
                    } else if (entryAddType === 'batch') {
                      const entries = batchText.split('\n')
                        .map(line => {
                          const [kw, ...contentParts] = line.split('|')
                          return {
                            keywords: kw ? [kw.trim()] : [],
                            content: contentParts.join('|').trim(),
                            priority: 100
                          }
                        })
                        .filter(e => e.keywords.length > 0 && e.content)
                      
                      await lorebooksApi.createLorebookEntriesBulk(lb!.id, entries)
                    } else if (entryAddType === 'json') {
                      const entries = JSON.parse(batchText)
                      await lorebooksApi.createLorebookEntriesBulk(lb!.id, entries.map((e: any) => ({
                        keywords: e.keywords || [],
                        content: e.content || '',
                        priority: e.priority || 100
                      })))
                    }

                    success('Записи добавлены')
                    setIsAddingEntry(false)
                    setNewEntryContent('')
                    setNewEntryKeywords('')
                    setBatchText('')
                  } catch (e: any) {
                    console.error(e)
                    success('Ошибка добавления записей')
                  }
                }}>Сохранить записи</Button>
              </Card>
            )}
            
            <div className={styles.tableWrapper}>
              <table className={styles.compactTable}>
                <thead>
                  <tr>
                    <th style={{ width: '250px' }}>Тэги</th>
                    <th>Содержание</th>
                    <th style={{ width: '120px', textAlign: 'right' }}>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.slice(0, 20).map((entry: LorebookEntry, i: number) => {
                    const isEditing = editingEntryId === entry.id
                    return (
                      <tr key={entry.id || i}>
                        <td>
                          {isEditing ? (
                            <Input 
                              value={editEntryKeywords} 
                              onChange={(e: ChangeEvent<HTMLInputElement>) => setEditEntryKeywords(e.target.value)}
                              placeholder="Тэги через запятую"
                              style={{ fontSize: '0.8rem', height: '32px' }}
                              autoFocus
                            />
                          ) : (
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                              {entry.keywords?.flatMap((k: string) => k.split(',').map((s: string) => s.trim())).filter(Boolean).map((kw: string, idx: number) => (
                                <Badge key={`${kw}-${idx}`} variant={initialType === 'fandom' ? 'fuchsia' : initialType === 'persona' ? 'teal' : 'purple'} style={{ fontSize: '0.6rem', padding: '2px 6px' }}>{kw}</Badge>
                              ))}
                            </div>
                          )}
                        </td>
                        <td>
                          {isEditing ? (
                            <textarea 
                              className={styles.editTextarea}
                              value={editEntryContent}
                              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setEditEntryContent(e.target.value)}
                              style={{ minHeight: '60px', fontSize: '0.85rem', width: '100%', background: 'rgba(0,0,0,0.2)' }}
                            />
                          ) : (
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
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                            {isEditing ? (
                              <>
                                <button className={styles.iconBtn} onClick={() => handleEntrySave(entry.id)} style={{ color: 'var(--accent-teal)' }}>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                </button>
                                <button className={styles.iconBtn} onClick={() => setEditingEntryId(null)} style={{ color: 'var(--accent-red)' }}>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                </button>
                              </>
                            ) : (
                              <>
                                <button className={styles.iconBtn} onClick={() => {
                                  setEditingEntryId(entry.id)
                                  setEditEntryKeywords(entry.keywords.join(', '))
                                  setEditEntryContent(entry.content)
                                }}>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                                </button>
                                <button className={styles.iconBtn} onClick={() => handleEntryDelete(entry.id)} style={{ opacity: 0.5 }}>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {isEntriesLoading && <div style={{ padding: '20px', textAlign: 'center', opacity: 0.5 }}>Загрузка записей...</div>}
            </div>
            <Pagination 
              currentPage={entriesPage}
              totalItems={entriesTotal}
              pageSize={20}
              onPageChange={setEntriesPage}
            />
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
                <Button variant="danger" onClick={handleDelete}>Да, удалить</Button>
              </div>
            </div>
          </div>
        )}

        {showEntryDeleteModal && (
          <div className={styles.modalOverlay} onClick={() => setShowEntryDeleteModal(false)}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
              <h3 className={styles.modalTitle}>Удалить запись?</h3>
              <p className={styles.modalDescription}>
                Это действие необратимо. Запись будет полностью удалена из лорбука.
              </p>
              <div className={styles.modalActions}>
                <Button variant="ghost" onClick={() => setShowEntryDeleteModal(false)}>Отмена</Button>
                <Button variant="danger" onClick={confirmEntryDelete}>Да, удалить</Button>
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
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
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
                  <div style={{ position: 'relative', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {lb.tags?.includes('main') && (characters.find(c => String(c.id) === String(lb.character_id))?.type === 'original') && (
                      <div className={styles.infoNote} style={{ margin: '-20px -20px 16px -20px', padding: '10px 16px', fontSize: '0.75rem', borderLeft: 'none', borderRight: 'none', borderTop: 'none', width: 'auto' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px', color: 'var(--accent-orange)', flexShrink: 0}}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                        Основной лорбук
                      </div>
                    )}
                    <button 
                      className={`${styles.iconBtn} ${styles.dangerBtn}`} 
                      style={{ '--btn-accent': 'var(--accent-red)' } as React.CSSProperties}
                      onClick={(e) => { e.stopPropagation(); setShowDeleteModal(true); }}
                      disabled={lb.tags?.includes('main') && (characters.find(c => String(c.id) === String(lb.character_id))?.type === 'original')}
                      title={lb.tags?.includes('main') && (characters.find(c => String(c.id) === String(lb.character_id))?.type === 'original') ? "Основной лорбук нельзя удалить" : "Удалить"}
                    >
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
