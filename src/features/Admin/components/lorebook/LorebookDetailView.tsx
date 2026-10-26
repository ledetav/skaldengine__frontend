import { useState, useEffect } from 'react'
import { useToast } from '@/components/ui'
import { ConfirmModal } from '@/components/common'
import styles from '../../styles'
import type { Lorebook, Character, User, UserPersona } from '../../types'
import { LorebookDetail } from './LorebookDetail'
import { LorebookEntryForm } from './LorebookEntryForm'
import { LorebookEntryList } from './LorebookEntryList'
import { useLorebookEntries } from './useLorebookEntries'

export interface LorebookDetailViewProps {
  id?: string
  lb?: Lorebook | null
  isCreateMode: boolean
  isEditMode: boolean
  initialType: 'fandom' | 'character' | 'persona'
  characters?: Character[]
  users?: User[]
  personas?: UserPersona[]
  allFandoms: string[]
  onBack: () => void
  onView: (id: string) => void
  onEdit: (id: string) => void
  onSaveSuccess: (savedId: string, isCreate: boolean) => void
  onDeleteSuccess: () => void
  onLorebookUpdate?: (updated: Partial<Lorebook>) => void
}

/**
 * Экран детального управления лорбуком и его записями в админ-панели.
 */
export function LorebookDetailView({
  id,
  lb,
  isCreateMode,
  isEditMode,
  initialType,
  characters = [],
  users = [],
  personas = [],
  allFandoms,
  onBack,
  onView,
  onEdit,
  onSaveSuccess,
  onDeleteSuccess,
  onLorebookUpdate,
}: LorebookDetailViewProps) {
  const { success } = useToast()

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
  const [showDeleteModal, setShowDeleteModal] = useState(false)

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

  const {
    entries,
    entriesTotal,
    entriesPage,
    setEntriesPage,
    entrySort,
    setEntrySort,
    entryCategoryFilter,
    setEntryCategoryFilter,
    entrySearch,
    setEntrySearch,
    isEntriesLoading,
    fetchEntries,

    isAddingEntry,
    setIsAddingEntry,

    editingEntryId,
    editEntryKeywords,
    setEditEntryKeywords,
    editEntryContent,
    setEditEntryContent,
    editEntryCategory,
    setEditEntryCategory,
    editEntryAlwaysInc,
    setEditEntryAlwaysInc,
    editEntryPriority,
    setEditEntryPriority,

    handleEditStart,
    handleEditCancel,
    handleEntrySave,
    handleEntryDelete,
    confirmEntryDelete,

    showEntryDeleteModal,
    setShowEntryDeleteModal,
  } = useLorebookEntries({
    lb,
    isDetailMode: true,
    onLorebookUpdate,
  })

  /**
   * Сохраняет параметры лорбука (создание через createAdminLorebook или обновление через updateAdminLorebook).
   */
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
        const created = await lorebooksApi.createAdminLorebook(payload as any)
        success('Лорбук успешно создан')
        onSaveSuccess(created?.id || 'create', true)
      } else {
        await lorebooksApi.updateAdminLorebook(id!, payload as any)
        success('Лорбук успешно обновлен')
        onSaveSuccess(id!, false)
      }
    } catch (e) {
      console.error('Failed to save lorebook', e)
      success('Ошибка при сохранении лорбука')
    }
  }

  /**
   * Удаляет лорбук через административный API и уведомляет родительский компонент.
   */
  const handleDelete = async () => {
    const targetId = lb?.id || id
    if (!targetId) return

    try {
      const { lorebooksApi } = await import('@/core/api/lorebooks')
      await lorebooksApi.deleteAdminLorebook(targetId)
      success('Лорбук успешно удален')
      setShowDeleteModal(false)
      onDeleteSuccess()
    } catch (e) {
      console.error('Failed to delete lorebook', e)
      success('Ошибка при удалении лорбука')
    }
  }

  if (!lb) {
    return <div style={{ color: 'var(--accent-red)', padding: '40px' }}>Лорбук не найден</div>
  }

  return (
    <div className={styles.sectionContainer}>
      <header className={styles.backHeader} style={{ marginBottom: '24px' }}>
        <button className={styles.backBtn} onClick={onBack}>
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

          onView={() => onView(lb.id)}
          onEdit={() => onEdit(lb.id)}
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

                onEditStart={handleEditStart}
                onEditSave={handleEntrySave}
                onEditCancel={handleEditCancel}
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
