import type { Scenario } from '@/core/types/chat'
import { ApiClient } from './client'

export const scenariosApi = {
  getScenarios: async (characterId?: string): Promise<Scenario[]> => {
    const endpoint = characterId 
      ? `/scenarios/?character_id=${characterId}`
      : '/scenarios/'
    return ApiClient.get('core', endpoint)
  },
  
  getScenario: async (id: string): Promise<Scenario> => {
    return ApiClient.get('core', `/scenarios/${id}`)
  },

  createScenario: async (data: Partial<Scenario>): Promise<Scenario> => {
    return ApiClient.post('core', '/scenarios/', data)
  },

  updateScenario: async (id: string, data: Partial<Scenario>): Promise<Scenario> => {
    return ApiClient.put('core', `/scenarios/${id}`, data)
  },

  deleteScenario: async (id: string): Promise<void> => {
    return ApiClient.delete('core', `/scenarios/${id}`)
  }
}
