import React from 'react'
import styles from './Card.module.css'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'small' | 'angular'
  gradient?: boolean
}

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
