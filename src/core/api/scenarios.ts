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
  }
}
