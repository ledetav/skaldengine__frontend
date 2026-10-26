import { type Chat, type ChatUpdate, type ChatCreate, type Message } from '@/core/types/chat'
import { ApiClient } from './client'

/**
 * Сервис API для работы с чатами и историей диалогов.
 */
export const chatsApi = {
  /**
   * Создание нового чата с персонажем.
   */
  createChat: async (chat: ChatCreate): Promise<Chat> => {
    return ApiClient.post('core', '/chats/', chat)
  },
  
  /**
   * Получение списка чатов текущего пользователя с пагинацией.
   */
  getChats: async (skip: number = 0, limit: number = 20): Promise<Chat[]> => {
    const res = await ApiClient.get<any>('core', `/chats/?skip=${skip}&limit=${limit}`)
    return res.items || res || []
  },
  
  /**
   * Получение метаданных чата по его идентификатору.
   */
  getChat: async (chatId: string): Promise<Chat> => {
    return ApiClient.get('core', `/chats/${chatId}`)
  },

  /**
   * Обновление настроек или заголовка чата.
   */
  updateChat: async (chatId: string, data: ChatUpdate): Promise<Chat> => {
    return ApiClient.patch('core', `/chats/${chatId}`, data)
  },

  /**
   * Получение полной древовидной истории чата, активной ветки и контрольных точек.
   */
  getChatHistory: async (chatId: string): Promise<{
    active_branch: Message[],
    tree: Message[],
    active_leaf_id: string,
    checkpoints: any[]
  }> => {
    return ApiClient.get('core', `/chats/${chatId}/history`)
  }
}
