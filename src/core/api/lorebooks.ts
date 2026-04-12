import { type Lorebook } from '@/core/types/chat'
import { ApiClient } from './client'

export const lorebooksApi = {
  getLorebooks: async (skip: number = 0, limit: number = 50, userId?: string, personaId?: string, characterId?: string): Promise<Lorebook[]> => {
    let query = `?skip=${skip}&limit=${limit}`
    if (userId) query += `&user_id=${userId}`
    if (personaId) query += `&persona_id=${personaId}`
    if (characterId) query += `&character_id=${characterId}`
    return ApiClient.get('core', `/lorebooks/${query}`)
  },
  
  deleteLorebook: async (id: string): Promise<void> => {
    return ApiClient.delete('core', `/lorebooks/${id}`)
  },

  getLorebook: async (id: string): Promise<Lorebook> => {
    return ApiClient.get('core', `/lorebooks/${id}`)
  },

  createLorebook: async (data: Partial<Lorebook>): Promise<Lorebook> => {
    return ApiClient.post('core', '/lorebooks/', data)
  },

  updateLorebook: async (id: string, data: Partial<Lorebook>): Promise<Lorebook> => {
    return ApiClient.patch('core', `/lorebooks/${id}`, data)
  },

  createLorebookEntry: async (lorebookId: string, data: { keywords: string[], content: string, priority: number }): Promise<void> => {
    return ApiClient.post('core', `/lorebooks/${lorebookId}/entries/`, data)
  },

  deleteLorebookEntry: async (lorebookId: string, entryId: string): Promise<void> => {
    return ApiClient.delete('core', `/lorebooks/${lorebookId}/entries/${entryId}`)
  }
}
