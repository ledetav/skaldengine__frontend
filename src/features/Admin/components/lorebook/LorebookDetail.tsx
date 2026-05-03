import { useMemo } from 'react'
import { Badge, Button, Card, Input } from '@/components/ui'
import { SearchableSelect } from '../SearchableSelect'
import { ConfirmModal } from '@/components/common'
import { LB_CATEGORY_MAP, LB_CATEGORY_OPTIONS } from './lorebookConstants'
import styles from '../../styles'
import type { Lorebook, Character, User, UserPersona } from '../../types'

interface LorebookDetailProps {
  lb: Lorebook
  isEditMode: boolean
  isCreateMode: boolean
  initialType: 'fandom' | 'character' | 'persona'
  characters: Character[]
  users: User[]
  personas: UserPersona[]
  allFandoms: string[]
  
  // State from parent
  editName: string
  setEditName: (v: string) => void
  editDescription: string
  setEditDescription: (v: string) => void
  editType: 'fandom' | 'character' | 'persona'
  setEditType: (v: 'fandom' | 'character' | 'persona') => void
  editLorebookCategory: string
  setEditLorebookCategory: (v: string) => void
  
  selectedFandom: string
  setSelectedFandom: (v: string) => void
  isNewFandom: boolean
  setIsNewFandom: (v: boolean) => void
  selectedCharId: string
  setSelectedCharId: (v: string) => void
  selectedUserId: string
  setSelectedUserId: (v: string) => void
  selectedPersonaId: string
  setSelectedPersonaId: (v: string) => void
  isMain: boolean
  setIsMain: (v: boolean) => void
  
  // Actions
  onView: () => void
  onEdit: () => void
  onSave: () => void
  
  // Delete
  showDeleteModal: boolean
  setShowDeleteModal: (v: boolean) => void
  onDelete: () => void
}

