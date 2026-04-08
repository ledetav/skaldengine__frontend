import React from 'react'
import styles from './ChatInput.module.css'

interface ChatInputProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onSend: () => void
  onStop: () => void
  isGenerating: boolean
}

export function ChatInput({ value, onChange, onSend, onStop, isGenerating }: ChatInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
      // Reset height
      e.currentTarget.style.height = 'auto'
    }
  }

  return (
    <footer className={styles.footer}>
      <div className={styles.inputWrapper}>
        <textarea 
          className={styles.textarea}
          placeholder={isGenerating ? "Подождите, Skald говорит..." : "Напишите свою историю..."}
          value={value}
          onChange={onChange}
          disabled={isGenerating}
          onKeyDown={handleKeyDown}
          rows={1}
        />
        {isGenerating ? (
          <button 
            className={styles.stopBtn}
            onClick={onStop}
            title="Stop Generation"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          </button>
        ) : (
          <button 
            className={styles.sendBtn}
            onClick={onSend}
            disabled={!value.trim()}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        )}
      </div>
    </footer>
  )
}
