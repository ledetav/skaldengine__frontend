import { ApiClient } from './client'

/**
 * Модель персоны пользователя.
 */
export interface UserPersona {
  id: string
  name: string
  description: string
  personality?: string
  background?: string
  owner_id: string
  created_at: string
  lorebook_count: number
  chat_count: number
}

/**
 * Схема создания новой персоны пользователя.
 */
export interface UserPersonaCreate {
  name: string
  description: string
  appearance?: string
  personality?: string
  background?: string
}

/**
 * Сервис API для работы с персонами пользователя.
 */
export const personasApi = {
  /**
   * Получение списка персон пользователя.
   */
  getPersonas: async (skip: number = 0, limit: number = 10, userId?: string): Promise<UserPersona[]> => {
    const userQuery = userId ? `&user_id=${userId}` : ''
    const res = await ApiClient.get<any>('core', `/personas/?skip=${skip}&limit=${limit}${userQuery}`)
    return res.items || res || []
  },
  
  /**
   * Создание новой персоны.
   */
  createPersona: async (persona: UserPersonaCreate): Promise<UserPersona> => {
    return ApiClient.post('core', '/personas/', persona)
  },
  
  /**
   * Получение персоны по её идентификатору.
   */
  getPersona: async (id: string): Promise<UserPersona> => {
    return ApiClient.get('core', `/personas/${id}`)
  },
  
  /**
   * Обновление данных персоны.
   */
  updatePersona: async (id: string, persona: Partial<UserPersonaCreate>): Promise<UserPersona> => {
    return ApiClient.patch('core', `/personas/${id}`, persona)
  },
  
  /**
   * Удаление персоны текущим пользователем.
   */
  deletePersona: async (id: string): Promise<void> => {
    return ApiClient.delete('core', `/personas/${id}`)
  },
  
  /**
   * Удаление персоны администратором.
   */
  deleteAdminPersona: async (id: string): Promise<void> => {
    return ApiClient.delete('core', `/personas/admin/${id}`)
  },
  
  /**
   * Получение агрегированной статистики по персонам и активности пользователя.
   */
  getStats: async (userId?: string): Promise<any> => {
    const userQuery = userId ? `?user_id=${userId}` : ''
    return ApiClient.get('core', `/personas/stats${userQuery}`)
  }
}
