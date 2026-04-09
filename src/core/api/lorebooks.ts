import { type Lorebook } from '@/core/types/chat'
import { ApiClient } from './client'

export const lorebooksApi = {
  getLorebooks: async (skip: number = 0, limit: number = 50, userId?: string, personaId?: string, characterId?: string): Promise<Lorebook[]> => {
    let query = `?skip=${skip}&limit=${limit}`
    if (userId) query += `&user_id=${userId}`
    if (personaId) query += `&persona_id=${personaId}`
    if (characterId) query += `&character_id=${characterId}`
    return ApiClient.get('core', `/lorebooks/${query}`)
  }
}
