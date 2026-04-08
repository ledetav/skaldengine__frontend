import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './ChatScreen.module.css'
import { chatsApi, type Chat as ChatType } from '../../api/chats'
import { messagesApi, type Message as BackendMessage } from '../../api/messages'
import { charactersApi } from '../../api/characters'
import { personasApi } from '../../api/personas'
import type { Character } from '../../types/character'
import type { UserPersona } from '../../types/chat'

interface Message {
  id: string
  author: string
  content: string
  role: 'user' | 'assistant'
  thought?: string
  parent_id?: string
  siblings_count?: number
  current_sibling_index?: number
  is_edited?: boolean
}




export default function ChatScreen() {
  const { chatId } = useParams<{ chatId: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const navigate = useNavigate()
  
  const [chat, setChat] = useState<ChatType | null>(null)
  const [character, setCharacter] = useState<Character | null>(null)
  const [persona, setPersona] = useState<UserPersona | null>(null)
  const [scenario, setScenario] = useState<{title: string, description: string} | null>(null)
  
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [activeLeafId, setActiveLeafId] = useState<string | null>(null)
  
  const [messageTree, setMessageTree] = useState<any[]>([])
  const [userRole, setUserRole] = useState<'user' | 'mod' | 'admin'>('user')
  
  // UI States
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024)
  const [isCharExpanded, setIsCharExpanded] = useState(false)
  const [isPersonaExpanded, setIsPersonaExpanded] = useState(false)
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(false)
  const [isLoreExpanded, setIsLoreExpanded] = useState(false)
  
  // ... (Settings States)
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
  const [lastSaved, setLastSaved] = useState<Date>(new Date())
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
        
        // Map backend history to frontend messages
        const mappedMessages: Message[] = historyData.active_branch.map(m => ({
          id: m.id,
          author: m.role === 'user' ? (personaData.name || 'Вы') : charData.name,
          content: m.content,
          role: m.role,
          thought: m.hidden_thought,
          parent_id: m.parent_id,
          siblings_count: m.siblings_count,
          current_sibling_index: m.current_sibling_index,
          is_edited: m.is_edited
        }))
        
        setMessages(mappedMessages)
        
        // In a real app we'd get userRole from auth context
        setUserRole('admin') 

      } catch (err: any) {
        console.error('Failed to load chat data:', err)
        setError(err.message)
      }
    }

    loadData()
  }, [chatId])

  const handleSiblingSwitch = async (msgId: string, direction: 'prev' | 'next') => {
    if (isGenerating || !chatId) return
    
    // Find message and its siblings in the tree
    const targetMsg = messageTree.find(m => m.id === msgId)
    if (!targetMsg) return
    
    const siblings = messageTree
      .filter(m => m.parent_id === targetMsg.parent_id)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    
    const currentIndex = siblings.findIndex(m => m.id === msgId)
    const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1
    
    if (newIndex < 0 || newIndex >= siblings.length) return
    
    const nextMsg = siblings[newIndex]
    
    // Find a leaf in the branch of the next sibling
    const findLeaf = (mId: string): string => {
       const children = messageTree.filter(m => m.parent_id === mId)
       if (children.length === 0) return mId
       // Pick most recent child's branch or first
       return findLeaf(children[children.length - 1].id)
    }
    
    const newLeafId = findLeaf(nextMsg.id)
    
    try {
      await chatsApi.updateChat(chatId, { active_leaf_id: newLeafId })
      // Reload history
      const historyData = await chatsApi.getChatHistory(chatId)
      setActiveLeafId(historyData.active_leaf_id)
      setMessageTree(historyData.tree)
      
      const mapped: Message[] = historyData.active_branch.map(m => ({
        id: m.id,
        author: m.role === 'user' ? (persona?.name || 'Вы') : character?.name || 'Skald',
        content: m.content,
        role: m.role,
        thought: m.hidden_thought,
        parent_id: m.parent_id,
        siblings_count: m.siblings_count,
        current_sibling_index: m.current_sibling_index,
        is_edited: m.is_edited
      }))
      setMessages(mapped)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value)
    e.target.style.height = 'auto'
    const newHeight = Math.min(e.target.scrollHeight, 120)
    e.target.style.height = `${newHeight}px`
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
      
      const emptyAiMessage: Message = {
        id: aiMsgId,
        author: character?.name || 'Skald',
        content: '',
        role: 'assistant'
      }
      setMessages(prev => [...prev, emptyAiMessage])

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
          thought: lastAiMsg.hidden_thought,
          siblings_count: lastAiMsg.siblings_count,
          current_sibling_index: lastAiMsg.current_sibling_index
        } : m
      ))
      
      setLastSaved(new Date())
    } catch (err: any) {
      console.error('Failed to send message:', err)
      setError(err.message)
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
      
      const emptyAiMessage: Message = {
        id: aiMsgId,
        author: character?.name || 'Skald',
        content: '',
        role: 'assistant',
        parent_id: targetMsg.parent_id
      }
      setMessages(prev => [...prev, emptyAiMessage])

      await messagesApi.regenerateMessageStream(targetMsg.parent_id, (chunk) => {
        aiContent += chunk
        setMessages(prevMsgs => prevMsgs.map(m => 
          m.id === aiMsgId ? { ...m, content: aiContent } : m
        ))
      })

      const updatedHistory = await chatsApi.getChatHistory(chatId)
      setActiveLeafId(updatedHistory.active_leaf_id)
      
      const mappedMessages: Message[] = updatedHistory.active_branch.map(m => ({
        id: m.id,
        author: m.role === 'user' ? (persona?.name || 'Вы') : character?.name || 'Skald',
        content: m.content,
        role: m.role,
        thought: m.hidden_thought,
        parent_id: m.parent_id,
        siblings_count: m.siblings_count,
        current_sibling_index: m.current_sibling_index,
        is_edited: m.is_edited
      }))
      setMessages(mappedMessages)
      
    } catch (err: any) {
      setError(err.message)
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
      
      const mapped: Message[] = updatedHistory.active_branch.map(m => ({
        id: m.id,
        author: m.role === 'user' ? (persona?.name || 'Вы') : character?.name || 'Skald',
        content: m.content,
        role: m.role,
        thought: m.hidden_thought,
        parent_id: m.parent_id,
        siblings_count: m.siblings_count,
        current_sibling_index: m.current_sibling_index,
        is_edited: m.is_edited
      }))
      setMessages(mapped)
    } catch (err: any) {
      setError(err.message)
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

  const stopGeneration = () => {
    setIsGenerating(false)
  }

  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  return (
    <div className={`${styles.container} ${isSidebarOpen ? styles.sidebarActive : ''}`}>

      {/* Main Chat Area */}
      <div 
        className={`${styles.chatLayout} ${fontSize === 'small' ? styles.fontSmall : fontSize === 'large' ? styles.fontLarge : ''}`}
      >
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <Link to="/dashboard" className={styles.backBtn}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              <span>В хаб</span>
            </Link>
            <div className={styles.chatInfo}>
              <h1 className={styles.chatTitle}>
                {chat?.title || 'Загрузка...'}
              </h1>
              <div className={styles.saveStatus}>
                <span className={styles.saveTime}>
                  {isGenerating ? 'Skald пишет...' : `Сохранено: ${lastSaved.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`}
                </span>
                <div className={styles.infoWrapper}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                  </svg>
                  <div className={styles.saveTooltip}>
                    Все изменения сохраняются автоматически
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.headerActions}>
              <button 
                className={`${styles.actionBtn} ${isSidebarOpen ? styles.actionActive : ''}`} 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="15" y1="3" x2="15" y2="21"/>
                </svg>
              </button>
            </div>
          </div>
        </header>

        <main className={styles.messageArea} ref={scrollRef}>
          <div className={styles.messageList}>
            {messages.map((msg, idx) => (
               <div 
                key={msg.id} 
                className={msg.role === 'user' ? styles.userMessage : styles.aiMessage}
              >
                <div className={msg.role === 'user' ? styles.userSide : styles.aiSide}>
                  <div className={msg.role === 'user' ? styles.avatarUser : styles.avatar}>
                    <img 
                      src={msg.role === 'user' ? persona?.avatar : character?.avatar} 
                      alt="" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }}
                    />
                  </div>
                </div>

                <div className={msg.role === 'user' ? styles.userContent : styles.aiContent}>
                  <span className={msg.role === 'user' ? styles.authorNameUser : styles.authorName}>
                    {msg.author}
                  </span>
                  
                  <div className={msg.role === 'user' ? styles.bubbleUser : styles.bubbleAI}>
                    {msg.thought && showThoughtsGlobal && (
                      <ThoughtBlock 
                        thought={msg.thought} 
                        onToggle={() => setTimeout(() => scrollToBottom('smooth'), 100)}
                      />
                    )}
                    
                    <div className={styles.textContent}>
                      {editingMessageId === msg.id ? (
                        <div className={styles.editArea}>
                          <textarea 
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className={styles.editTextarea}
                            autoFocus
                          />
                          <div className={styles.editActions}>
                            <button onClick={() => {
                              handleEditMessage(msg.id, editValue)
                              setEditingMessageId(null)
                            }}>Сохранить</button>
                            <button onClick={() => setEditingMessageId(null)}>Отмена</button>
                          </div>
                        </div>
                      ) : (
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({node, ...props}) => <p style={{ whiteSpace: 'pre-wrap' }} {...props} />
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      )}
                    </div>
                  </div>

                  {/* Message Actions (Swipes, Edit, Regenerate) */}
                  {!editingMessageId && (
                    <div className={styles.messageActions}>
                      {msg.role === 'assistant' && (msg.siblings_count || 0) > 1 && (
                        <div className={styles.swipeControls}>
                          <button 
                            className={styles.swipeBtn}
                            onClick={() => handleSiblingSwitch(msg.id, 'prev')}
                            disabled={msg.current_sibling_index === 0}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <path d="M15 18l-6-6 6-6"/>
                            </svg>
                          </button>
                          <span className={styles.siblingInfo}>
                            {(msg.current_sibling_index || 0) + 1} / {msg.siblings_count}
                          </span>
                          <button 
                            className={styles.swipeBtn}
                            onClick={() => handleSiblingSwitch(msg.id, 'next')}
                            disabled={(msg.current_sibling_index || 0) + 1 === msg.siblings_count}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <path d="M9 18l6-6-6-6"/>
                            </svg>
                          </button>
                        </div>
                      )}

                      {msg.role === 'assistant' && idx === messages.length - 1 && !isGenerating && (
                        <button 
                          className={styles.miniActionBtn}
                          onClick={() => handleRegenerate(msg.id)}
                          title="Перегенерировать"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16"/>
                          </svg>
                        </button>
                      )}

                      {msg.role === 'user' && !isGenerating && (
                        <button 
                          className={styles.miniActionBtn}
                          onClick={() => {
                            setEditingMessageId(msg.id)
                            setEditValue(msg.content)
                          }}
                          title="Редактировать"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* Input Area */}
        <footer className={styles.footer}>
          <div className={styles.inputWrapper}>
          <textarea 
            className={styles.textarea}
            placeholder={isGenerating ? "Подождите, Skald говорит..." : "Напишите свою историю..."}
            value={inputValue}
            onChange={handleInputChange}
            disabled={isGenerating}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
                // Reset height
                if (e.currentTarget) e.currentTarget.style.height = 'auto'
              }
            }}
            rows={1}
          />
          {isGenerating ? (
            <button 
              className={styles.stopBtn}
              onClick={stopGeneration}
              title="Stop Generation"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            </button>
          ) : (
            <button 
              className={styles.sendBtn}
              onClick={handleSend}
              disabled={!inputValue.trim()}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          )}
        </div>
        </footer>
      </div>

      {/* Sidebar Right */}
      <aside className={`${styles.sidebar} ${!isSidebarOpen ? styles.sidebarClosed : ''}`}>
        <button 
          className={styles.closeSidebarBtn} 
          onClick={() => setIsSidebarOpen(false)}
          title="Скрыть панель"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className={styles.sidebarSection}>
          <Link to="/profile" className={styles.profileBtn}>
            <div className={styles.profileAvatar}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div className={styles.profileText}>
              <span className={styles.profileName}>Вы</span>
              <div className={styles.profileAction}>
                <span>Перейти в профиль</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </div>
            </div>
          </Link>
        </div>

        {/* Scenario Info at the Top */}
        {chat?.mode === 'scenario' && scenario && (
          <div className={styles.sidebarSection}>
            <div className={styles.scenarioCardSidebar}>
              <div className={styles.scenarioHeader}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span className={styles.scenarioBadge}>Сценарий активен</span>
              </div>
              <h4 className={styles.scenarioTitleSidebar}>{scenario.title}</h4>
              <p className={styles.scenarioDescSidebar}>{scenario.description}</p>
            </div>
          </div>
        )}

        <div className={styles.sidebarSection}>
          <button 
            className={styles.sectionHeader}
            onClick={() => setIsCharExpanded(!isCharExpanded)}
          >
            <h3 className={styles.sectionTitle}>Персонаж</h3>
            <svg 
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              className={`${styles.sectionChevron} ${isCharExpanded ? styles.chevronRotate : ''}`}
            >
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </button>
          
          <AnimatePresence>
            {isCharExpanded && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{ overflow: 'hidden' }}
                className={styles.sectionContent}
              >
                <div className={styles.charCardMini}>
                  {character ? (
                    <>
                      <div className={styles.charImageWrap}>
                        <img src={character.cover_image} alt="Cover" className={styles.charImage} />
                        <div className={styles.charCoverGradient} />
                        <div className={styles.charOverlayMini}>
                          <div className={styles.avatarCircleMini}>
                            <img src={character.avatar} alt={character.name} />
                          </div>
                          <div className={styles.charMainInfoMini}>
                            <h4>{character.name}</h4>
                            <span className={styles.fandomBadge}>{character.fandom}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className={styles.charDetailsMini}>
                        <p className={styles.charDescMini}>{character.description}</p>
                        
                        <div className={styles.statsGridMini}>
                          <div className={styles.statItemMini}>
                            <span className={styles.statLabelMini}>Месяц</span>
                            <span className={styles.statValueMini}>{character.monthly_chats_count?.toLocaleString() || 0}</span>
                          </div>
                          <div className={styles.statItemMini}>
                            <span className={styles.statLabelMini}>Всего</span>
                            <span className={styles.statValueMini}>{character.total_chats_count?.toLocaleString() || 0}</span>
                          </div>
                          <div className={styles.statItemMini}>
                            <span className={styles.statLabelMini}>Сценариев</span>
                            <span className={styles.statValueMini}>{character.scenarios_count || 0}</span>
                          </div>
                        </div>

                        {!character.has_lorebook && (
                          <div className={styles.loreWarningMini}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                            </svg>
                            <span>Лорбук не заполнен</span>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className={styles.loadingCard}>Загрузка персонажа...</div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className={styles.sidebarSection}>
          <button 
            className={styles.sectionHeader}
            onClick={() => setIsPersonaExpanded(!isPersonaExpanded)}
          >
            <h3 className={styles.sectionTitle}>Ваша персона</h3>
            <svg 
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              className={`${styles.sectionChevron} ${isPersonaExpanded ? styles.chevronRotate : ''}`}
            >
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </button>

          <AnimatePresence>
            {isPersonaExpanded && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{ overflow: 'hidden' }}
                className={styles.sectionContent}
              >
                <div className={styles.personaCardSidebar}>
                  {persona ? (
                    <>
                      <div className={styles.personaHeaderSidebar}>
                        <div className={styles.personaAvatarSidebar}>
                          <img src={persona.avatar} alt="Avatar" />
                        </div>
                        <div className={styles.personaMetaSidebar}>
                          <h4 className={styles.personaNameSidebar}>{persona.name}</h4>
                          <span className={styles.personaMetaText}>
                            {persona.age} лет, {persona.gender}
                          </span>
                        </div>
                      </div>
                      <p className={styles.personaDescSidebar}>{persona.description}</p>
                    </>
                  ) : (
                    <div className={styles.loadingCard}>Загрузка персоны...</div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Settings Section */}
        <div className={styles.sidebarSection}>
          <button 
            className={styles.sectionHeader}
            onClick={() => setIsSettingsExpanded(!isSettingsExpanded)}
          >
            <h3 className={styles.sectionTitle}>Настройки</h3>
            <svg 
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              className={`${styles.sectionChevron} ${isSettingsExpanded ? styles.chevronRotate : ''}`}
            >
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </button>

          <AnimatePresence>
            {isSettingsExpanded && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{ overflow: 'hidden' }}
                className={styles.sectionContent}
              >
                <div className={styles.settingsGrid}>
                  <div className={styles.settingItem}>
                    <label>Перспектива</label>
                    <CustomSelect 
                      value={perspective} 
                      onChange={(val) => setPerspective(val as any)}
                      options={[
                        { value: 'first', label: '1-е лицо (Я)' },
                        { value: 'second', label: '2-е лицо (Ты)' },
                        { value: 'third', label: '3-е лицо (Он/Она)' }
                      ]}
                    />
                  </div>
                  <div className={styles.settingItem}>
                    <label>Язык</label>
                    <CustomSelect 
                      value={language} 
                      onChange={(val) => setLanguage(val as any)}
                      options={[
                        { value: 'RU', label: 'Русский' },
                        { value: 'EN', label: 'English' }
                      ]}
                    />
                  </div>
                  <div className={styles.localSettingsHint}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                    </svg>
                    <span>Параметры ниже сохраняются только на этом устройстве</span>
                  </div>

                  <div className={`${styles.settingItem} ${styles.fontSizeSetting}`}>
                    <label>Размер шрифта</label>
                    <div className={styles.fontSizeGroup}>
                      {['small', 'medium', 'large'].map(s => (
                        <button 
                          key={s} 
                          className={`${styles.sizeBtn} ${fontSize === s ? styles.activeSize : ''}`}
                          onClick={() => setFontSize(s as any)}
                        >
                          {s === 'small' ? 'A' : s === 'medium' ? 'AA' : 'AAA'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className={styles.settingToggle}>
                    <label>Автопрокрутка</label>
                    <button 
                      className={`${styles.toggleSwitch} ${autoScrollEnabled ? styles.toggleOn : ''}`}
                      onClick={() => setAutoScrollEnabled(!autoScrollEnabled)}
                    >
                      <div className={styles.toggleKnob} />
                    </button>
                  </div>
                  <div className={styles.settingToggle}>
                    <label>Показывать мысли</label>
                    <button 
                      className={`${styles.toggleSwitch} ${showThoughtsGlobal ? styles.toggleOn : ''}`}
                      onClick={() => setShowThoughtsGlobal(!showThoughtsGlobal)}
                    >
                      <div className={styles.toggleKnob} />
                    </button>
                  </div>

                  <div className={styles.apiKeySection}>
                    <div className={styles.apiKeyHeader}>
                      <label>API Ключ</label>
                      <button 
                        className={styles.editApiKeyBtn}
                        onClick={() => setIsApiKeyModalOpen(true)}
                        title="Редактировать ключ"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                    </div>
                    {!apiKey && (
                      <div className={styles.apiKeyReminder}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                        </svg>
                        <span>Ключ не установлен. Для работы ИИ требуется API-ключ.</span>
                      </div>
                    )}
                    {apiKey && (
                      <div className={styles.apiKeyStatus}>
                        <div className={styles.statusDot} />
                        <span>Ключ установлен</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>


        {/* Lorebook Section */}
        <div className={styles.sidebarSection}>
          <button 
            className={styles.sectionHeader}
            onClick={() => setIsLoreExpanded(!isLoreExpanded)}
          >
            <h3 className={styles.sectionTitle}>База знаний (Лорбук)</h3>
            <svg 
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              className={`${styles.sectionChevron} ${isLoreExpanded ? styles.chevronRotate : ''}`}
            >
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </button>

          <AnimatePresence>
            {isLoreExpanded && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{ overflow: 'hidden' }}
                className={styles.sectionContent}
              >
                <div className={styles.loreList}>
                  <div className={styles.loreItem}>
                    <div className={styles.loreMainInfo}>
                      <span className={styles.loreType}>Персона</span>
                      <span className={styles.loreName}>Дневник Скитальца</span>
                    </div>
                    <button className={styles.loreChangeBtn}>Сменить</button>
                  </div>

                  {(userRole === 'admin' || userRole === 'mod') && (
                    <>
                      <div className={styles.loreItem}>
                        <div className={styles.loreMainInfo}>
                          <span className={styles.loreType}>Мир</span>
                          <span className={styles.loreName}>Хроники Пепла</span>
                        </div>
                      </div>
                      <div className={styles.loreItem}>
                        <div className={styles.loreMainInfo}>
                          <span className={styles.loreType}>Лорбук персонажа</span>
                          <span className={styles.loreName}>История Skald</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </aside>

      <ApiKeyModal 
        isOpen={isApiKeyModalOpen} 
        onClose={() => setIsApiKeyModalOpen(false)} 
        initialValue={apiKey}
        onSave={(val) => setApiKey(val)}
      />
    </div>
  )
}



function ThoughtBlock({ thought, onToggle }: { thought: string; onToggle?: () => void }) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleToggle = () => {
    setIsExpanded(!isExpanded)
    if (onToggle) onToggle()
  }

  return (
    <motion.div 
      className={styles.thoughtContainer}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <button 
        className={styles.thoughtTag} 
        onClick={handleToggle}
        aria-expanded={isExpanded}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04z" />
          <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04z" />
        </svg>
        <span>{isExpanded ? 'Скрыть мысли' : 'Мысли Skald...'}</span>
        <motion.svg 
          width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          className={styles.chevron}
          animate={{ rotate: isExpanded ? 180 : 0 }}
        >
          <path d="m6 9 6 6 6-6"/>
        </motion.svg>
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            className={styles.thoughtContent}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {thought}
            </ReactMarkdown>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function CustomSelect({ value, options, onChange }: { value: string; options: {value: string, label: string}[]; onChange: (val: string) => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const selectedOption = options.find(o => o.value === value)

  return (
    <div className={styles.customSelectContainer}>
      <button 
        className={`${styles.customSelectTrigger} ${isOpen ? styles.isOpen : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedOption?.label}</span>
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className={isOpen ? styles.rotate : ''}>
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className={styles.selectBackdrop} onClick={() => setIsOpen(false)} />
            <motion.div 
              className={styles.customSelectDropdown}
              initial={{ opacity: 0, scaleY: 0, originY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              exit={{ opacity: 0, scaleY: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {options.map(opt => (
                <button 
                  key={opt.value}
                  className={`${styles.customSelectOption} ${value === opt.value ? styles.activeOption : ''}`}
                  onClick={() => {
                    onChange(opt.value)
                    setIsOpen(false)
                  }}
                >
                  {opt.label}
                  {value === opt.value && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

function ApiKeyModal({ isOpen, onClose, initialValue, onSave }: { isOpen: boolean; onClose: () => void; initialValue: string; onSave: (val: string) => void }) {
  const [tempKey, setTempKey] = useState(initialValue)

  useEffect(() => {
    if (isOpen) setTempKey(initialValue)
  }, [isOpen, initialValue])

  const handleSave = () => {
    onSave(tempKey)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div key="api-key-modal-root">
          <motion.div 
            className={styles.modalBackdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <div className={styles.modalWrapper}>
            <motion.div 
              className={styles.apiKeyModal}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <div className={styles.modalHeader}>
                <h3>Настройка API Ключа</h3>
                <button className={styles.modalCloseBtn} onClick={onClose}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              
              <div className={styles.modalBody}>
                <p>Введите ваш API-ключ. Ключ сохраняется локально в вашем браузере.</p>
                <div className={styles.inputGroup}>
                  <input 
                    type="password" 
                    value={tempKey} 
                    onChange={(e) => setTempKey(e.target.value)}
                    placeholder="sk-..."
                    className={styles.modalInput}
                  />
                  <div className={styles.inputGlow} />
                </div>
                <div className={styles.modalHint}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                  </svg>
                  <span>Настройки сохраняются только на этом устройстве</span>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button className={styles.cancelBtn} onClick={onClose}>Отмена</button>
                <button className={styles.saveBtnModal} onClick={handleSave}>Сохранить</button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}
