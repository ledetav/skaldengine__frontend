import React, { useState, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import styles from '../Admin.module.css'
import type { Character, Lorebook } from '../types'
import { Button, useToast } from '@/components/ui'
import { CharacterSidebar, CharacterDetails, CharacterLorebooks } from './character'
import { ConfirmModal } from '@/components/common'

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
    gender: '',
    age: '',
  } as Character : undefined)

  const character = isCreate ? draftCharacter : characters.find((c: Character) => c.id === characterId)

  const availableFandoms = useMemo(() => {
    const forbidden = ['original', 'оригинальный']
    const fandoms = new Set(
      allLorebooks
        .map((lb: Lorebook) => lb.fandom)
        .filter((f: string | undefined): f is string => !!f && !forbidden.includes(f.toLowerCase()))
    )
    return Array.from(fandoms as Set<string>).sort()
  }, [allLorebooks])

  const isOriginal = useMemo(() => 
    character?.type?.toLowerCase() === 'original' || character?.fandom?.toLowerCase() === 'original' || character?.fandom?.toLowerCase() === 'оригинальный',
  [character?.type, character?.fandom])

  const charLorebooks = useMemo(() => {
    if (!character) return []
    const linkedIds = character.lorebook_ids || []
    return allLorebooks.filter((lb: Lorebook) => 
      linkedIds.includes(lb.id) || 
      lb.character_id === character.id ||
      (character.fandom && lb.fandom === character.fandom && character.fandom !== '' && !isOriginal)
    )
  }, [allLorebooks, character, isOriginal])
  
  const attachableLorebooks = useMemo(() => {
    if (!character) return []
    return allLorebooks.filter((lb: Lorebook) => {
      if (charLorebooks.some((clb: Lorebook) => clb.id === lb.id)) return false;
      if (character.fandom && lb.fandom === character.fandom && character.fandom !== '') {
        if (lb.type === 'character' && lb.character_id && lb.character_id !== character.id) {
          return false;
        }
        return true;
      }
      return false;
    });
  }, [allLorebooks, character, charLorebooks]);

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
        const filteredIds = currentIds.filter((id: string) => {
          const lb = allLorebooks.find((l: Lorebook) => l.id === id);
          return !(lb && lb.type === 'fandom' && lb.fandom === oldFandom);
        });
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
      const lb = allLorebooks.find((l: Lorebook) => l.id === lbId)
      if (isOriginal && lb?.tags?.includes('main')) return;
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
        <CharacterSidebar 
          character={character}
          isEditing={isEditing}
          isCreate={isCreate}
          isOriginal={!!isOriginal}
          availableFandoms={availableFandoms}
          handleChange={handleChange}
          onEditClick={() => navigateDebug(`/admin/characters/${characterId}/edit`)}
        />

        <main className={styles.mainContentWrapper}>
          <div className={styles.detailsCard}>
            <CharacterDetails 
              character={character}
              isEditing={isEditing}
              handleChange={handleChange}
            />

            <CharacterLorebooks 
              character={character}
              charLorebooks={charLorebooks}
              attachableLorebooks={attachableLorebooks}
              isEditing={isEditing}
              isOriginal={!!isOriginal}
              isAddingLorebook={isAddingLorebook}
              setIsAddingLorebook={setIsAddingLorebook}
              toggleLorebook={toggleLorebook}
            />

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
        <ConfirmModal 
          isOpen={showDeleteModal}
          title="Удалить персонажа?"
          description={`Это действие необратимо. Персонаж "${character.name}" будет полностью удален из системы.`}
          confirmLabel="Да, удалить"
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  )
}
