import type { Scenario } from '../types/character'

const BASE_URL = import.meta.env.VITE_CORE_API_URL || 'http://localhost:8002/api/v1'

export const scenariosApi = {
  getScenarios: async (characterId?: string): Promise<Scenario[]> => {
    const token = localStorage.getItem('token')
    const url = characterId 
      ? `${BASE_URL}/scenarios/?character_id=${characterId}`
      : `${BASE_URL}/scenarios/`
      
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Failed to fetch scenarios')
    }
    
    return response.json()
  },
  
  getScenario: async (id: string): Promise<Scenario> => {
    const token = localStorage.getItem('token')
    const response = await fetch(`${BASE_URL}/scenarios/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Failed to fetch scenario')
    }
    
    return response.json()
  }
}
