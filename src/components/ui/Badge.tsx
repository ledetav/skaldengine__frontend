/**
 * @fileoverview Бейдж (тег / метка) дизайн-системы с цветовыми вариантами.
 */

import React from 'react'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'purple' | 'orange' | 'fuchsia' | 'red' | 'blue' | 'teal' | 'green'
  children?: React.ReactNode
}

/**
 * Компонент бейджа/метки дизайн-системы с цветовыми вариантами.
 * 
 * @param props.variant - Цветовая палитра бейджа (purple, orange, red, green и др.)
 * @param props.children - Текстовое или иконочное содержимое
 */
export function Badge({ 
  children, 
  variant = 'purple', 
  className = '', 
  ...props 
}: BadgeProps) {
  const variantClass = variant ? `ds-badge--${variant}` : ''
  
  return (
    <span 
      className={`ds-badge ${variantClass} ${className}`.trim().replace(/\s+/g, ' ')} 
      {...props}
    >
      {children}
    </span>
  )
}
