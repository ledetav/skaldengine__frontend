import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '@/components/ui/Navbar'
import { chatsApi } from '@/core/api/chats'
import { type Chat } from '@/core/types/chat'
import { Input, Badge, Button } from '@/components/ui'
import styles from './Chat.module.css'

export default function ChatsListScreen() {
  const navigate = useNavigate()
  const [chats, setChats] = useState<Chat[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [modeFilter, setModeFilter] = useState<'all' | 'sandbox' | 'scenario'>('all')
  const [characterFilter, setCharacterFilter] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const data = await chatsApi.getChats(0, 50)
        setChats(data)
      } catch (err) {
        console.error('Failed to fetch chats:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchChats()
  }, [])

  const filteredChats = useMemo(() => {
    return chats.filter((chat: Chat) => {
      const matchesSearch = 
        (chat.title?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (chat.character_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (chat.user_persona_name?.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesMode = modeFilter === 'all' || chat.mode === modeFilter
      const matchesCharacter = characterFilter === 'all' || chat.character_id === characterFilter
      
      return matchesSearch && matchesMode && matchesCharacter
    })
  }, [chats, searchTerm, modeFilter, characterFilter])

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('ru-RU', { 
      day: '2-digit', 
      month: '2-digit', 
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const uniqueCharacters = useMemo(() => {
    const seen = new Set()
    return chats.reduce((acc: {id: string, name: string}[], chat: Chat) => {
      if (!seen.has(chat.character_id)) {
        seen.add(chat.character_id)
        acc.push({ id: chat.character_id, name: chat.character_name || 'Неизвестно' })
      }
      return acc
    }, [])
  }, [chats])

  return (
    <div className={styles.page}>
      <Navbar variant="dashboard" />
      
      <div className={styles.bgOrbs}>
        <div className={`${styles.orb} ${styles.orbPurple}`} />
        <div className={`${styles.orb} ${styles.orbBlue}`} />
      </div>

      <main className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>Мои чаты</h1>
          <p className={styles.subtitle}>Список ваших последних переписок</p>
        </div>

        <div className={styles.controls}>
          <div className={styles.searchWrapper}>
            <div className={styles.searchIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
              </svg>
            </div>
            <Input 
              className={styles.searchInput}
              placeholder="Поиск по названию или персонажам..." 
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div style={{ position: 'relative' }}>
            <Button 
              className={styles.filterBtn} 
              variant="ghost"
              onClick={() => setShowFilters(!showFilters)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="2" y1="14" x2="6" y2="14"/><line x1="10" y1="12" x2="14" y2="12"/><line x1="18" y1="16" x2="22" y2="16"/>
              </svg>
            </Button>

            {showFilters && (
              <div className={styles.filterMenu}>
                <div className={styles.filterSection}>
                  <div className={styles.filterTitle}>Режим игры</div>
                  <div className={styles.filterOptions}>
                    <button 
                      className={`${styles.filterOption} ${modeFilter === 'all' ? styles.filterOptionActive : ''}`}
                      onClick={() => setModeFilter('all')}
                    >
                      Все
                    </button>
                    <button 
                      className={`${styles.filterOption} ${modeFilter === 'sandbox' ? styles.filterOptionActive : ''}`}
                      onClick={() => setModeFilter('sandbox')}
                    >
                      Песочница
                    </button>
                    <button 
                      className={`${styles.filterOption} ${modeFilter === 'scenario' ? styles.filterOptionActive : ''}`}
                      onClick={() => setModeFilter('scenario')}
                    >
                      Сценарий
                    </button>
                  </div>
                </div>

                <div className={styles.filterSection}>
                  <div className={styles.filterTitle}>Персонаж</div>
                  <select 
                    className={styles.filterSelect}
                    value={characterFilter}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCharacterFilter(e.target.value)}
                  >
                    <option value="all">Все персонажи</option>
                    {uniqueCharacters.map((char: {id: string, name: string}) => (
                      <option key={char.id} value={char.id}>{char.name}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.filterActions}>
                  <button 
                    className={styles.resetBtn}
                    onClick={() => {
                      setModeFilter('all')
                      setCharacterFilter('all')
                      setSearchTerm('')
                      setShowFilters(false)
                    }}
                  >
                    Сбросить всё
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className={styles.loading}>
            <p>Загрузка чатов...</p>
          </div>
        ) : filteredChats.length > 0 ? (
          <div className={styles.chatsList}>
            {filteredChats.map((chat: Chat) => (
              <div 
                key={chat.id} 
                className={`ds-card-sm ${styles.chatCard}`}
                onClick={() => navigate(`/chat/${chat.id}`)}
              >
                <div className={styles.chatInfo}>
                  <div className={styles.chatHeader}>
                    <h3 className={styles.chatName}>{chat.title || 'Чат без названия'}</h3>
                    <div className={styles.chatMeta}>
                      <Badge variant={chat.mode === 'scenario' ? 'orange' : 'purple'}>
                        {chat.mode === 'scenario' ? 'Сценарий' : 'Песочница'}
                      </Badge>
                      <span>•</span>
                      <span>{formatDate(chat.updated_at || chat.created_at)}</span>
                    </div>
                  </div>
                  
                  <div className={styles.participants}>
                    <div className={styles.participantItem}>
                      <span>Персонаж:</span>
                      <span className={styles.participantName}>{chat.character_name}</span>
                    </div>
                    <div className={styles.participantItem}>
                      <span>Вы:</span>
                      <span className={styles.participantName}>{chat.user_persona_name}</span>
                    </div>
                  </div>

                  <p className={styles.messagePreview}>
                    {chat.last_message_preview || 'История сообщений пуста...'}
                  </p>
                </div>
                
                <div className={styles.arrowIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 18 6-6-6-6"/>
                  </svg>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <section className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <h3 className={styles.emptyTitle}>
              {searchTerm || modeFilter !== 'all' || characterFilter !== 'all' ? 'Ничего не найдено' : 'Чатов пока нет'}
            </h3>
            <p className={styles.emptyText}>
              {searchTerm || modeFilter !== 'all' || characterFilter !== 'all'
                ? 'Попробуйте изменить параметры поиска или фильтры'
                : 'Выберите персонажа на дашборде, чтобы начать общение'}
            </p>
            {!searchTerm && modeFilter === 'all' && characterFilter === 'all' && (
              <button className={styles.primaryBtn} onClick={() => navigate('/dashboard')}>
                Перейти к персонажам
              </button>
            )}
          </section>
        )}
      </main>
    </div>
  )
}
