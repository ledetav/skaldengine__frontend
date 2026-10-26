import { useState } from 'react'
import { logger } from '@/core/utils/logger'
import { chatsApi } from '@/core/api/chats'
import type { Chat as ChatType, NarrativeVoiceType } from '@/core/types/chat'

interface UseChatSettingsOptions {
  chatId?: string
  onChatUpdate?: (updates: Partial<ChatType>) => void
  onLastSavedUpdate?: () => void
}

/**
 * Хук для локального и серверного управления настройками сессии чата
 * (лицо повествования, язык генерации, размер шрифта, автоскролл, скрытие мыслей).
 */
export function useChatSettings({ chatId, onChatUpdate, onLastSavedUpdate }: UseChatSettingsOptions) {
  const [perspective, setPerspective] = useState<ChatType['narrative_voice']>(() =>
    (localStorage.getItem('skald_perspective') as ChatType['narrative_voice']) || 'third'
  )
  const [language, setLanguage] = useState<'RU' | 'EN'>(() =>
    (localStorage.getItem('skald_language') as 'RU' | 'EN') || 'RU'
  )
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>(() =>
    (localStorage.getItem('skald_fontSize') as 'small' | 'medium' | 'large') || (window.innerWidth <= 768 ? 'small' : 'medium')
  )
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(() =>
    localStorage.getItem('skald_autoScroll') !== 'false'
  )
  const [showThoughtsGlobal, setShowThoughtsGlobal] = useState(() =>
    localStorage.getItem('skald_showThoughts') !== 'false'
  )

  /**
   * Синхронизирует измененные параметры чата с бэкендом и обновляет метаданные сессии.
   * 
   * @param updates - Частичный объект обновлений чата
   */
  const handleSettingsUpdate = async (updates: Partial<ChatType>) => {
    if (!chatId) return
    try {
      await chatsApi.updateChat(chatId, updates)
      if (onChatUpdate) {
        onChatUpdate(updates)
      }
      if (onLastSavedUpdate) {
        onLastSavedUpdate()
      }
    } catch (err) {
      logger.error('Failed to sync settings:', err)
    }
  }

  /**
   * Сохраняет локальную UI-настройку (размер шрифта, автоскролл) в localStorage и обновляет стейт.
   */
  const handleLocalSettingChange = <T,>(key: string, value: T, setter: (val: T) => void) => {
    setter(value)
    localStorage.setItem(key, String(value))
  }

  /**
   * Переключает лицо повествования нейросети (первое, второе или третье лицо)
   * с сохранением в чате на сервере.
   */
  const handlePerspectiveChange = (val: string) => {
    const voice = val as NarrativeVoiceType
    setPerspective(voice)
    handleSettingsUpdate({ narrative_voice: voice })
  }

  /**
   * Переключает основной язык генерации (RU / EN) с сохранением на сервере.
   */
  const handleLanguageChange = (val: string) => {
    const lang = val as 'RU' | 'EN'
    setLanguage(lang)
    handleSettingsUpdate({ language: lang.toLowerCase() })
  }

  return {
    perspective,
    setPerspective,
    language,
    setLanguage,
    fontSize,
    setFontSize,
    autoScrollEnabled,
    setAutoScrollEnabled,
    showThoughtsGlobal,
    setShowThoughtsGlobal,

    handlePerspectiveChange,
    handleLanguageChange,
    handleFontSizeChange: (val: 'small' | 'medium' | 'large') =>
      handleLocalSettingChange('skald_fontSize', val, setFontSize),
    handleAutoScrollToggle: () =>
      handleLocalSettingChange('skald_autoScroll', !autoScrollEnabled, setAutoScrollEnabled),
    handleShowThoughtsToggle: () =>
      handleLocalSettingChange('skald_showThoughts', !showThoughtsGlobal, setShowThoughtsGlobal),
  }
}