export function LorebookDetail({
  lb, isEditMode, isCreateMode, initialType, characters, users, personas, allFandoms,
  editName, setEditName, editDescription, setEditDescription,
  editType, setEditType, editLorebookCategory, setEditLorebookCategory,
  selectedFandom, setSelectedFandom, isNewFandom, setIsNewFandom,
  selectedCharId, setSelectedCharId, selectedUserId, setSelectedUserId,
  selectedPersonaId, setSelectedPersonaId, isMain, setIsMain,
  onView, onEdit, onSave,
  showDeleteModal, setShowDeleteModal, onDelete
}: LorebookDetailProps) {
  
  const currentCharacter = useMemo(() => 
    characters.find(c => String(c.id) === String(selectedCharId || lb.character_id)),
    [characters, selectedCharId, lb.character_id]
  )
  
  const isOriginalChar = currentCharacter?.type === 'original'
  
  const userPersonas = useMemo(() => 
    personas.filter(p => p.owner_id === selectedUserId),
    [personas, selectedUserId]
  )

  const canToggleMain = useMemo(() => {
    if (!isOriginalChar) return true
    if (!isMain) return true // Can always turn ON
    
    // Check if the current lorebook is already main in the database
    const isStoredAsMain = lb.tags?.includes('main')
    const mainLorebooksForChar = lb.character_id ? 
      lb.tags?.includes('main') ? 1 : 0 // Simplified since we don't have full lorebooks list here
      : 0
    
    if (isStoredAsMain) {
      // In real scenario we need all lorebooks to know if there's another main one.
      // Here we simplify: if it's main for original char, lock it (require another to become main first).
      return false 
    }
    return true
  }, [isOriginalChar, isMain, lb.tags, lb.character_id])

  return (
    <div className={styles.detailGroup}>
      <div className={styles.detailTitle}>Основная информация</div>
      <Card className={styles.detailsCard} style={{ padding: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          
          {/* Name */}
          <div className={styles.detailGroup}>
            <div className={styles.detailTitle} style={{ fontSize: '0.6rem', letterSpacing: '0.1em' }}>Название</div>
            {isEditMode ? (
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            ) : (
              <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--white)' }}>{lb.name}</div>
            )}
          </div>

          {/* Type / Binding */}
          <div className={styles.detailGroup}>
            <div className={styles.detailTitle} style={{ fontSize: '0.6rem', letterSpacing: '0.1em' }}>Тип / Привязка</div>
            {isEditMode ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className={styles.roleBtnGroup} style={{ margin: 0 }}>
                  <button 
                    className={`${styles.roleBtn} ${editType === 'fandom' ? styles.roleBtnActive : ''}`}
                    onClick={() => setEditType('fandom')}
                  >Фандом</button>
                  <button 
                    className={`${styles.roleBtn} ${editType === 'character' ? styles.roleBtnActive : ''}`}
                    onClick={() => setEditType('character')}
                  >Персонаж</button>
                  <button 
                    className={`${styles.roleBtn} ${editType === 'persona' ? styles.roleBtnActive : ''}`}
                    onClick={() => setEditType('persona')}
                  >Персона</button>
                </div>

                {/* Binding Inputs */}
                {editType === 'fandom' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <SearchableSelect 
                      options={allFandoms.map(f => ({ id: f, name: f }))}
                      value={isNewFandom ? 'new' : selectedFandom}
                      customValueLabel={isNewFandom ? '+ Создать свой' : undefined}
                      onChange={(val) => {
                        if (val === 'new') { setIsNewFandom(true); setSelectedFandom('') } 
                        else { setIsNewFandom(false); setSelectedFandom(val) }
                      }}
                      placeholder="Выберите фандом..."
                      onCreateNew={() => { setIsNewFandom(true); setSelectedFandom('') }}
                      onCreateLabel="+ Создать свой фандом"
                    />
                    {isNewFandom && (
                      <Input 
                        placeholder="Название нового фандома" 
                        value={selectedFandom} 
                        onChange={(e) => setSelectedFandom(e.target.value)} 
                        autoFocus
                      />
                    )}
                  </div>
                )}

                {editType === 'character' && (
                  <SearchableSelect 
                    options={characters.map(c => ({ id: c.id, name: c.name, subtext: c.fandom || 'Независимый' }))}
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
                        onChange={(val) => { setSelectedUserId(val); setSelectedPersonaId('') }}
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
                  {initialType === 'fandom' ? lb.fandom 
                    : initialType === 'persona' ? (lb.user_persona_name || personas.find(p => p.id === lb.user_persona_id)?.name || lb.user_persona_id)
                    : (lb.character_name || characters.find(c => c.id === lb.character_id)?.name || lb.character_id)}
                </span>
                {lb.tags?.includes('main') && initialType === 'character' && (characters.find(c => String(c.id) === String(lb.character_id))?.type === 'original') && (
                  <Badge variant="orange">ОСНОВНОЙ</Badge>
                )}
              </div>
            )}
          </div>

          {/* Description */}
          <div className={styles.detailGroup}>
            <div className={styles.detailTitle} style={{ fontSize: '0.6rem', letterSpacing: '0.1em' }}>Описание</div>
            {isEditMode ? (
              <Input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
            ) : (
              <div style={{ opacity: 0.7, lineHeight: 1.6 }}>{lb.description || 'Описание отсутствует'}</div>
            )}
          </div>

          {/* Category */}
          <div className={styles.detailGroup}>
            <div className={styles.detailTitle} style={{ fontSize: '0.6rem', letterSpacing: '0.1em' }}>Категория лорбука</div>
            {isEditMode ? (
              <SearchableSelect
                options={LB_CATEGORY_OPTIONS}
                value={editLorebookCategory}
                onChange={setEditLorebookCategory}
                placeholder="Выберите категорию..."
              />
            ) : (
              <Badge variant="purple" style={{ alignSelf: 'flex-start' }}>
                {LB_CATEGORY_MAP[lb.category || 'general'] || lb.category || 'Общая'}
              </Badge>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actionRow} style={{ border: 'none', padding: 0, marginTop: 0, justifyContent: 'space-between', alignItems: 'flex-end' }}>
          {isEditMode ? (
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button variant="ghost" onClick={onView}>Отмена</Button>
              <Button variant="orange" onClick={onSave}>Сохранить изменения</Button>
            </div>
          ) : (
            <>
              <Button variant="orange" onClick={onEdit}>Редактировать</Button>
              {initialType !== 'persona' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                  {lb.tags?.includes('main') && isOriginalChar && (
                    <div className={styles.infoNote} style={{ marginBottom: '12px', width: '100%' }}>
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

      <ConfirmModal 
        isOpen={showDeleteModal}
        title="Удалить лорбук?"
        description={`Это действие необратимо. Лорбук "${lb.name}" будет полностью удален.`}
        confirmLabel="Да, удалить"
        onConfirm={onDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  )
}
