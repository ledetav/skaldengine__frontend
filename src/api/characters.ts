import type { Character } from '../types/character'

const BASE_URL = import.meta.env.VITE_CORE_API_URL || 'http://localhost:8002/api/v1'

export const charactersApi = {
  getCharacters: async (skip: number = 0, limit: number = 20): Promise<Character[]> => {
    const token = localStorage.getItem('token')
    const response = await fetch(`${BASE_URL}/characters/?skip=${skip}&limit=${limit}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Failed to fetch characters')
    }
    
    return response.json()
  },
  
  getCharacter: async (id: string): Promise<Character> => {
    const token = localStorage.getItem('token')
    const response = await fetch(`${BASE_URL}/characters/${id}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Failed to fetch character')
    }
    
    return response.json()
  }
}
