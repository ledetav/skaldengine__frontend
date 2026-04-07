
export interface UserPersona {
  id: string
  name: string
  description: string
  appearance?: string
  personality?: string
  background?: string
  owner_id: string
  created_at: string
}

export interface UserPersonaCreate {
  name: string
  description: string
  appearance?: string
  personality?: string
  background?: string
}

const BASE_URL = import.meta.env.VITE_CORE_API_URL || 'http://localhost:8002/api/v1'

export const personasApi = {
  getPersonas: async (skip: number = 0, limit: number = 10): Promise<UserPersona[]> => {
    const token = localStorage.getItem('token')
    const response = await fetch(`${BASE_URL}/personas/?skip=${skip}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Failed to fetch personas')
    }
    
    return response.json()
  },
  
  createPersona: async (persona: UserPersonaCreate): Promise<UserPersona> => {
    const token = localStorage.getItem('token')
    const response = await fetch(`${BASE_URL}/personas/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(persona)
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Failed to create persona')
    }
    
    return response.json()
  },
  
  getPersona: async (id: string): Promise<UserPersona> => {
    const token = localStorage.getItem('token')
    const response = await fetch(`${BASE_URL}/personas/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Failed to fetch persona')
    }
    
    return response.json()
  },
  
  updatePersona: async (id: string, persona: Partial<UserPersonaCreate>): Promise<UserPersona> => {
    const token = localStorage.getItem('token')
    const response = await fetch(`${BASE_URL}/personas/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(persona)
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Failed to update persona')
    }
    
    return response.json()
  },
  
  deletePersona: async (id: string): Promise<void> => {
    const token = localStorage.getItem('token')
    const response = await fetch(`${BASE_URL}/personas/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Failed to delete persona')
    }
  }
}
