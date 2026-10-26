import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import styles from './ChatScreen.module.css'
import { logger } from "@/core/utils/logger"

// API & Types
import { chatsApi } from '@/core/api/chats'
import { scenariosApi } from '@/core/api/scenarios'
import { charactersApi } from '@/core/api/characters'
import { personasApi } from '@/core/api/personas'
import { authApi } from '@/core/api/auth'
import { lorebooksApi } from '@/core/api/lorebooks'
import type { Character } from '@/core/types/character'
import type { UserPersona, Scenario, Chat as ChatType, Lorebook, Checkpoint } from '@/core/types/chat'

// Components
import { ChatHeader } from './components/ChatHeader'
import { ChatInput } from './components/ChatInput'
import { MessageList } from './components/MessageList'
import { MessageItem } from './components/MessageItem'
import { ChatErrorBanner } from './components/ChatErrorBanner'
import { ChatSidebarContainer } from './components/ChatSidebarContainer'

// Custom Hooks
import { useChatSettings } from './hooks/useChatSettings'
import { useChatMessages } from './hooks/useChatMessages'

export default function ChatScreen() {
  const { chatId } = useParams<{ chatId: string }>()

  const [chat, setChat] = useState<ChatType | null>(null)
  const [character, setCharacter] = useState<Character | null>(null)
  const [persona, setPersona] = useState<UserPersona | null>(null)
  const [scenario, setScenario] = useState<Scenario | null>(null)
  const [lorebooks, setLorebooks] = useState<Lorebook[]>([])
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([])

  // UI States
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024)
  const [lastSaved, setLastSaved] = useState<Date>(new Date())

  const scrollRef = useRef<HTMLDivElement>(null)

  // Settings hook
  const {
    perspective,
    setPerspective,
    language,
    setLanguage,
    fontSize,
    autoScrollEnabled,
    showThoughtsGlobal,
    handlePerspectiveChange,
    handleLanguageChange,
    handleFontSizeChange,
    handleAutoScrollToggle,
    handleShowThoughtsToggle,
  } = useChatSettings({
    chatId,
    onChatUpdate: (updates) => setChat(prev => prev ? { ...prev, ...updates } : null),
    onLastSavedUpdate: () => setLastSaved(new Date()),
  })

  // Messages hook
  const {
    messages,
    setMessages,
    inputValue,
    setInputValue,
    setActiveLeafId,
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
  } = useChatMessages({
    chatId,
    persona,
    character,
    onLastSavedUpdate: () => setLastSaved(new Date()),
    onCheckpointsUpdate: setCheckpoints,
  })

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (scrollRef.current && autoScrollEnabled) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior
      })
    }
  }, [autoScrollEnabled])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Initial Data Loading
  useEffect(() => {
    if (!chatId) return

    const loadData = async () => {
      try {
        const chatData = await chatsApi.getChat(chatId)
        setChat(chatData)
        setPerspective(chatData.narrative_voice)
        setLanguage(chatData.language.toUpperCase() as 'RU' | 'EN')

        const [charData, personaData, historyData] = await Promise.all([
          charactersApi.getCharacter(chatData.character_id),
          personasApi.getPersona(chatData.user_persona_id),
          chatsApi.getChatHistory(chatId)
        ])

        if (chatData.scenario_id) {
          scenariosApi.getScenario(chatData.scenario_id).then(setScenario).catch(err => logger.error('Failed to get scenario', err))
        }

        setCharacter(charData)
        setPersona(personaData)
        setActiveLeafId(historyData.active_leaf_id)
        setMessageTree(historyData.tree)
        setCheckpoints(historyData.checkpoints || [])
        setMessages(mapHistoryMessages(historyData.active_branch, personaData, charData))

        // Load Lorebooks
        const lb_ids = charData.lorebook_ids || []
        const lb_promises = lb_ids.map((id: string) => lorebooksApi.getLorebook(id))
        if (chatData.persona_lorebook_id) {
          lb_promises.push(lorebooksApi.getLorebook(chatData.persona_lorebook_id))
        }
        const loadedLbs = await Promise.all(lb_promises)
        setLorebooks(loadedLbs)
      } catch (err: unknown) {
        logger.error('Failed to load chat data:', err)
      }
    }

    loadData()
  }, [chatId, mapHistoryMessages, setActiveLeafId, setMessageTree, setMessages, setPerspective, setLanguage])

  return (
    <div className={`${styles.container} ${isSidebarOpen ? styles.sidebarActive : ''}`}>
      <div className={`${styles.chatLayout} ${fontSize === 'small' ? styles.fontSmall : fontSize === 'large' ? styles.fontLarge : ''}`}>
        <ChatHeader
          title={chat?.title || ''}
          isGenerating={isGenerating}
          lastSaved={lastSaved}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <MessageList scrollRef={scrollRef}>
          {messages.map((msg, idx) => (
            <MessageItem
              key={msg.id}
              msg={msg}
              isLast={idx === messages.length - 1}
              isGenerating={isGenerating}
              showThoughtsGlobal={showThoughtsGlobal}
              personaAvatar={persona?.avatar_url || ''}
              characterAvatar={character?.avatar_url || ''}
              onEdit={handleEditMessage}
              onRegenerate={handleRegenerate}
              onSiblingSwitch={handleSiblingSwitch}
              onForkChat={handleForkChat}
              scrollToBottom={scrollToBottom}
            />
          ))}
        </MessageList>

        <ChatErrorBanner
          error={chatError}
          onClose={() => setChatError(null)}
        />

        <ChatInput
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onSend={handleSend}
          onStop={() => setIsGenerating(false)}
          isGenerating={isGenerating}
        />
      </div>

      <ChatSidebarContainer
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        chat={chat}
        character={character}
        persona={persona}
        scenario={scenario}
        checkpoints={checkpoints}
        lorebooks={lorebooks}
        perspective={perspective}
        language={language}
        fontSize={fontSize}
        autoScrollEnabled={autoScrollEnabled}
        showThoughtsGlobal={showThoughtsGlobal}
        onPerspectiveChange={handlePerspectiveChange}
        onLanguageChange={handleLanguageChange}
        onFontSizeChange={handleFontSizeChange}
        onAutoScrollToggle={handleAutoScrollToggle}
        onShowThoughtsToggle={handleShowThoughtsToggle}
      />
    </div>
  )
}
