import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import styles from './Common.module.css'

interface ThoughtBlockProps {
  thought: string
  authorName?: string
  onToggle?: () => void
}

export function ThoughtBlock({ thought, authorName = 'скальд', onToggle }: ThoughtBlockProps) {
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
        <span>{isExpanded ? 'Скрыть мысли' : `Мысли ${authorName}`}</span>
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
