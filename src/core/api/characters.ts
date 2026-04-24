import type { Character } from '@/core/types/character'
import { ApiClient } from './client'

export const charactersApi = {
  getCharacters: async (skip: number = 0, limit: number = 20): Promise<Character[]> => {
    return ApiClient.get('core', `/characters/?skip=${skip}&limit=${limit}`)
  },
  
  getCharacter: async (id: string): Promise<Character> => {
    return ApiClient.get('core', `/characters/${id}`)
  },

  createAdminCharacter: async (data: Partial<Character>): Promise<Character> => {
    return ApiClient.post('core', '/admin/characters/', data)
  },

  updateAdminCharacter: async (id: string, data: Partial<Character>): Promise<Character> => {
    return ApiClient.patch('core', `/admin/characters/${id}`, data)
  }
}
