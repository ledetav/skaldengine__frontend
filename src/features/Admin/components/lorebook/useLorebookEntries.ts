/**
 * @fileoverview Пользовательский хук для управления статьями (записями) конкретного лорбука.
 * Обеспечивает постраничную загрузку статей, их сохранение, инлайн-редактирование,
 * удаление и подписку на WebSocket-события обновления.
 */

import { useState, useEffect, useCallback } from 'react'
import { ApiClient } from '@/core/api/client'
import { useToast } from '@/components/ui'
import type { Lorebook, LorebookEntry } from '../../types'

interface UseLorebookEntriesOptions {
  lb?: Lorebook | null
  isDetailMode: boolean
  onLorebookUpdate?: (updated: Partial<Lorebook>) => void
}

/**
 * Хук для управления записями конкретного лорбука в админ-панели.
 * Обеспечивает постраничную загрузку, редактирование, удаление и обработку WebSocket-обновлений.
 */
export function useLorebookEntries({ lb, isDetailMode, onLorebookUpdate }: UseLorebookEntriesOptions) {
  const { success } = useToast()

  const [isAddingEntry, setIsAddingEntry] = useState(false)
  const [entries, setEntries] = useState<LorebookEntry[]>([])
  const [entriesTotal, setEntriesTotal] = useState(0)
  const [entriesPage, setEntriesPage] = useState(1)
  const [entrySort, setEntrySort] = useState<'created_at' | 'priority'>('priority')
  const [entryCategoryFilter, setEntryCategoryFilter] = useState('all')
  const [isEntriesLoading, setIsEntriesLoading] = useState(false)

  const [editingEntryId, setEditingEntryId] = useState<string | null>(null)
  const [editEntryKeywords, setEditEntryKeywords] = useState('')
  const [editEntryContent, setEditEntryContent] = useState('')
  const [editEntryCategory, setEditEntryCategory] = useState('fact')
  const [editEntryAlwaysInc, setEditEntryAlwaysInc] = useState(false)
  const [editEntryPriority, setEditEntryPriority] = useState(3)
  const [entrySearch, setEntrySearch] = useState('')

  const [showEntryDeleteModal, setShowEntryDeleteModal] = useState(false)
  const [entryToDeleteId, setEntryToDeleteId] = useState<string | null>(null)

  /**
   * Загружает пагинированный список записей текущего лорбука с бэкенда с учетом сортировки.
   * 
   * @param page - Номер страницы (1-indexed)
   */
  const fetchEntries = useCallback(async (page: number) => {
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
  }, [lb?.id, entrySort])

  useEffect(() => {
    if (isDetailMode && lb?.id && lb.id !== 'create') {
      fetchEntries(entriesPage)
    }
  }, [lb?.id, isDetailMode, entriesPage, fetchEntries])

  // Реал-тайм синхронизация записей лорбука через WebSocket:
  // При получении события REFRESH_LOREBOOK_ENTRIES или UPDATE_LOREBOOK обновляет список без перезагрузки страницы
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
        if (payload.type === 'UPDATE_LOREBOOK' && payload.data.id === lb.id && onLorebookUpdate) {
          onLorebookUpdate(payload.data)
        }
      } catch {
        // Игнорируем ошибки парсинга некорректных сообщений WebSocket
      }
    }
    return () => { socket.close() }
  }, [lb?.id, entriesPage, fetchEntries, onLorebookUpdate])

  /**
   * Сохраняет отредактированные поля статьи лорбука на сервере и обновляет локальное состояние.
   *
   * @param entryId - Идентификатор обновляемой статьи
   */
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
    } catch (e) {
      console.error(e)
      success('Ошибка обновления записи')
      fetchEntries(entriesPage)
    }
  }

  /**
   * Открывает диалог подтверждения удаления записи лорбука.
   * 
   * @param entryId - Идентификатор удаляемой записи
   */
  const handleEntryDelete = (entryId: string) => {
    setEntryToDeleteId(entryId)
    setShowEntryDeleteModal(true)
  }

  /**
   * Выполняет удаление записи через административный API и повторно запрашивает текущую страницу.
   */
  const confirmEntryDelete = async () => {
    if (!entryToDeleteId || !lb?.id) return
    const idToDelete = entryToDeleteId
    try {
      const { lorebooksApi } = await import('@/core/api/lorebooks')
      setEntries(prev => prev.filter(e => e.id !== idToDelete))
      setEntriesTotal(prev => prev - 1)
      success('Запись удалена')
      setShowEntryDeleteModal(false)
      setEntryToDeleteId(null)

      await lorebooksApi.deleteAdminLorebookEntry(lb.id, idToDelete)
      fetchEntries(entriesPage)
    } catch (e) {
      console.error(e)
      success('Ошибка удаления записи')
      fetchEntries(entriesPage)
    }
  }

  /**
   * Инициализирует поля инлайн-редактирования выбранной записи лорбука.
   * 
   * @param entry - Редактируемая запись лорбука
   */
  const handleEditStart = (entry: LorebookEntry) => {
    setEditingEntryId(entry.id)
    setEditEntryKeywords(entry.keywords.join(', '))
    setEditEntryContent(entry.content)
    setEditEntryCategory(entry.category || 'fact')
    setEditEntryAlwaysInc(!!entry.is_always_included)
    setEditEntryPriority(entry.priority || 3)
  }

  return {
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
    handleEditCancel: () => setEditingEntryId(null),
    handleEntrySave,
    handleEntryDelete,
    confirmEntryDelete,

    showEntryDeleteModal,
    setShowEntryDeleteModal,
  }
}
