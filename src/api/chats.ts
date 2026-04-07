export interface Chat {
  id: string
  user_id: string
  character_id: string
  user_persona_id: string
  scenario_id?: string
  mode: 'sandbox' | 'scenario'
  is_acquainted: boolean
  relationship_dynamic?: string
  language: string
  narrative_voice: 'first' | 'second' | 'third'
  persona_lorebook_id?: string
  active_leaf_id?: string
  created_at: string
  updated_at?: string
}

export interface ChatCreate {
  character_id: string
  user_persona_id: string
  scenario_id?: string
  is_acquainted: boolean
  relationship_dynamic?: string
  language: string
  narrative_voice: 'first' | 'second' | 'third'
  persona_lorebook_id?: string
  checkpoints_count: number
}

const BASE_URL = import.meta.env.VITE_CORE_API_URL || 'http://localhost:8002/api/v1'

export const chatsApi = {
  createChat: async (chat: ChatCreate): Promise<Chat> => {
    const token = localStorage.getItem('token')
    const response = await fetch(`${BASE_URL}/chats/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(chat)
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Failed to create chat')
    }
    
    return response.json()
  },
  
  getChats: async (skip: number = 0, limit: number = 20): Promise<Chat[]> => {
    const token = localStorage.getItem('token')
    const response = await fetch(`${BASE_URL}/chats/?skip=${skip}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Failed to fetch chats')
    }
    
    return response.json()
  }
}
