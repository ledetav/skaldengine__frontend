import type { Character } from '@/core/types/character'
import { ApiClient } from './client'

export const charactersApi = {
  getCharacters: async (skip: number = 0, limit: number = 20): Promise<Character[]> => {
    return ApiClient.get('core', `/characters/?skip=${skip}&limit=${limit}`)
  },
  
  getCharacter: async (id: string): Promise<Character> => {
    return ApiClient.get('core', `/characters/${id}`)
  }
}
