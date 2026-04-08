import React from 'react'
import styles from './MessageList.module.css'

interface MessageListProps {
  children: React.ReactNode
  scrollRef: React.RefObject<HTMLDivElement | null>
}

export function MessageList({ children, scrollRef }: MessageListProps) {
  return (
    <main className={styles.messageArea} ref={scrollRef}>
      <div className={styles.messageList}>
        {children}
      </div>
    </main>
  )
}
