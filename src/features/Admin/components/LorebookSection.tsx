import { useState, useMemo, useEffect, type ReactNode } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useToast } from '@/components/ui'
import { ApiClient } from '@/core/api/client'
import type { Lorebook, Character, User, UserPersona } from '../types'
import { LorebookListView, LorebookDetailView } from './lorebook'

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

/**
 * Секция управления лорбуками в панели администратора.
 * Переключается между списком баз знаний и детальным экраном редактирования записей.
 */
export function LorebookSection({
  type: initialType,
  lorebooks,
  characters = [],
  users = [],
  personas = [],
  onToggleFilter,
  isFilterActive,
  onSort,
  renderSortIcon,
}: LorebookSectionProps) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { success } = useToast()

  /**
   * Выполняет переход по маршрутам админ-панели с сохранением суффикса /debug.
   */
  const navigateDebug = (route: string) => {
    const isDebug = pathname.includes('/debug')
    const finalRoute = isDebug && !route.endsWith('/debug') ? route.replace(/\/?$/, '/debug') : route
    navigate(finalRoute)
  }

  const isCreateMode = id === 'create'
  const isEditMode = pathname.includes('/edit') || isCreateMode
  const isDetailMode = !!id

  /**
   * Черновик нового лорбука для режима создания.
   */
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

  /**
   * Активный лорбук (из кэша списка, загруженный с сервера или черновик).
   */
  const lb = useMemo(() => {
    if (isCreateMode) return draftLb
    return lorebooks.find(l => l.id === id) || fetchedLb
  }, [lorebooks, id, isCreateMode, draftLb, fetchedLb])

  useEffect(() => {
    /**
     * Подгружает полную информацию о лорбуке, если его нет в предварительно загруженном списке.
     */
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

  /**
   * Список уникальных фандомов для привязки лорбука, исключая оригинальные.
   */
  const allFandoms = useMemo(() => {
    const s = new Set<string>()
    lorebooks.forEach(l => { if (l.fandom) s.add(l.fandom) })
    characters.forEach(c => { if (c.fandom) s.add(c.fandom) })
    return Array.from(s).filter(Boolean).filter(f => !['original', 'оригинальный'].includes(f.toLowerCase())).sort()
  }, [lorebooks, characters])

  /**
   * Переход в режим редактирования лорбука.
   */
  const handleEdit = (lbId: string) => navigateDebug(`/admin/lorebooks/${lbId}/edit`)

  /**
   * Переход в режим просмотра лорбука.
   */
  const handleView = (lbId: string) => navigateDebug(`/admin/lorebooks/${lbId}`)

  /**
   * Возврат к соответствующей вкладке списка лорбуков.
   */
  const handleBack = () => {
    const tab = initialType === 'fandom' ? 'fandom' : initialType === 'persona' ? 'personas' : 'characters'
    navigateDebug(`/admin/lorebooks/${tab}`)
  }

  /**
   * Удаляет лорбук через административный API и возвращает пользователя к списку.
   */
  const handleDelete = async (targetId: string) => {
    try {
      const { lorebooksApi } = await import('@/core/api/lorebooks')
      await lorebooksApi.deleteAdminLorebook(targetId)
      success('Лорбук успешно удален')
      handleBack()
    } catch (e) {
      console.error('Failed to delete lorebook', e)
      success('Ошибка при удалении лорбука')
    }
  }

  if (isDetailMode) {
    return (
      <LorebookDetailView
        id={id}
        lb={lb}
        isCreateMode={isCreateMode}
        isEditMode={isEditMode}
        initialType={initialType}
        characters={characters}
        users={users}
        personas={personas}
        allFandoms={allFandoms}
        onBack={handleBack}
        onView={handleView}
        onEdit={handleEdit}
        onSaveSuccess={(savedId, isCreate) => {
          if (isCreate) handleBack()
          else handleView(savedId)
        }}
        onDeleteSuccess={handleBack}
        onLorebookUpdate={(updated) => setFetchedLb(prev => prev ? { ...prev, ...updated } : updated as Lorebook)}
      />
    )
  }

  return (
    <LorebookListView
      initialType={initialType}
      lorebooks={lorebooks}
      characters={characters}
      personas={personas}
      onToggleFilter={onToggleFilter}
      isFilterActive={isFilterActive}
      onSort={onSort}
      renderSortIcon={renderSortIcon}
      onView={handleView}
      onEdit={handleEdit}
      onCreate={() => navigateDebug('/admin/lorebooks/create')}
      onDelete={handleDelete}
    />
  )
}
