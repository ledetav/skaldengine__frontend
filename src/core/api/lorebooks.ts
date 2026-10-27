/**
 * @fileoverview Сервисный модуль API лорбуков (баз знаний) и их записей.
 * Предоставляет методы для создания, чтения, редактирования и удаления лорбуков,
 * а также привязки их к персонам, персонажам или пользователям.
 */

import { type Lorebook, type LorebookEntry } from '@/core/types/chat'
import { ApiClient } from './client'

/**
 * Сервис API для управления базами знаний (лорбуками) и их записями.
 */
export const lorebooksApi = {
  /**
   * Получение списка лорбуков с фильтрацией по пользователю, персоне или персонажу.
   */
  getLorebooks: async (skip: number = 0, limit: number = 50, userId?: string, personaId?: string, characterId?: string): Promise<Lorebook[]> => {
    let query = `?skip=${skip}&limit=${limit}`
    if (userId) query += `&user_id=${userId}`
    if (personaId) query += `&persona_id=${personaId}`
    if (characterId) query += `&character_id=${characterId}`
    const res = await ApiClient.get<any>('core', `/lorebooks/${query}`)
    return res.items || res || []
  },
  
  /**
   * Удаление лорбука текущим пользователем.
   */
  deleteLorebook: async (id: string): Promise<void> => {
    return ApiClient.delete('core', `/lorebooks/${id}`)
  },

  /**
   * Удаление лорбука администратором.
   */
  deleteAdminLorebook: async (id: string): Promise<void> => {
    return ApiClient.delete('core', `/admin/lorebooks/${id}`)
  },

  /**
   * Получение лорбука по идентификатору со всеми связанными записями.
   */
  getLorebook: async (id: string): Promise<Lorebook> => {
    return ApiClient.get('core', `/lorebooks/${id}`)
  },

  /**
   * Создание нового лорбука пользователем.
   */
  createLorebook: async (data: Partial<Lorebook>): Promise<Lorebook> => {
    return ApiClient.post('core', '/lorebooks/', data)
  },

  /**
   * Обновление данных лорбука пользователем.
   */
  updateLorebook: async (id: string, data: Partial<Lorebook>): Promise<Lorebook> => {
    return ApiClient.patch('core', `/lorebooks/${id}`, data)
  },

  /**
   * Создание системного лорбука администратором.
   */
  createAdminLorebook: async (data: Partial<Lorebook>): Promise<Lorebook> => {
    return ApiClient.post('core', '/admin/lorebooks/', data)
  },

  /**
   * Обновление лорбука администратором.
   */
  updateAdminLorebook: async (id: string, data: Partial<Lorebook>): Promise<Lorebook> => {
    return ApiClient.patch('core', `/admin/lorebooks/${id}`, data)
  },

  /**
   * Создание новой записи в лорбуке.
   */
  createLorebookEntry: async (lorebookId: string, entry: Partial<LorebookEntry>): Promise<LorebookEntry> => {
    return ApiClient.post('core', `/lorebooks/${lorebookId}/entries`, entry)
  },

  /**
   * Массовое создание записей в лорбуке.
   */
  createLorebookEntriesBulk: async (lorebookId: string, entries: Partial<LorebookEntry>[]): Promise<LorebookEntry[]> => {
    return ApiClient.post('core', `/lorebooks/${lorebookId}/entries/bulk`, { entries })
  },

  /**
   * Обновление существующей записи лорбука.
   */
  updateLorebookEntry: async (lorebookId: string, entryId: string, data: Partial<LorebookEntry>): Promise<LorebookEntry> => {
    return ApiClient.patch('core', `/lorebooks/${lorebookId}/entries/${entryId}`, data)
  },

  /**
   * Удаление записи из лорбука пользователем.
   */
  deleteLorebookEntry: async (lorebookId: string, entryId: string): Promise<void> => {
    return ApiClient.delete('core', `/lorebooks/${lorebookId}/entries/${entryId}`)
  },

  /**
   * Удаление записи из лорбука администратором.
   */
  deleteAdminLorebookEntry: async (lorebookId: string, entryId: string): Promise<void> => {
    return ApiClient.delete('core', `/admin/lorebooks/${lorebookId}/entries/${entryId}`)
  }
}
