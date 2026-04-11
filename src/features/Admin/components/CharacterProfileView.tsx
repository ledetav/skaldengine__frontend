import React, { useState, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import styles from '../Admin.module.css'
import type { Character, Lorebook } from '../types'

interface CharacterProfileViewProps {
  characterId: string
  characters: Character[]
  allLorebooks: Lorebook[]
  onBack: () => void
  onUpdateCharacter: (char: Character) => void
  onUpdateLorebooks: (lorebooks: Lorebook[]) => void
  onSave?: () => void
}

export function CharacterProfileView({ 
  characterId, 
  characters, 
  allLorebooks,
  onBack, 
  onUpdateCharacter,
  onUpdateLorebooks,
  onSave
}: CharacterProfileViewProps) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const character = characters.find(c => c.id === characterId)
  
  const isEditing = pathname.includes('/edit/') || pathname.includes('/create/')
  const isCreate = pathname.includes('/create/')
  const [fandomSearch, setFandomSearch] = useState('')
  const [isFandomOpen, setIsFandomOpen] = useState(false)
  const [isAddingLorebook, setIsAddingLorebook] = useState(false)

  // Get unique fandoms for the dropdown
  const availableFandoms = useMemo(() => {
    const fandoms = new Set(characters.map(c => c.fandom).filter(Boolean))
    return Array.from(fandoms).sort()
  }, [characters])

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
    onUpdateCharacter({ ...character, [field]: value })
  }

  const toggleLorebook = (lbId: string) => {
    const updated = allLorebooks.map(lb => {
      if (lb.id === lbId) {
        return {
          ...lb,
          character_id: lb.character_id === character.id ? undefined : character.id
        }
      }
      return lb
    })
    onUpdateLorebooks(updated)
  }

  // Lorebooks attached to this character
  const charLorebooks = allLorebooks.filter(lb => lb.character_id === character.id)
  
  // Available lorebooks to attach (not fandom-specific, or those already attached)
  const attachableLorebooks = allLorebooks.filter(lb => !lb.fandom || lb.character_id === character.id)

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
                  <div className={styles.pencilOverlay}>
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
                      {character.fandom || 'Выберите фандом'}
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
                            handleChange('fandom', '')
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
                  <p className={styles.charProfileFandom}>{character.fandom || 'Оригинальный'}</p>
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
                    <span className={styles.cardTag} style={{ color: character.is_public ? '#4ade80' : '#fb7185', background: character.is_public ? 'rgba(74, 222, 128, 0.05)' : 'rgba(251, 113, 133, 0.05)' }}>
                      {character.is_public ? 'Public' : 'Private'}
                    </span>
                    {character.nsfw_allowed && (
                      <span className={styles.cardTag} style={{ color: '#ff4d4d', background: 'rgba(255, 77, 77, 0.05)' }}>NSFW</span>
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
                  charLorebooks.map(lb => (
                    <div key={lb.id} className={`${styles.lorebookMiniCard} ${isEditing ? styles.lorebookMiniCardSelected : ''}`} onClick={() => isEditing && toggleLorebook(lb.id)}>
                      <div className={styles.lorebookMiniInfo}>
                        <span className={styles.lorebookMiniName}>{lb.name}</span>
                        <span className={styles.lorebookMiniDesc}>
                          {lb.entries.length} записей • {lb.id}
                        </span>
                      </div>
                      {isEditing && (
                        <div className={styles.checkMark}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        </div>
                      )}
                    </div>
                  ))
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

            <div className={styles.actionRow}>
              {!isEditing ? (
                <button 
                  className={styles.createBtn} 
                  onClick={() => navigate(`/admin/characters/${characterId}/edit/debug`)}
                >
                  Редактировать
                </button>
              ) : (
                <button 
                  className={styles.createBtn} 
                  onClick={() => onSave ? onSave() : navigate(`/admin/characters/${characterId}/debug`)}
                >
                  {onSave ? 'Создать персонажа' : 'Сохранить'}
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
