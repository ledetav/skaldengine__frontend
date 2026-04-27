import { logger } from "@/core/utils/logger";
import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import styles from './ChatScreen.module.css'

// API & Types
import { chatsApi } from '@/core/api/chats'
import { scenariosApi } from '@/core/api/scenarios'
import { messagesApi } from '@/core/api/messages'
import { charactersApi } from '@/core/api/characters'
import { personasApi } from '@/core/api/personas'
import { authApi } from '@/core/api/auth'
import { lorebooksApi } from '@/core/api/lorebooks'
import type { Character } from '@/core/types/character'
import type { UserPersona, Message, NarrativeVoiceType, Scenario, Chat as ChatType, Lorebook } from '@/core/types/chat'

// Components
import { ChatHeader } from './components/ChatHeader'
import { ChatInput } from './components/ChatInput'
import { MessageList } from './components/MessageList'
import { MessageItem } from './components/MessageItem'
import { Sidebar } from './components/Sidebar'

// Sidebar Sections
import { ProfileSection, ScenarioSection } from './components/sections/CommonSections'
import { CharacterSection } from './components/sections/CharacterSection'
import { PersonaSection } from './components/sections/PersonaSection'
import { SettingsSection } from './components/sections/SettingsSection'
import { LorebookSection } from './components/sections/LorebookSection'

// Common
import { ApiKeyModal } from './components/common/ApiKeyModal'

