import React, { useState, useRef, useEffect } from 'react'
import styles from '@/theme/screens/Dashboard/DashboardScreen.module.css'

interface CustomDropdownProps {
  options: string[]
  value: string
  onChange: (value: string) => void
  variant?: 'sidebar' | 'header'
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({ 
  options, 
  value, 
  onChange,
  variant = 'sidebar'
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div 
      className={`${styles.customDropdown} ${isOpen ? styles.isOpen : ''} ${variant === 'header' ? styles.headerVariant : ''}`} 
      ref={dropdownRef}
    >
      <div 
        className={styles.dropdownToggle} 
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{value}</span>
        <span className={styles.chevron}>⌵</span>
      </div>
      
      {isOpen && (
        <div className={styles.dropdownMenu}>
          {options.map((option) => (
            <div 
              key={option}
              className={`${styles.dropdownItem} ${value === option ? styles.activeItem : ''}`}
              onClick={() => {
                onChange(option)
                setIsOpen(false)
              }}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
