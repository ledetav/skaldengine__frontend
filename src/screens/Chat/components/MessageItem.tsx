import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ThoughtBlock } from './common/ThoughtBlock'
import styles from './MessageItem.module.css'

interface Message {
  id: string
  author: string
  content: string
  role: 'user' | 'assistant'
  hidden_thought?: string
  parent_id?: string
  siblings_count?: number
  current_sibling_index?: number
  is_edited?: boolean
}

interface MessageItemProps {
  msg: Message
  isLast: boolean
  isGenerating: boolean
  showThoughtsGlobal: boolean
  personaAvatar?: string
  characterAvatar?: string
  onEdit: (id: string, content: string) => void
  onRegenerate: (id: string) => void
  onSiblingSwitch: (id: string, direction: 'prev' | 'next') => void
  scrollToBottom: (behavior?: ScrollBehavior) => void
}

export function MessageItem({ 
  msg, 
  isLast, 
  isGenerating, 
  showThoughtsGlobal, 
  personaAvatar, 
  characterAvatar,
  onEdit,
  onRegenerate,
  onSiblingSwitch,
  scrollToBottom
}: MessageItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(msg.content)

  const handleEditClick = () => {
    setEditValue(msg.content)
    setIsEditing(true)
  }

  const handleSaveEdit = () => {
    onEdit(msg.id, editValue)
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
  }

  const isUser = msg.role === 'user'

  return (
    <div className={isUser ? styles.userMessage : styles.aiMessage}>
      <div className={isUser ? styles.userSide : styles.aiSide}>
        <div className={isUser ? styles.avatarUser : styles.avatar}>
          <img 
            src={isUser ? personaAvatar : characterAvatar} 
            alt="" 
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }}
          />
        </div>
      </div>

      <div className={isUser ? styles.userContent : styles.aiContent}>
        <span className={isUser ? styles.authorNameUser : styles.authorName}>
          {msg.author}
        </span>
        
        <div className={isUser ? styles.bubbleUser : styles.bubbleAI}>
          {msg.hidden_thought && showThoughtsGlobal && (
            <ThoughtBlock 
              thought={msg.hidden_thought} 
              onToggle={() => setTimeout(() => scrollToBottom('smooth'), 100)}
            />
          )}
          
          <div className={styles.textContent}>
            {isEditing ? (
              <div className={styles.editArea}>
                <textarea 
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className={styles.editTextarea}
                  autoFocus
                />
                <div className={styles.editActions}>
                  <button onClick={handleSaveEdit}>Сохранить</button>
                  <button onClick={handleCancelEdit}>Отмена</button>
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

        {!isEditing && (
          <div className={styles.messageActions}>
            {!isUser && (msg.siblings_count || 0) > 1 && (
              <div className={styles.swipeControls}>
                <button 
                  className={styles.swipeBtn}
                  onClick={() => onSiblingSwitch(msg.id, 'prev')}
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
                  onClick={() => onSiblingSwitch(msg.id, 'next')}
                  disabled={(msg.current_sibling_index || 0) + 1 === msg.siblings_count}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </button>
              </div>
            )}

            {!isUser && isLast && !isGenerating && (
              <button 
                className={styles.miniActionBtn}
                onClick={() => onRegenerate(msg.id)}
                title="Перегенерировать"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16"/>
                </svg>
              </button>
            )}

            {isUser && !isGenerating && (
              <button 
                className={styles.miniActionBtn}
                onClick={handleEditClick}
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
  )
}
