import { useState, useCallback } from 'react'
import { logger } from '@/core/utils/logger'
import { chatsApi } from '@/core/api/chats'
import { messagesApi } from '@/core/api/messages'
import type { Character } from '@/core/types/character'
import type { Message, UserPersona, Checkpoint } from '@/core/types/chat'

interface UseChatMessagesOptions {
  chatId?: string
  persona: UserPersona | null
  character: Character | null
  onLastSavedUpdate?: () => void
  onCheckpointsUpdate?: (checkpoints: Checkpoint[]) => void
}

/**
 * Хук управления сообщениями чата.
 * Реализует отправку сообщений с потоковым SSE-стримингом,
 * регенерацию ответов, переключение альтернативных вариантов (свайпы),
 * создание новых веток (форки) и редактирование реплик.
 */
export function useChatMessages({
  chatId,
  persona,
  character,
  onLastSavedUpdate,
  onCheckpointsUpdate,
}: UseChatMessagesOptions) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [activeLeafId, setActiveLeafId] = useState<string | null>(null)
  const [messageTree, setMessageTree] = useState<Message[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [chatError, setChatError] = useState<string | null>(null)

  /**
   * Преобразует сырые узлы сообщений активной ветки с бэкенда в UI-модели Message,
   * подставляя актуальные имена персоны пользователя и ИИ-персонажа.
   * 
   * @param branch - Массив узлов активной ветки диалога
   * @param userPersona - Активная персона пользователя
   * @param aiCharacter - Персонаж, с которым ведется диалог
   * @returns Массив сообщений для отображения в ленте чата
   */
  const mapHistoryMessages = useCallback((
    branch: any[],
    userPersona: UserPersona | null,
    aiCharacter: Character | null
  ): Message[] => {
    return branch.map(m => ({
      id: m.id,
      author: m.role === 'user' ? (userPersona?.name || 'Вы') : (aiCharacter?.name || 'скальд'),
      content: m.content,
      role: m.role as 'user' | 'assistant',
      hidden_thought: m.hidden_thought,
      chat_id: m.chat_id,
      parent_id: m.parent_id,
      siblings_count: m.siblings_count,
      current_sibling_index: m.current_sibling_index,
      is_edited: m.is_edited,
      created_at: m.created_at,
    }))
  }, [])

  /**
   * Создает ответвление (форк) чата начиная с выбранного сообщения.
   * Позволяет начать новую сюжетную линию без потери текущего прогресса.
   * 
   * @param messageId - Идентификатор сообщения-чекпоинта
   */
  const handleForkChat = useCallback(async (messageId: string) => {
    try {
      const newChat = await messagesApi.forkChat(messageId)
      window.location.href = `/chat/${newChat.id}`
    } catch (err) {
      logger.error('Failed to fork chat:', err)
      setChatError('Не удалось создать ветку чата. Пожалуйста, попробуйте позже.')
    }
  }, [])

  /**
   * Переключает варианты генерации ответа ("свайпы") среди соседних узлов с общим parent_id.
   * 
   * Архитектура дерева сообщений:
   * 1. Каждое сообщение хранит ссылку на своего предка (parent_id).
   * 2. При повторной генерации создается sibling-узел с тем же parent_id.
   * 3. При переключении на соседний узел необходимо найти его самый глубокий лист (leaf),
   *    чтобы полностью восстановить нижележащую цепочку реплик данной сюжетной ветки.
   * 
   * @param msgId - Идентификатор текущего сообщения
   * @param direction - Направление переключения ('prev' - предыдущий вариант, 'next' - следующий)
   */
  const handleSiblingSwitch = async (msgId: string, direction: 'prev' | 'next') => {
    if (isGenerating || !chatId) return
    const targetMsg = messageTree.find(m => m.id === msgId)
    if (!targetMsg) return

    // Поиск всех вариантов ответа от того же родителя, отсортированных по времени создания
    const siblings = messageTree
      .filter(m => m.parent_id === targetMsg.parent_id)
      .sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime())

    const currentIndex = siblings.findIndex(m => m.id === msgId)
    const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1
    if (newIndex < 0 || newIndex >= siblings.length) return

    const nextMsg = siblings[newIndex]

    /**
     * Рекурсивно спускается по дереву от указанного сообщения к самому последнему дочернему узлу (листу).
     */
    const findLeaf = (mId: string): string => {
      const children = messageTree.filter(m => m.parent_id === mId)
      return children.length === 0 ? mId : findLeaf(children[children.length - 1].id)
    }

    const newLeafId = findLeaf(nextMsg.id)

    try {
      // Сохраняем выбранный активный лист на бэкенде и перезагружаем активную ветку
      await chatsApi.updateChat(chatId, { active_leaf_id: newLeafId })
      const historyData = await chatsApi.getChatHistory(chatId)
      setActiveLeafId(historyData.active_leaf_id)
      setMessageTree(historyData.tree)
      setMessages(mapHistoryMessages(historyData.active_branch, persona, character))
    } catch (err) {
      logger.error('Sibling switch failed:', err)
    }
  }

  /**
   * Отправляет новое сообщение пользователя и инициирует потоковую генерацию ответа ассистента.
   * 
   * Логика работы:
   * 1. Оптимистично добавляет сообщение пользователя и пустую плашку ответа ассистента в UI.
   * 2. Вызывает SSE-стриминг (sendMessageStream), наполняя плашку ассистента поступающими чанками.
   * 3. После завершения генерации синхронизирует состояние с бэкендом: обновляет active_leaf_id,
   *    получает скрытые мысли модели (hidden_thought) и обновляет контрольные точки (чекпоинты).
   * 4. В случае сбоя удаляет оптимистичное сообщение и показывает баннер ошибки.
   */
  const handleSend = async () => {
    if (!inputValue.trim() || isGenerating || !chatId) return
    const userMsgContent = inputValue
    setInputValue('')
    setIsGenerating(true)
    setChatError(null)

    const tempUserMsg: Message = {
      id: Date.now().toString(),
      author: persona?.name || 'Вы',
      content: userMsgContent,
      role: 'user',
    }
    setMessages(prev => [...prev, tempUserMsg])

    try {
      const aiMsgId = (Date.now() + 1).toString()
      let aiContent = ''
      setMessages(prev => [...prev, {
        id: aiMsgId,
        author: character?.name || 'скальд',
        content: '',
        role: 'assistant',
      }])

      await messagesApi.sendMessageStream(chatId, {
        content: userMsgContent,
        parent_id: activeLeafId || undefined,
      }, (chunk) => {
        aiContent += chunk
        setMessages(prevMsgs => prevMsgs.map(m =>
          m.id === aiMsgId ? { ...m, content: aiContent } : m
        ))
      })

      const updatedHistory = await chatsApi.getChatHistory(chatId)
      setActiveLeafId(updatedHistory.active_leaf_id)
      setMessageTree(updatedHistory.tree)
      const lastAiMsg = updatedHistory.active_branch[updatedHistory.active_branch.length - 1]

      setMessages(prev => prev.map(m =>
        m.id === aiMsgId ? {
          ...m,
          id: lastAiMsg.id,
          hidden_thought: lastAiMsg.hidden_thought,
          siblings_count: lastAiMsg.siblings_count,
          current_sibling_index: lastAiMsg.current_sibling_index,
        } : m
      ))
      if (onCheckpointsUpdate) {
        onCheckpointsUpdate(updatedHistory.checkpoints || [])
      }
      if (onLastSavedUpdate) {
        onLastSavedUpdate()
      }
    } catch (err: any) {
      logger.error('Send failed:', err)
      setMessages(prev => prev.filter(m => m.id !== tempUserMsg.id))
      setChatError('Произошла ошибка при генерации ответа. Пожалуйста, попробуйте позже.')
    } finally {
      setIsGenerating(false)
    }
  }

  /**
   * Инициирует повторную генерацию ответа ассистента для выбранного сообщения.
   * Создает новую ветку-сиблинг от родительского сообщения пользователя.
   * 
   * @param msgId - Идентификатор сообщения ассистента, которое необходимо перегенерировать
   */
  const handleRegenerate = async (msgId: string) => {
    if (isGenerating || !chatId) return
    setIsGenerating(true)
    setChatError(null)

    const targetMsg = messages.find(m => m.id === msgId)
    if (!targetMsg || !targetMsg.parent_id) {
      setIsGenerating(false)
      return
    }

    try {
      const aiMsgId = (Date.now() + 1).toString()
      let aiContent = ''
      setMessages(prev => [...prev, {
        id: aiMsgId,
        author: character?.name || 'скальд',
        content: '',
        role: 'assistant',
        parent_id: targetMsg.parent_id,
      }])

      await messagesApi.regenerateMessageStream(targetMsg.parent_id, (chunk) => {
        aiContent += chunk
        setMessages(prevMsgs => prevMsgs.map(m =>
          m.id === aiMsgId ? { ...m, content: aiContent } : m
        ))
      })

      const updatedHistory = await chatsApi.getChatHistory(chatId)
      setActiveLeafId(updatedHistory.active_leaf_id)
      setMessageTree(updatedHistory.tree)
      setMessages(mapHistoryMessages(updatedHistory.active_branch, persona, character))
      if (onCheckpointsUpdate) {
        onCheckpointsUpdate(updatedHistory.checkpoints || [])
      }
      if (onLastSavedUpdate) {
        onLastSavedUpdate()
      }
    } catch (err: any) {
      logger.error('Regeneration failed:', err)
      setChatError('Произошла ошибка при регенерации. Пожалуйста, попробуйте позже.')
    } finally {
      setIsGenerating(false)
    }
  }

  /**
   * Редактирует текст существующего сообщения.
   * На бэкенде создается новая ветка диалога с обновленным текстом.
   * 
   * @param msgId - Идентификатор редактируемого сообщения
   * @param newContent - Новый отредактированный текст
   */
  const handleEditMessage = async (msgId: string, newContent: string) => {
    if (isGenerating || !chatId) return
    try {
      await messagesApi.editMessage(msgId, { content: newContent })
      const updatedHistory = await chatsApi.getChatHistory(chatId)
      setActiveLeafId(updatedHistory.active_leaf_id)
      setMessageTree(updatedHistory.tree)
      setMessages(mapHistoryMessages(updatedHistory.active_branch, persona, character))
      if (onLastSavedUpdate) {
        onLastSavedUpdate()
      }
    } catch (err) {
      logger.error('Message edit failed:', err)
    }
  }

  return {
    messages,
    setMessages,
    inputValue,
    setInputValue,
    activeLeafId,
    setActiveLeafId,
    messageTree,
    setMessageTree,
    isGenerating,
    setIsGenerating,
    chatError,
    setChatError,

    mapHistoryMessages,
    handleSend,
    handleRegenerate,
    handleEditMessage,
    handleSiblingSwitch,
    handleForkChat,
  }
}
