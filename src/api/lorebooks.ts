export interface Lorebook {
  id: string
  name: string
  description?: string
  character_id?: string
  user_persona_id?: string
  fandom?: string
  entries?: any[]
}

const BASE_URL = import.meta.env.VITE_CORE_API_URL || 'http://localhost:8002/api/v1'

export const lorebooksApi = {
  getLorebooks: async (skip: number = 0, limit: number = 50): Promise<Lorebook[]> => {
    const token = localStorage.getItem('token')
    const response = await fetch(`${BASE_URL}/lorebooks/?skip=${skip}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Failed to fetch lorebooks')
    }
    
    return response.json()
  }
}
