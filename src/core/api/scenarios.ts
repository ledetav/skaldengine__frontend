import type { Scenario } from '@/core/types/chat'
import { ApiClient } from './client'

export const scenariosApi = {
  getScenarios: async (characterId?: string, skip: number = 0, limit: number = 100): Promise<Scenario[]> => {
    let endpoint = `/scenarios/?skip=${skip}&limit=${limit}`
    if (characterId) endpoint += `&character_id=${characterId}`
    const res = await ApiClient.get<any>('core', endpoint)
    return res.items || res || []
  },
  
  getScenario: async (id: string): Promise<Scenario> => {
    return ApiClient.get('core', `/scenarios/${id}`)
  },

  createScenario: async (data: Partial<Scenario>): Promise<Scenario> => {
    return ApiClient.post('core', '/scenarios/', data)
  },

  updateScenario: async (id: string, data: Partial<Scenario>): Promise<Scenario> => {
    return ApiClient.patch('core', `/scenarios/${id}`, data)
  },

  deleteScenario: async (id: string): Promise<void> => {
    return ApiClient.delete('core', `/scenarios/${id}`)
  }
}
