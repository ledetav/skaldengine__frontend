import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import styles from './ChatScreen.module.css'

// API & Types
import { chatsApi, type Chat as ChatType } from '../../api/chats'
import { messagesApi } from '../../api/messages'
import { charactersApi } from '../../api/characters'
import { personasApi } from '../../api/personas'
import type { Character } from '../../types/character'
import type { UserPersona, Message } from '../../types/chat'

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
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [activeLeafId, setActiveLeafId] = useState<string | null>(null)
  const [messageTree, setMessageTree] = useState<any[]>([])
  const [userRole, setUserRole] = useState<'user' | 'mod' | 'admin'>('user')
  
  // UI States
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024)
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date>(new Date())
  // Use error state in the UI or remove it. I'll remove it for now to pass build if it's truly unused.
  // Actually, I'll keep it but underscore it if I don't want to render it, or just remove if I want to be clean.
  // I'll remove it and the setError calls to be thorough.

  // Local Settings
  const [perspective, setPerspective] = useState<ChatType['narrative_voice']>(() => 
    (localStorage.getItem('skald_perspective') as any) || 'third'
  )
  const [language, setLanguage] = useState<'RU' | 'EN'>(() => 
    (localStorage.getItem('skald_language') as any) || 'RU'
  )
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>(() => 
    (localStorage.getItem('skald_fontSize') as any) || (window.innerWidth <= 768 ? 'small' : 'medium')
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
        const chatData = await chatsApi.getChat(chatId)
        setChat(chatData)
        setPerspective(chatData.narrative_voice)
        setLanguage(chatData.language.toUpperCase() as any)

        const [charData, personaData, historyData] = await Promise.all([
          charactersApi.getCharacter(chatData.character_id),
          personasApi.getPersona(chatData.user_persona_id),
          chatsApi.getChatHistory(chatId)
        ])

        setCharacter(charData)
        setPersona(personaData as any)
        setActiveLeafId(historyData.active_leaf_id)
        setMessageTree(historyData.tree)
        
        const mappedMessages: Message[] = historyData.active_branch.map(m => ({
          id: m.id,
          author: m.role === 'user' ? (personaData.name || 'Вы') : charData.name,
          content: m.content,
          role: m.role as any,
          hidden_thought: m.hidden_thought,
          chat_id: m.chat_id,
          parent_id: m.parent_id,
          siblings_count: m.siblings_count,
          current_sibling_index: m.current_sibling_index,
          is_edited: m.is_edited,
          created_at: m.created_at
        }))
        
        setMessages(mappedMessages)
        setUserRole('admin') 

      } catch (err: any) {
        console.error('Failed to load chat data:', err)
      }
    }

    loadData()
  }, [chatId])

  // Handlers
  const handleSiblingSwitch = async (msgId: string, direction: 'prev' | 'next') => {
    if (isGenerating || !chatId) return
    const targetMsg = messageTree.find(m => m.id === msgId)
    if (!targetMsg) return
    
    const siblings = messageTree
      .filter(m => m.parent_id === targetMsg.parent_id)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    
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
          author: m.role === 'user' ? (persona?.name || 'Вы') : character?.name || 'Skald',
          content: m.content,
          role: m.role as any,
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
      console.error('Sibling switch failed:', err)
    }
  }

  const handleSend = async () => {
    if (!inputValue.trim() || isGenerating || !chatId) return
    const userMsgContent = inputValue
    setInputValue('')
    setIsGenerating(true)

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
        author: character?.name || 'Skald',
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
      console.error('Send failed:', err)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRegenerate = async (msgId: string) => {
    if (isGenerating || !chatId) return
    setIsGenerating(true)
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
        author: character?.name || 'Skald',
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
      setMessages(updatedHistory.active_branch.map(m => ({
        id: m.id,
        author: m.role === 'user' ? (persona?.name || 'Вы') : character?.name || 'Skald',
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
      console.error('Send failed:', err)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleEditMessage = async (msgId: string, newContent: string) => {
    if (isGenerating || !chatId) return
    try {
      await messagesApi.editMessage(msgId, { new_content: newContent })
      const updatedHistory = await chatsApi.getChatHistory(chatId)
      setActiveLeafId(updatedHistory.active_leaf_id)
      setMessages(updatedHistory.active_branch.map(m => ({
        id: m.id,
        author: m.role === 'user' ? (persona?.name || 'Вы') : character?.name || 'Skald',
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
      console.error('Sibling switch failed:', err)
    }
  }

  const handleSettingsUpdate = async (updates: Partial<ChatType>) => {
    if (!chatId) return
    try {
      await chatsApi.updateChat(chatId, updates)
      setChat(prev => prev ? { ...prev, ...updates } : null)
      setLastSaved(new Date())
    } catch (err) {
      console.error('Failed to sync settings:', err)
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
              personaAvatar={persona?.avatar_url || undefined}
              characterAvatar={character?.avatar_url}
              onEdit={handleEditMessage}
              onRegenerate={handleRegenerate}
              onSiblingSwitch={handleSiblingSwitch}
              scrollToBottom={scrollToBottom}
            />
          ))}
        </MessageList>

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
             setPerspective(val as any)
             handleSettingsUpdate({ narrative_voice: val as any })
          }}
          onLanguageChange={(val) => {
             setLanguage(val as any)
             handleSettingsUpdate({ language: val.toLowerCase() as any })
          }}
          onFontSizeChange={(val) => handleLocalSettingChange('skald_fontSize', val, setFontSize)}
          onAutoScrollToggle={() => handleLocalSettingChange('skald_autoScroll', !autoScrollEnabled, setAutoScrollEnabled)}
          onShowThoughtsToggle={() => handleLocalSettingChange('skald_showThoughts', !showThoughtsGlobal, setShowThoughtsGlobal)}
          onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        />

        <LorebookSection userRole={userRole} />
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
