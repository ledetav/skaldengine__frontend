import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './Common.module.css'

interface CustomSelectProps {
  value: string
  options: { value: string; label: string }[]
  onChange: (val: string) => void
}

export function CustomSelect({ value, options, onChange }: CustomSelectProps) {
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
