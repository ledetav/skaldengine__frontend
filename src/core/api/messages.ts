import { type Message, type MessageCreate, type MessageEdit, type Chat } from '@/core/types/chat'
import { ApiClient } from './client'

const BASE_URL = import.meta.env.VITE_CORE_API_URL || 'http://localhost:8002/api/v1'

/**
 * Сервис API для отправки сообщений, потокового SSE-стриминга и управления ветками диалога.
 */
export const messagesApi = {
  /**
   * Отправка сообщения пользователя в чат с приемом потокового ответа ассистента по SSE.
   *
   * @param chatId - Идентификатор чата
   * @param message - Данные создаваемого сообщения
   * @param onChunk - Коллбэк для каждого входящего фрагмента текста
   */
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
      throw new Error(errorData.detail || 'Не удалось отправить сообщение')
    }

    // Чтение потока байт через ReadableStreamDefaultReader
    const reader = response.body?.getReader()
    if (!reader) return

    const decoder = new TextDecoder()
    let buffer = ''
    
    // Цикл вычитывания фрагментов SSE (Server-Sent Events)
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      
      // Накопление байт в буфер для корректной склейки многобайтовых UTF-8 символов
      buffer += decoder.decode(value, { stream: true })
      // SSE события отделяются друг от друга двойным переносом строки (\n\n)
      const parts = buffer.split('\n\n')
      // Последняя часть может быть неполной, сохраняем её в буфер до следующего чанка
      buffer = parts.pop() || ''
      
      for (const part of parts) {
        const lines = part.split('\n')
        for (const line of lines) {
          // Строки данных SSE всегда начинаются с префикса 'data: '
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            // Маркер [DONE] сообщает о штатном окончании генерации языковой моделью
            if (data === '[DONE]') break
            try {
              const parsed = JSON.parse(data)
              if (parsed.content) {
                onChunk(parsed.content)
              }
            } catch (e) {
              console.error('Ошибка парсинга данных SSE:', data, e)
            }
          }
        }
      }
    }
  },

  /**
   * Потоковая повторная генерация ответа ассистента для указанного родительского сообщения.
   *
   * @param parentId - Идентификатор сообщения пользователя (родителя)
   * @param onChunk - Коллбэк для каждого входящего фрагмента текста
   */
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
      throw new Error(errorData.detail || 'Не удалось перегенерировать сообщение')
    }

    // Чтение потока байт через ReadableStreamDefaultReader
    const reader = response.body?.getReader()
    if (!reader) return

    const decoder = new TextDecoder()
    let buffer = ''
    
    // Цикл вычитывания фрагментов SSE для повторной генерации
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      
      // Склейка порций байт и разделение событий по двойному переносу строки
      buffer += decoder.decode(value, { stream: true })
      const parts = buffer.split('\n\n')
      buffer = parts.pop() || ''
      
      for (const part of parts) {
        const lines = part.split('\n')
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
              console.error('Ошибка парсинга данных SSE:', data, e)
            }
          }
        }
      }
    }
  },

  /**
   * Редактирование текста сообщения. На бэкенде создается новая ветка диалога.
   *
   * @param messageId - Идентификатор редактируемого сообщения
   * @param data - Данные редактирования с новым текстом
   */
  editMessage: async (messageId: string, data: MessageEdit): Promise<Message> => {
    // Схема бэкенда ожидает поле new_content, поддерживаем оба формата
    const payload = {
      content: data.content,
      new_content: data.new_content || data.content
    }
    return ApiClient.put('core', `/messages/${messageId}`, payload)
  },

  /**
   * Ответвление (форк) чата от выбранного сообщения в новый независимый чат.
   *
   * @param messageId - Идентификатор сообщения, от которого создается форк
   */
  forkChat: async (messageId: string): Promise<Chat> => {
    return ApiClient.post('core', `/messages/${messageId}/fork`, {})
  }
}
