import { useState, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import styles from '../Admin.module.css'
import type { Character, Lorebook } from '../types'
import { Badge, Button, useToast } from '@/components/ui'

interface CharacterProfileViewProps {
  characterId: string
  characters: Character[]
  allLorebooks: Lorebook[]
  onBack: () => void
  onUpdateCharacter: (char: Character) => void
  onSave?: (char: Character) => void | Promise<void>
}

export function CharacterProfileView({ 
  characterId, 
  characters, 
  allLorebooks,
  onBack, 
  onUpdateCharacter,
  onSave
}: CharacterProfileViewProps) {
  const { success } = useToast()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const navigateDebug = (route: string) => {
    const isDebug = pathname.includes('/debug')
    const finalRoute = isDebug && !route.endsWith('/debug') ? route.replace(/\/?$/, '/debug') : route
    navigate(finalRoute)
  }
  
  const isEditing = pathname.includes('/edit') || pathname.includes('/create') || characterId === 'create'
  const isCreate = characterId === 'create' || pathname.includes('/create/')
  const [fandomSearch, setFandomSearch] = useState('')
  const [isFandomOpen, setIsFandomOpen] = useState(false)
  const [isAddingLorebook, setIsAddingLorebook] = useState(false)

  const [draftCharacter, setDraftCharacter] = useState<Character | undefined>(isCreate ? {
    id: 'create',
    name: 'Новый персонаж',
    total_chats_count: 0,
    monthly_chats_count: 0,
    scenarios_count: 0,
    scenario_chats_count: 0,
    nsfw_allowed: false,
    is_public: false,
    is_deleted: false,
    lorebook_ids: [],
  } as Character : undefined)

  const character = isCreate ? draftCharacter : characters.find(c => c.id === characterId)

  // Get unique fandoms from LOREBOOKS for the dropdown (Task 4)
  const availableFandoms = useMemo(() => {
    const fandoms = new Set(allLorebooks.map(lb => lb.fandom).filter(Boolean))
    return Array.from(fandoms).sort()
  }, [allLorebooks])

  const filteredFandoms = availableFandoms.filter(f => 
    f?.toLowerCase().includes(fandomSearch.toLowerCase())
  )

  if (!character) {
    return (
      <div className={styles.characterProfileOverlay}>
        <div style={{ padding: '40px', color: '#fff' }}>
          <h2>Персонаж не найден</h2>
          <button onClick={onBack} className={styles.createBtn}>Назад</button>
        </div>
      </div>
    )
  }

  const handleChange = (field: keyof Character, value: any) => {
    if (isCreate && draftCharacter) {
      const updated = { ...draftCharacter, [field]: value }
      setDraftCharacter(updated)
      
      if (field === 'fandom') {
        const fandomLbs = allLorebooks.filter(lb => lb.fandom === value && value !== '')
        const fandomLbIds = fandomLbs.map(lb => lb.id)
        const currentIds = draftCharacter?.lorebook_ids || []
        const newIds = Array.from(new Set([...currentIds, ...fandomLbIds]))
        
        const updated = { ...draftCharacter, [field]: value, lorebook_ids: newIds } as Character
        setDraftCharacter(updated)
      } else {
        const updated = { ...draftCharacter, [field]: value }
        setDraftCharacter(updated)
      }
    } else {
      if (field === 'fandom') {
        const fandomLbs = allLorebooks.filter(lb => lb.fandom === value && value !== '')
        const fandomLbIds = fandomLbs.map(lb => lb.id)
        const currentIds = character.lorebook_ids || []
        const newIds = Array.from(new Set([...currentIds, ...fandomLbIds]))

        const updated = { ...character, [field]: value, lorebook_ids: newIds }
        onUpdateCharacter(updated)
      } else {
        const updated = { ...character, [field]: value }
        onUpdateCharacter(updated)
      }
    }
  }

  const toggleLorebook = (lbId: string) => {
    const currentIds = character.lorebook_ids || []
    const isAttached = currentIds.includes(lbId)
    
    let newIds: string[]
    if (isAttached) {
      newIds = currentIds.filter(id => id !== lbId)
    } else {
      newIds = [...currentIds, lbId]
    }

    if (isCreate && draftCharacter) {
      setDraftCharacter({ ...draftCharacter, lorebook_ids: newIds })
    } else {
      onUpdateCharacter({ ...character, lorebook_ids: newIds })
    }
  }

  const handleDelete = async () => {
    try {
      const { charactersApi } = await import('@/core/api/characters')
      await charactersApi.deleteAdminCharacter(character.id)
      success('Персонаж успешно удален')
      setShowDeleteModal(false)
      onBack()
    } catch (e) {
      console.error('Failed to delete character', e)
      success('Ошибка при удалении персонажа')
    }
  }

  // Lorebooks to display in the main list:
  // 1. Lorebooks belonging to this fandom (Requirement 1.3)
  // 2. Lorebooks specifically linked via character.lorebook_ids
  const charLorebooks = useMemo(() => {
    const linkedIds = character.lorebook_ids || []
    return allLorebooks.filter(lb => 
      linkedIds.includes(lb.id) || 
      (character.fandom && lb.fandom === character.fandom && character.fandom !== '')
    )
  }, [allLorebooks, character.lorebook_ids, character.fandom])
  
  // Available lorebooks to attach (not fandom-specific, and NOT already in the list)
  const attachableLorebooks = allLorebooks.filter(lb => 
    (!lb.fandom || lb.fandom === '') && 
    !(character.lorebook_ids || []).includes(lb.id)
  )

  return (
    <div className={styles.characterProfileOverlay}>
      <header className={styles.backHeader}>
        <button className={styles.backBtn} onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
        </button>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span className={styles.mainSubtitle}>Панель управления персонажем</span>
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900 }}>{character.name}</h2>
        </div>
      </header>

      <div className={styles.characterProfileContent}>
        {/* LEFT: Sidebar style card */}
        <aside className={styles.sidebarWrapper}>
          <div className={styles.charSidebarCard}>
            <div className={styles.charCover}>
              <div className={styles.imageEditWrapper} style={{ height: '100%' }}>
                <img 
                  src={character.card_image_url || character.avatar_url} 
                  className={styles.charCoverImg} 
                  alt="Cover" 
                />
                {isEditing && (
                  <div className={styles.pencilOverlay} onClick={() => navigateDebug(`/admin/characters/${characterId}/edit`)}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </div>
                )}
              </div>
              <div className={styles.charAvatarWrapper}>
                <div className={styles.imageEditWrapper} style={{ width: '100%', height: '100%' }}>
                  <img src={character.avatar_url} className={styles.charAvatar} alt={character.name} />
                  {isEditing && (
                    <div className={styles.pencilOverlay}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.charBasicInfo}>
              {isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                  <input 
                    className={styles.editInput}
                    value={character.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    style={{ textAlign: 'center', fontSize: '1.2rem', fontWeight: 950 }}
                  />
                  
                  <div className={styles.customDropdown}>
                    <div className={styles.dropdownSelected} onClick={() => setIsFandomOpen(!isFandomOpen)}>
                      {character.fandom === 'Original' ? 'Оригинальный' : (character.fandom || 'Выберите фандом')}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                    </div>
                    {isFandomOpen && (
                      <div className={styles.dropdownMenu}>
                        <div className={styles.dropdownSearchWrapper}>
                          <input 
                            className={styles.dropdownSearch}
                            placeholder="Поиск..."
                            value={fandomSearch}
                            onChange={(e) => setFandomSearch(e.target.value)}
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <div className={styles.dropdownOptionsList}>
                          <div className={styles.dropdownOption} onClick={() => {
                            handleChange('fandom', 'Original')
                            setIsFandomOpen(false)
                          }}>
                            — Оригинальный
                          </div>
                          {filteredFandoms.map(f => (
                            <div key={f} className={styles.dropdownOption} onClick={() => {
                              handleChange('fandom', f)
                              setIsFandomOpen(false)
                            }}>
                              {f}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <h1 className={styles.charProfileName}>{character.name}</h1>
                  <div style={{ marginBottom: '16px' }}>
                    <Badge variant="orange">{character.fandom === 'Original' ? 'Оригинальный' : (character.fandom || 'Независимый')}</Badge>
                  </div>
                </>
              )}
              
              <div style={{ marginTop: '20px' }}>
                {isEditing ? (
                  <textarea 
                    className={styles.editTextarea}
                    value={character.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Краткое описание персонажа..."
                    style={{ fontSize: '0.85rem', minHeight: '80px' }}
                  />
                ) : (
                  <p style={{ 
                    fontSize: '0.9rem', 
                    color: 'rgba(255,255,255,0.45)', 
                    lineHeight: '1.6',
                    margin: 0,
                    fontWeight: 500
                  }}>
                    {character.description}
                  </p>
                )}
              </div>
            </div>

            {!isCreate && (
              <div className={styles.charStatsGrid}>
                <div className={styles.charStatBox}>
                  <span className={styles.statLabel}>Всего чатов</span>
                  <span className={styles.statValue}>{character.total_chats_count.toLocaleString()}</span>
                </div>
                <div className={styles.charStatBox}>
                  <span className={styles.statLabel}>За месяц</span>
                  <span className={styles.statValue}>{character.monthly_chats_count.toLocaleString()}</span>
                </div>
                <div className={styles.charStatBox} style={{ gridColumn: 'span 2', paddingBottom: '20px' }}>
                  <span className={styles.statLabel}>Настройки доступа</span>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <Badge variant={character.is_public ? 'green' : 'red'}>
                      {character.is_public ? 'Public' : 'Private'}
                    </Badge>
                    {character.nsfw_allowed && (
                      <Badge variant="red">NSFW</Badge>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* RIGHT: Detailed content */}
        <main className={styles.mainContentWrapper}>
          <div className={styles.detailsCard}>
            <div className={styles.detailGroup}>
              <div className={styles.detailTitle}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
                Внешность
              </div>
              {isEditing ? (
                <textarea 
                  className={styles.editTextarea}
                  value={character.appearance}
                  onChange={(e) => handleChange('appearance', e.target.value)}
                  placeholder="Опишите внешность..."
                />
              ) : (
                <p className={styles.detailText}>{character.appearance || 'Описание внешности не задано.'}</p>
              )}
            </div>

            <div className={styles.detailGroup}>
              <div className={styles.detailTitle}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                Личность
              </div>
              {isEditing ? (
                <>
                  <textarea 
                    className={styles.editTextarea}
                    value={character.personality}
                    onChange={(e) => handleChange('personality', e.target.value)}
                    placeholder="Опишите личность..."
                  />
                  <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                    <div 
                      className={`${styles.toggleRow} ${character.is_public ? styles.toggleActive : ''}`}
                      onClick={() => handleChange('is_public', !character.is_public)}
                    >
                      <div className={styles.toggleSwitch} />
                      <span className={styles.toggleLabel}>Публичный</span>
                    </div>
                    <div 
                      className={`${styles.toggleRow} ${character.nsfw_allowed ? styles.toggleActive : ''}`}
                      onClick={() => handleChange('nsfw_allowed', !character.nsfw_allowed)}
                    >
                      <div className={styles.toggleSwitch} />
                      <span className={styles.toggleLabel}>Режим NSFW</span>
                    </div>
                  </div>
                </>
              ) : (
                <p className={styles.detailText}>{character.personality || 'Описание личности не задано.'}</p>
              )}
            </div>

            <div className={styles.detailGroup}>
              <div className={styles.detailTitle}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                Лорбуки персонажа
              </div>
              
              <div className={styles.lorebookList}>
                {charLorebooks.length > 0 ? (
                  charLorebooks.map(lb => {
                    const isActive = (character.lorebook_ids || []).includes(lb.id)
                    const isFandomMatch = character.fandom && lb.fandom === character.fandom && character.fandom !== ''
                    
                    return (
                      <div 
                        key={lb.id} 
                        className={`${styles.lorebookMiniCard} ${isActive ? styles.lorebookMiniCardSelected : styles.lorebookMiniCardDeactivated}`} 
                        onClick={() => isEditing && toggleLorebook(lb.id)}
                        style={{ cursor: isEditing ? 'pointer' : 'default' }}
                      >
                        <div className={styles.lorebookMiniInfo}>
                          <span className={styles.lorebookMiniName} style={{ opacity: isActive ? 1 : 0.6 }}>{lb.name}</span>
                          <span className={styles.lorebookMiniDesc} style={{ opacity: isActive ? 1 : 0.4 }}>
                            {lb.entries?.length || 0} записей {isFandomMatch ? '• Фандом' : '• Персональный'}
                          </span>
                        </div>
                        {isActive && (
                          <div className={styles.checkMark}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          </div>
                        )}
                      </div>
                    )
                  })
                ) : (
                  <div style={{ 
                    background: 'rgba(255, 255, 255, 0.02)', 
                    padding: '24px',
                    borderRadius: '16px',
                    color: 'rgba(255,255,255,0.3)',
                    fontSize: '0.9rem',
                    fontStyle: 'italic',
                    textAlign: 'center',
                    border: '1px solid rgba(255,255,255,0.03)'
                  }}>
                    Лорбуки не привязаны.
                  </div>
                )}

                {isEditing && (
                  <div style={{ marginTop: '12px', position: 'relative' }}>
                    <button 
                      className={styles.addLorebookBtn} 
                      onClick={() => setIsAddingLorebook(!isAddingLorebook)}
                    >
                      {isAddingLorebook ? 'Закрыть список' : '+ Добавить лорбук'}
                    </button>

                    {isAddingLorebook && (
                      <div className={styles.lorebookSelectionDropdown}>
                        {attachableLorebooks.filter(lb => lb.character_id !== character.id).length > 0 ? (
                          attachableLorebooks
                            .filter(lb => lb.character_id !== character.id)
                            .map(lb => (
                              <div 
                                key={lb.id} 
                                className={styles.lorebookOption} 
                                onClick={() => {
                                  toggleLorebook(lb.id);
                                  setIsAddingLorebook(false);
                                }}
                              >
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <span className={styles.lorebookOptionName}>{lb.name}</span>
                                  <span className={styles.lorebookOptionMeta}>{lb.entries.length} записей</span>
                                </div>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                              </div>
                            ))
                        ) : (
                          <div style={{ padding: '16px', color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', textAlign: 'center' }}>
                            Нет доступных лорбуков
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.actionRow} style={{ justifyContent: 'space-between' }}>
              {!isEditing ? (
                <>
                  <button 
                    className={styles.createBtn} 
                    onClick={() => navigateDebug(`/admin/characters/${characterId}/edit`)}
                  >
                    Редактировать
                  </button>
                  <Button variant="danger" onClick={() => setShowDeleteModal(true)}>Удалить персонажа</Button>
                </>
              ) : (
                <button 
                  className={styles.createBtn} 
                  onClick={() => onSave ? onSave(character!) : navigateDebug(`/admin/characters/${characterId}`)}
                >
                  {isCreate ? 'Создать персонажа' : 'Сохранить'}
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
      {showDeleteModal && (
        <div className={styles.modalOverlay} onClick={() => setShowDeleteModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Удалить персонажа?</h3>
            <p className={styles.modalDescription}>
              Это действие необратимо. Персонаж <strong>{character.name}</strong> будет полностью удален из системы.
            </p>
              <div className={styles.modalActions}>
                <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>Отмена</Button>
                <Button variant="danger" onClick={handleDelete}>Да, удалить</Button>
              </div>
          </div>
        </div>
      )}
    </div>
  )
}
