import React, { useState, useRef, useEffect, useMemo } from 'react'
import { Input } from '@/components/ui'
import styles from '../Admin.module.css'

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
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

      {isOpen && (
        <div className={styles.selectDropdown}>
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
        </div>
      )}
    </div>
  )
}
