import { type Chat, type ChatUpdate, type ChatCreate, type Message } from '@/core/types/chat'
import { ApiClient } from './client'

export const chatsApi = {
  createChat: async (chat: ChatCreate): Promise<Chat> => {
    return ApiClient.post('core', '/chats/', chat)
  },
  
  getChats: async (skip: number = 0, limit: number = 20): Promise<Chat[]> => {
    return ApiClient.get('core', `/chats/?skip=${skip}&limit=${limit}`)
  },
  
  getChat: async (chatId: string): Promise<Chat> => {
    return ApiClient.get('core', `/chats/${chatId}`)
  },

  updateChat: async (chatId: string, data: ChatUpdate): Promise<Chat> => {
    return ApiClient.patch('core', `/chats/${chatId}`, data)
  },

  getChatHistory: async (chatId: string): Promise<{
    active_branch: Message[],
    tree: Message[],
    active_leaf_id: string,
    checkpoints: any[]
  }> => {
    return ApiClient.get('core', `/chats/${chatId}/history`)
  }
}
