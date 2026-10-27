/**
 * @fileoverview Сервисный модуль API игровых сценариев.
 * Предоставляет методы для получения списка сюжетных сценариев,
 * их фильтрации по персонажу и создания новых сценариев.
 */

import type { Scenario } from '@/core/types/chat'
import { ApiClient } from './client'

/**
 * Сервис API для работы со сценариями персонажей.
 */
export const scenariosApi = {
  /**
   * Получение списка сценариев (опционально с фильтрацией по персонажу).
   */
  getScenarios: async (characterId?: string, skip: number = 0, limit: number = 100): Promise<Scenario[]> => {
    let endpoint = `/scenarios/?skip=${skip}&limit=${limit}`
    if (characterId) endpoint += `&character_id=${characterId}`
    const res = await ApiClient.get<any>('core', endpoint)
    return res.items || res || []
  },
  
  /**
   * Получение сценария по его идентификатору.
   */
  getScenario: async (id: string): Promise<Scenario> => {
    return ApiClient.get('core', `/scenarios/${id}`)
  },

  /**
   * Создание нового сценария.
   */
  createScenario: async (data: Partial<Scenario>): Promise<Scenario> => {
    return ApiClient.post('core', '/scenarios/', data)
  },

  /**
   * Обновление данных существующего сценария.
   */
  updateScenario: async (id: string, data: Partial<Scenario>): Promise<Scenario> => {
    return ApiClient.patch('core', `/scenarios/${id}`, data)
  },

  /**
   * Удаление сценария по идентификатору.
   */
  deleteScenario: async (id: string): Promise<void> => {
    return ApiClient.delete('core', `/scenarios/${id}`)
  }
}
