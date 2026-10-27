/**
 * @fileoverview Базовый контейнер карточки дизайн-системы с вариантами формы и градиентного свечения.
 */

import React from 'react'
import styles from './Card.module.css'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'small' | 'angular'
  gradient?: boolean
}

/**
 * Универсальная карточка-контейнер с поддержкой скруглений, градиентной подсветки и размеров.
 * 
 * @param props.variant - Размер и геометрия карточки ('default', 'small', 'angular')
 * @param props.gradient - Флаг включения фонового неонового градиента
 */
export function Card({ 
  children, 
  className = '', 
  variant = 'default',
  gradient = false,
  ...props 
}: CardProps) {
  const cardClasses = [
    'ds-card',
    variant === 'small' ? 'ds-card-sm' : '',
    gradient ? styles.cardGradient : '',
    className
  ].filter(Boolean).join(' ')

  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  )
}
