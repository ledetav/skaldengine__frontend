import { type Message, type MessageCreate, type MessageEdit, type Chat } from '@/core/types/chat'
import { ApiClient } from './client'

const BASE_URL = import.meta.env.VITE_CORE_API_URL || 'http://localhost:8002/api/v1'

export const messagesApi = {
  // Stream message from chat endpoint
  sendMessageStream: async (chatId: string, message: MessageCreate, onChunk: (chunk: string) => void): Promise<void> => {
    const token = localStorage.getItem('token')
    const response = await fetch(`${BASE_URL}/chats/${chatId}/messages/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(message)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Failed to send message')
    }

    const reader = response.body?.getReader()
    if (!reader) return

    const decoder = new TextDecoder()
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      
      const chunk = decoder.decode(value)
      const lines = chunk.split('\n')
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') break
          try {
            const parsed = JSON.parse(data)
            if (parsed.content) {
              onChunk(parsed.content)
            }
          } catch {
            // Might be a partial JSON or other data
          }
        }
      }
    }
  },

  regenerateMessageStream: async (parentId: string, onChunk: (chunk: string) => void): Promise<void> => {
    const token = localStorage.getItem('token')
    const response = await fetch(`${BASE_URL}/messages/${parentId}/regenerate/stream`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Failed to regenerate message')
    }

    const reader = response.body?.getReader()
    if (!reader) return

    const decoder = new TextDecoder()
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      
      const chunk = decoder.decode(value)
      const lines = chunk.split('\n')
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') break
          try {
            const parsed = JSON.parse(data)
            if (parsed.content) {
              onChunk(parsed.content)
            }
          } catch (e) {
          }
        }
      }
    }
  },

  editMessage: async (messageId: string, data: MessageEdit): Promise<Message> => {
    return ApiClient.put('core', `/messages/${messageId}`, data)
  },

  forkChat: async (messageId: string): Promise<Chat> => {
    return ApiClient.post('core', `/messages/${messageId}/fork`, {})
  }
}
