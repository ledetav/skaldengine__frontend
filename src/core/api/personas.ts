import { ApiClient } from './client'

export interface UserPersona {
  id: string
  name: string
  description: string
  personality?: string
  background?: string
  owner_id: string
  created_at: string
  lorebook_count: number
  chat_count: number
}

export interface UserPersonaCreate {
  name: string
  description: string
  appearance?: string
  personality?: string
  background?: string
}

export const personasApi = {
  getPersonas: async (skip: number = 0, limit: number = 10, userId?: string): Promise<UserPersona[]> => {
    const userQuery = userId ? `&user_id=${userId}` : ''
    const res = await ApiClient.get<any>('core', `/personas/?skip=${skip}&limit=${limit}${userQuery}`)
    return res.items || res || []
  },
  
  createPersona: async (persona: UserPersonaCreate): Promise<UserPersona> => {
    return ApiClient.post('core', '/personas/', persona)
  },
  
  getPersona: async (id: string): Promise<UserPersona> => {
    return ApiClient.get('core', `/personas/${id}`)
  },
  
  updatePersona: async (id: string, persona: Partial<UserPersonaCreate>): Promise<UserPersona> => {
    return ApiClient.patch('core', `/personas/${id}`, persona)
  },
  
  deletePersona: async (id: string): Promise<void> => {
    return ApiClient.delete('core', `/personas/${id}`)
  },
  
  deleteAdminPersona: async (id: string): Promise<void> => {
    return ApiClient.delete('core', `/personas/admin/${id}`)
  },
  
  getStats: async (userId?: string): Promise<any> => {
    const userQuery = userId ? `?user_id=${userId}` : ''
    return ApiClient.get('core', `/personas/stats${userQuery}`)
  }
}
