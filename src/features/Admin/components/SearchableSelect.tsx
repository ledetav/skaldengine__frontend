import React, { useState, useRef, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui'
import styles from '../styles'

interface Option {
  id: string
  name: string
  subtext?: string
}

interface SearchableSelectProps {
  options: Option[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  onCreateNew?: () => void
  onCreateLabel?: string
  disabled?: boolean
  className?: string
  customValueLabel?: string
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Выберите...',
  onCreateNew,
  onCreateLabel = '+ Создать',
  disabled = false,
  className = '',
  customValueLabel
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedOption = useMemo(() => options.find(o => o.id === value), [options, value])

  const filteredOptions = useMemo(() => {
    return options.filter(o => 
      o.name.toLowerCase().includes(search.toLowerCase()) || 
      (o.subtext && o.subtext.toLowerCase().includes(search.toLowerCase()))
    )
  }, [options, search])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    
    // Update coordinates when opening
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setCoords({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width
      })
    }

    const handleScroll = (event: Event) => {
      // Don't close if scrolling inside the dropdown
      const target = event.target as HTMLElement
      if (target.closest(`.${styles.selectDropdown}`)) return
      setIsOpen(false)
    }
    window.addEventListener('scroll', handleScroll, { capture: true })
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('scroll', handleScroll, { capture: true })
    }
  }, [isOpen])

  return (
    <div className={`${styles.searchableSelectContainer} ${className}`} ref={containerRef}>
      <div 
        className={`${styles.selectTrigger} ${isOpen ? styles.selectTriggerOpen : ''} ${disabled ? styles.selectDisabled : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className={styles.selectValue}>
          {selectedOption ? (
            <span className={styles.selectedText}>{selectedOption.name}</span>
          ) : customValueLabel ? (
            <span className={styles.selectedText}>{customValueLabel}</span>
          ) : (
            <span className={styles.selectPlaceholder}>{placeholder}</span>
          )}
        </div>
        <div className={styles.selectArrow}>
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              className={styles.selectDropdown}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              style={{ 
                position: 'fixed',
                top: coords.top,
                left: coords.left,
                width: coords.width,
                zIndex: 9999, // Super high to be over everything
                pointerEvents: 'auto'
              }}
            >
              <div className={styles.selectSearchWrapper}>
                <Input 
                  autoFocus
                  placeholder="Поиск..." 
                  value={search} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                  className={styles.selectSearchInput}
                />
              </div>
              
              <div className={styles.selectOptionsList}>
                {onCreateNew && !search && (
                  <div 
                    className={styles.selectOptionCreate}
                    onClick={() => {
                      onCreateNew()
                      setIsOpen(false)
                    }}
                  >
                    {onCreateLabel}
                  </div>
                )}

                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option: Option) => (
                    <div 
                      key={option.id} 
                      className={`${styles.selectOption} ${value === option.id ? styles.selectOptionSelected : ''}`}
                      onClick={() => {
                        onChange(option.id)
                        setIsOpen(false)
                      }}
                    >
                      <div className={styles.optionContent}>
                        <span className={styles.optionName}>{option.name}</span>
                        {option.subtext && <span className={styles.optionSubtext}>{option.subtext}</span>}
                      </div>
                      {value === option.id && (
                        <svg className={styles.checkIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      )}
                    </div>
                  ))
                ) : (
                  <div className={styles.selectNoOptions}>Ничего не найдено</div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  )
}
