import React from 'react'
import styles from './Button.module.css'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger' | 'orange'
  loading?: boolean
  icon?: React.ReactNode
  children?: React.ReactNode
  className?: string
}

export function Button({
  children,
  className = '',
  variant = 'primary',
  loading = false,
  disabled,
  icon,
  ...props
}: ButtonProps) {
  const getVariantClass = () => {
    switch (variant) {
      case 'primary': return 'ds-btn--primary'
      case 'ghost': return 'ds-btn--ghost'
      case 'danger': return 'ds-btn--danger'
      case 'orange': return 'ds-btn--orange'
      default: return 'ds-btn--primary'
    }
  }

  return (
    <button
      className={`${getVariantClass()} ${className} ${loading ? styles.isLoading : ''}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className={styles.spinner} />}
      {!loading && icon && <span className={styles.icon}>{icon}</span>}
      <span className={styles.label}>{children}</span>
    </button>
  )
}
