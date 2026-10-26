import type { Character } from '@/core/types/character'
import { ApiClient } from './client'

/**
 * Сервис API для получения и управления персонажами.
 */
export const charactersApi = {
  /**
   * Получение списка публичных персонажей с поддержкой пагинации.
   */
  getCharacters: async (skip: number = 0, limit: number = 20): Promise<Character[]> => {
    const res = await ApiClient.get<any>('core', `/characters/?skip=${skip}&limit=${limit}`)
    return res.items || res || []
  },
  
  /**
   * Получение подробной информации о персонаже по его идентификатору.
   */
  getCharacter: async (id: string): Promise<Character> => {
    return ApiClient.get('core', `/characters/${id}`)
  },

  /**
   * Создание нового персонажа (панель администратора).
   */
  createAdminCharacter: async (data: Partial<Character>): Promise<Character> => {
    return ApiClient.post('core', '/admin/characters/', data)
  },

  /**
   * Обновление данных персонажа (панель администратора).
   */
  updateAdminCharacter: async (id: string, data: Partial<Character>): Promise<Character> => {
    return ApiClient.patch('core', `/admin/characters/${id}`, data)
  },
  
  /**
   * Удаление персонажа (панель администратора).
   */
  deleteAdminCharacter: async (id: string): Promise<void> => {
    return ApiClient.delete('core', `/admin/characters/${id}`)
  }
}
