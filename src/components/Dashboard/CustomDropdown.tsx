/**
 * @fileoverview Кастомный выпадающий список выбора параметров (сортировка, пол и т.д.).
 * Реализует анимацию раскрытия, стилизацию шеврона и автоматическое закрытие по клику вне элемента.
 */

import React, { useState, useRef, useEffect } from 'react'
import styles from '@/theme/screens/Dashboard/DashboardScreen.module.css'

interface CustomDropdownProps {
  options: string[]
  value: string
  onChange: (value: string) => void
  variant?: 'sidebar' | 'header'
}

/**
 * Кастомный выпадающий список для фильтров дашборда с анимацией шеврона и закрытием по клику вне элемента.
 * 
 * @param props.options - Список доступных вариантов выбора
 * @param props.value - Выбранное значение
 * @param props.onChange - Обработчик изменения значения
 * @param props.variant - Вариант расположения ('sidebar' в боковой панели или 'header' в шапке)
 */
export const CustomDropdown: React.FC<CustomDropdownProps> = ({ 
  options, 
  value, 
  onChange,
  variant = 'sidebar'
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    /**
     * Закрывает выпадающее меню при клике в любую область за пределами компонента.
     */
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