export default function ChatScreen() {
  const { chatId } = useParams<{ chatId: string }>()
  
  const [chat, setChat] = useState<ChatType | null>(null)
  const [character, setCharacter] = useState<Character | null>(null)
  const [persona, setPersona] = useState<UserPersona | null>(null)
  const [scenario, setScenario] = useState<Scenario | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [activeLeafId, setActiveLeafId] = useState<string | null>(null)
  const [messageTree, setMessageTree] = useState<Message[]>([])
  const [lorebooks, setLorebooks] = useState<Lorebook[]>([])
  
  // UI States
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024)
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date>(new Date())
  const [chatError, setChatError] = useState<string | null>(null)

  // Local Settings
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
  const [apiKey, setApiKey] = useState(() => 
    localStorage.getItem('skald_apiKey') || ''
  )

  const scrollRef = useRef<HTMLDivElement>(null)

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

  // Data Loading
  useEffect(() => {
    if (!chatId) return

    const loadData = async () => {
      try {
        if (!chatId) return;
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
        
        const mappedMessages: Message[] = historyData.active_branch.map(m => ({
          id: m.id,
          author: m.role === 'user' ? (personaData.name || 'Вы') : charData.name,
          content: m.content,
          role: m.role as 'user' | 'assistant',
          hidden_thought: m.hidden_thought,
          chat_id: m.chat_id,
          parent_id: m.parent_id,
          siblings_count: m.siblings_count,
          current_sibling_index: m.current_sibling_index,
          is_edited: m.is_edited,
          created_at: m.created_at
        }))
        
        setMessages(mappedMessages)
        await authApi.getMe()

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
  }, [chatId])

  const handleForkChat = useCallback(async (messageId: string) => {
    try {
      const newChat = await messagesApi.forkChat(messageId)
      window.location.href = `/chat/${newChat.id}`
    } catch (err) {
      logger.error('Failed to fork chat:', err)
      setChatError('Не удалось создать ветку чата. Пожалуйста, попробуйте позже.')
    }
  }, [])

  useEffect(() => {
    (window as any).forkChatFromMsg = handleForkChat
    return () => { delete (window as any).forkChatFromMsg }
  }, [handleForkChat])

  // Handlers
  const handleSiblingSwitch = async (msgId: string, direction: 'prev' | 'next') => {
    if (isGenerating || !chatId) return
    const targetMsg = messageTree.find(m => m.id === msgId)
    if (!targetMsg) return
    
    const siblings = messageTree
      .filter(m => m.parent_id === targetMsg.parent_id)
      .sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime())
    
    const currentIndex = siblings.findIndex(m => m.id === msgId)
    const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1
    if (newIndex < 0 || newIndex >= siblings.length) return
    
    const nextMsg = siblings[newIndex]
    const findLeaf = (mId: string): string => {
       const children = messageTree.filter(m => m.parent_id === mId)
       return children.length === 0 ? mId : findLeaf(children[children.length - 1].id)
    }
    
    const newLeafId = findLeaf(nextMsg.id)
    
    try {
      await chatsApi.updateChat(chatId, { active_leaf_id: newLeafId })
      const historyData = await chatsApi.getChatHistory(chatId)
      setActiveLeafId(historyData.active_leaf_id)
      setMessageTree(historyData.tree)
      
        const mapped: Message[] = historyData.active_branch.map(m => ({
          id: m.id,
          author: m.role === 'user' ? (persona?.name || 'Вы') : character?.name || 'скальд',
          content: m.content,
          role: m.role as 'user' | 'assistant',
          hidden_thought: m.hidden_thought,
          chat_id: m.chat_id,
          parent_id: m.parent_id,
          siblings_count: m.siblings_count,
          current_sibling_index: m.current_sibling_index,
          is_edited: m.is_edited,
          created_at: m.created_at
        }))
      setMessages(mapped)
    } catch (err: any) {
      logger.error('Sibling switch failed:', err)
    }
  }

  const handleSend = async () => {
    if (!inputValue.trim() || isGenerating || !chatId) return
    const userMsgContent = inputValue
    setInputValue('')
    setIsGenerating(true)
    setChatError(null)

    if (!apiKey) {
      setChatError('Для работы ИИ необходи��о добавить API-ключ в настройках вашего профиля.')
      setIsGenerating(false)
      return
    }

    const tempUserMsg: Message = {
      id: Date.now().toString(),
      author: persona?.name || 'Вы',
      content: userMsgContent,
      role: 'user'
    }
    setMessages(prev => [...prev, tempUserMsg])

    try {
      const aiMsgId = (Date.now() + 1).toString()
      let aiContent = ''
      setMessages(prev => [...prev, {
        id: aiMsgId,
        author: character?.name || 'скальд',
        content: '',
        role: 'assistant'
      }])

      await messagesApi.sendMessageStream(chatId, { 
        content: userMsgContent,
        parent_id: activeLeafId || undefined
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
          current_sibling_index: lastAiMsg.current_sibling_index
        } : m
      ))
      setLastSaved(new Date())
    } catch (err: any) {
      logger.error('Send failed:', err)
      setMessages(prev => prev.filter(m => m.id !== tempUserMsg.id))
      if (err?.message?.includes('401') || err?.message?.toLowerCase().includes('api key') || !apiKey) {
        setChatError('Для работы ИИ необходимо добавить API-ключ в настройках вашего профиля.')
      } else {
        setChatError('Произошла ошибка при генерации ответа. Пожалуйста, попробуйте позже.')
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRegenerate = async (msgId: string) => {
    if (isGenerating || !chatId) return
    setIsGenerating(true)
    setChatError(null)

    if (!apiKey) {
      setChatError('Для работы ИИ необходимо добавить API-ключ в настройках вашего профиля.')
      setIsGenerating(false)
      return
    }

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
        parent_id: targetMsg.parent_id
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
      setMessages(updatedHistory.active_branch.map(m => ({
        id: m.id,
        author: m.role === 'user' ? (persona?.name || 'Вы') : character?.name || 'скальд',
        content: m.content,
        role: m.role as any,
        hidden_thought: m.hidden_thought,
        chat_id: m.chat_id,
        parent_id: m.parent_id,
        siblings_count: m.siblings_count,
        current_sibling_index: m.current_sibling_index,
        is_edited: m.is_edited,
        created_at: m.created_at
      })))
    } catch (err: any) {
      logger.error('Regeneration failed:', err)
      if (err?.message?.includes('401') || err?.message?.toLowerCase().includes('api key') || !apiKey) {
        setChatError('Для работы ИИ необходимо добавить API-ключ в настройках вашего профиля.')
      } else {
        setChatError('Произошла ошибка при регенерации. Пожалуйста, попробуйте позже.')
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const handleEditMessage = async (msgId: string, newContent: string) => {
    if (isGenerating || !chatId) return
    try {
      await messagesApi.editMessage(msgId, { content: newContent })
      const updatedHistory = await chatsApi.getChatHistory(chatId)
      setActiveLeafId(updatedHistory.active_leaf_id)
      setMessageTree(updatedHistory.tree)
      setMessages(updatedHistory.active_branch.map(m => ({
        id: m.id,
        author: m.role === 'user' ? (persona?.name || 'Вы') : character?.name || 'скальд',
        content: m.content,
        role: m.role as any,
        hidden_thought: m.hidden_thought,
        chat_id: m.chat_id,
        parent_id: m.parent_id,
        siblings_count: m.siblings_count,
        current_sibling_index: m.current_sibling_index,
        is_edited: m.is_edited,
        created_at: m.created_at
      })))
    } catch (err: any) {
      logger.error('Sibling switch failed:', err)
    }
  }

  const handleSettingsUpdate = async (updates: Partial<ChatType>) => {
    if (!chatId) return
    try {
      await chatsApi.updateChat(chatId, updates)
      setChat(prev => prev ? { ...prev, ...updates } : null)
      setLastSaved(new Date())
    } catch (err) {
      logger.error('Failed to sync settings:', err)
    }
  }

  const handleLocalSettingChange = (key: string, value: any, setter: (val: any) => void) => {
    setter(value)
    localStorage.setItem(key, value.toString())
  }

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
              scrollToBottom={scrollToBottom}
            />
          ))}
        </MessageList>

        {chatError && (
          <div style={{
            margin: '0 24px 16px',
            padding: '12px 16px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderLeft: '4px solid var(--accent-red)',
            borderRadius: '0 8px 8px 0',
            color: '#fca5a5',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.05)',
            backdropFilter: 'blur(8px)',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <span style={{flex: 1}}>{chatError}</span>
            <button 
              onClick={() => {
                setChatError(null);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.8rem',
                textDecoration: 'underline'
              }}
            >
              Закрыть
            </button>
          </div>
        )}

        <ChatInput 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onSend={handleSend}
          onStop={() => setIsGenerating(false)}
          isGenerating={isGenerating}
        />
      </div>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)}>
        <ProfileSection />
        
        {chat?.mode === 'scenario' && scenario && (
          <ScenarioSection scenario={scenario} />
        )}

        <CharacterSection character={character} />
        <PersonaSection persona={persona} />
        
        <SettingsSection 
          perspective={perspective}
          language={language}
          fontSize={fontSize}
          autoScrollEnabled={autoScrollEnabled}
          showThoughtsGlobal={showThoughtsGlobal}
          apiKey={apiKey}
          onPerspectiveChange={(val) => {
             setPerspective(val as NarrativeVoiceType)
             handleSettingsUpdate({ narrative_voice: val as NarrativeVoiceType })
          }}
          onLanguageChange={(val) => {
             setLanguage(val as 'RU' | 'EN')
             handleSettingsUpdate({ language: val.toLowerCase() })
          }}
          onFontSizeChange={(val) => handleLocalSettingChange('skald_fontSize', val, setFontSize)}
          onAutoScrollToggle={() => handleLocalSettingChange('skald_autoScroll', !autoScrollEnabled, setAutoScrollEnabled)}
          onShowThoughtsToggle={() => handleLocalSettingChange('skald_showThoughts', !showThoughtsGlobal, setShowThoughtsGlobal)}
          onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        />

        <LorebookSection lorebooks={lorebooks} />
      </Sidebar>

      <ApiKeyModal 
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        initialValue={apiKey}
        onSave={(val) => {
           setApiKey(val)
           localStorage.setItem('skald_apiKey', val)
        }}
      />
    </div>
  )
}
