import React, { useState, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import styles from '../Admin.module.css'
import type { Character, Lorebook } from '../types'
import { Badge, Button, useToast } from '@/components/ui'
import { SearchableSelect } from './SearchableSelect'

interface CharacterProfileViewProps {
  characterId: string
  characters: Character[]
  allLorebooks: Lorebook[]
  onBack: () => void
  onUpdateCharacter: (char: Character) => void
  onSave?: (char: Character) => void | Promise<void>
  onDelete?: (id: string) => void
}

export function CharacterProfileView({ 
  characterId, 
  characters, 
  allLorebooks,
  onBack, 
  onUpdateCharacter,
  onSave,
  onDelete
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
  const [isAddingLorebook, setIsAddingLorebook] = useState(false)

  const [draftCharacter, setDraftCharacter] = useState<Character | undefined>(isCreate ? {
    id: 'create',
    name: 'Новый персонаж',
    fandom: '',
    total_chats_count: 0,
    monthly_chats_count: 0,
    scenarios_count: 0,
    scenario_chats_count: 0,
    nsfw_allowed: false,
    is_public: false,
    is_deleted: false,
    type: 'fandom',
    lorebook_ids: [],
  } as Character : undefined)

  const character = isCreate ? draftCharacter : characters.find((c: Character) => c.id === characterId)

  // Get unique fandoms from LOREBOOKS for the dropdown (Task 4)
  const availableFandoms = useMemo(() => {
    const forbidden = ['original', 'оригинальный']
    const fandoms = new Set(
      allLorebooks
        .map((lb: Lorebook) => lb.fandom)
        .filter((f: string | undefined): f is string => !!f && !forbidden.includes(f.toLowerCase()))
    )
    return Array.from(fandoms as Set<string>).sort()
  }, [allLorebooks])


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
    const updateChar = (prev: Character, field: keyof Character, value: any): Character => {
      if (field === 'type') {
        const isFandom = value === 'fandom';
        const currentIds = prev.lorebook_ids || [];
        
        // When switching to original, clear fandom string and unlink all fandom LBs
        if (!isFandom) {
          const filteredIds = currentIds.filter(id => {
            const lb = allLorebooks.find(l => l.id === id);
            return lb?.type !== 'fandom';
          });
          return { ...prev, type: 'original', fandom: '', lorebook_ids: filteredIds };
        }
        return { ...prev, type: 'fandom' };
      }

      if (field === 'fandom') {
        const oldFandom = prev.fandom;
        const currentIds = prev.lorebook_ids || [];
        
        // Remove old fandom LBs
        const filteredIds = currentIds.filter((id: string) => {
          const lb = allLorebooks.find((l: Lorebook) => l.id === id);
          return !(lb && lb.type === 'fandom' && lb.fandom === oldFandom);
        });

        // Add new fandom LBs
        const newFandomLbs = allLorebooks.filter((lb: Lorebook) => lb.fandom === value && lb.type === 'fandom' && value !== '');
        const newIds = Array.from(new Set([...filteredIds, ...newFandomLbs.map((lb: Lorebook) => lb.id)]));
        
        return { ...prev, [field]: value, lorebook_ids: newIds };
      }

      return { ...prev, [field]: value };
    }

    if (isCreate && draftCharacter) {
      setDraftCharacter(updateChar(draftCharacter, field, value));
    } else {
      onUpdateCharacter(updateChar(character, field, value));
    }
  }

  const toggleLorebook = (lbId: string) => {
    const currentIds = character.lorebook_ids || []
    const isAttached = currentIds.includes(lbId)
    
    let newIds: string[]
    if (isAttached) {
      // Check if it's a main lorebook for an Original character (Requirement 2)
      const lb = allLorebooks.find((l: Lorebook) => l.id === lbId)
      if (isOriginal && lb?.tags?.includes('main')) {
        return // Don't allow removal
      }
      newIds = currentIds.filter((id: string) => id !== lbId)
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
      if (onDelete) onDelete(character.id)
      setShowDeleteModal(false)
      setTimeout(() => onBack(), 300)
    } catch (e) {
      console.error('Failed to delete character', e)
      success('Ошибка при удалении персонажа')
    }
  }

  const isOriginal = useMemo(() => 
    character.type?.toLowerCase() === 'original' || character.fandom?.toLowerCase() === 'original' || character.fandom?.toLowerCase() === 'оригинальный',
  [character.type, character.fandom])

  // Lorebooks to display in the main list:
  // 1. Lorebooks specifically linked via character.lorebook_ids
  // 2. Lorebooks belonging to this specific character (Requirement: visible on card)
  // 3. Lorebooks belonging to this fandom (if not original)
  const charLorebooks = useMemo(() => {
    const linkedIds = character.lorebook_ids || []
    return allLorebooks.filter((lb: Lorebook) => 
      linkedIds.includes(lb.id) || 
      lb.character_id === character.id ||
      (character.fandom && lb.fandom === character.fandom && character.fandom !== '' && !isOriginal)
    )
  }, [allLorebooks, character.lorebook_ids, character.fandom, isOriginal, character.id])
  
  // Available lorebooks to attach (Requirement 1)
  const attachableLorebooks = useMemo(() => {
    return allLorebooks.filter((lb: Lorebook) => {
      // 1. Don't show if already in the character's list (managed on card)
      if (charLorebooks.some((clb: Lorebook) => clb.id === lb.id)) return false;

      // 2. Include fandom lorebooks, but EXCLUDE those belonging to other characters
      if (character.fandom && lb.fandom === character.fandom && character.fandom !== '') {
        // If it's a character-specific lorebook and it's for another character, exclude it.
        if (lb.type === 'character' && lb.character_id && lb.character_id !== character.id) {
          return false;
        }
        return true;
      }
      
      return false;
    });
  }, [allLorebooks, character.fandom, charLorebooks, character.id]);

  return (
    <div className={`${styles.characterProfileOverlay} ${!isEditing ? styles.nonEditing : ''}`}>
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
                  src={character.card_image_url || (character.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${character.name || 'new'}`)} 
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
                  <img src={character.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${character.name || 'new'}`} className={styles.charAvatar} alt={character.name} />
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', width: '100%' }}>
                  <input 
                    className={styles.editInput}
                    value={character.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    style={{ textAlign: 'center', fontSize: '1.2rem', fontWeight: 950 }}
                  />

                  <div className={styles.typeSelector}>
                    <div 
                      className={`${styles.typeTab} ${character.type === 'fandom' ? styles.typeTabActive : ''} ${styles.typeTabFandom}`}
                      onClick={() => handleChange('type', 'fandom')}
                    >
                      Фандомный
                    </div>
                    <div 
                      className={`${styles.typeTab} ${character.type === 'original' ? styles.typeTabActive : ''} ${styles.typeTabOriginal}`}
                      onClick={() => handleChange('type', 'original')}
                    >
                      Оригинальный
                    </div>
                  </div>
                  
                  {character.type === 'fandom' && (
                    <SearchableSelect 
                      options={availableFandoms.map((f: string) => ({ id: f, name: f }))}
                      value={character.fandom || ''}
                      onChange={(val: string) => handleChange('fandom', val)}
                      placeholder="Выберите фандом"
                      className={styles.fandomSelect}
                    />
                  )}
                </div>
              ) : (
                <>
                  <h1 className={styles.charProfileName}>{character.name}</h1>
                  <div style={{ marginBottom: '16px' }}>
                    <Badge variant={isOriginal ? "orange" : "blue"}>{isOriginal ? 'Оригинальный' : (character.fandom || 'Фандомный')}</Badge>
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
                {isOriginal && (
                  <div className={styles.infoNote}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px', color: 'var(--accent-orange)'}}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                    Для оригинальных персонажей основной лорбук обязателен и не может быть удален.
                  </div>
                )}
                {charLorebooks.length > 0 ? (
                  charLorebooks.map((lb: Lorebook) => {
                    const isActive = (character.lorebook_ids || []).includes(lb.id) || (isOriginal && lb.tags?.includes('main'))
                    const isFandomMatch = character.fandom && lb.fandom === character.fandom && character.fandom !== ''
                    
                    return (
                      <div 
                        key={lb.id} 
                        className={`
                          ${styles.lorebookMiniCard} 
                          ${isActive ? styles.lorebookMiniCardSelected : styles.lorebookMiniCardDeactivated}
                          ${isOriginal && lb.tags?.includes('main') ? styles.lorebookMainLocked : ''}
                        `} 
                        onClick={() => {
                          if (isOriginal && lb.tags?.includes('main')) return;
                          isEditing && toggleLorebook(lb.id);
                        }}
                        style={{ 
                          cursor: isEditing ? (isOriginal && lb.tags?.includes('main') ? 'not-allowed' : 'pointer') : 'default' 
                        }}
                      >
                        <div className={styles.lorebookMiniInfo}>
                          <span className={styles.lorebookMiniName} style={{ opacity: isActive ? 1 : 0.6 }}>
                            {lb.name}
                            {isOriginal && lb.tags?.includes('main') && (
                              <span className={styles.mainLabel} title="Основной лорбук оригинального персонажа нельзя удалить">
                                (Основной)
                              </span>
                            )}
                          </span>
                          <span className={styles.lorebookMiniDesc} style={{ opacity: isActive ? 1 : 0.4 }}>
                            {lb.entries_count || lb.entries?.length || 0} записей {isFandomMatch ? '• Фандом' : '• Персональный'}
                          </span>
                          {isOriginal && lb.tags?.includes('main') && isEditing && (
                            <span className={styles.lockHint}>Обязательный для оригинального персонажа</span>
                          )}
                        </div>
                        {isActive && (
                          <div className={styles.checkMark}>
                            {isOriginal && lb.tags?.includes('main') ? (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                            ) : (
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            )}
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
                        {attachableLorebooks.length > 0 ? (
                          attachableLorebooks
                            .map((lb: Lorebook) => (
                              <div 
                                key={lb.id} 
                                className={styles.lorebookOption} 
                                onClick={() => {
                                  toggleLorebook(lb.id);
                                  setIsAddingLorebook(false);
                                }}
                              >
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <span className={styles.lorebookOptionName}>
                                    {lb.name}
                                    {lb.character_id === character.id && (
                                      <span style={{ fontSize: '0.65rem', color: 'var(--accent-orange)', marginLeft: '8px', opacity: 0.8 }}>
                                        (Ваш лорбук)
                                      </span>
                                    )}
                                  </span>
                                  <span className={styles.lorebookOptionMeta}>{lb.entries?.length || 0} записей</span>
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
          <div className={styles.modalContent} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
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
