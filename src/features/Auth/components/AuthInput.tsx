/**
 * @fileoverview Стилизованное поле ввода для форм аутентификации.
 * Поддерживает лейбл, описание, индикацию обязательности поля и текст ошибки валидации.
 */

import React from 'react'
import styles from '@/theme/screens/Auth/AuthScreen.module.css'

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  description?: string
  error?: string | null
  required?: boolean
  className?: string
}

/**
 * Поле ввода учетных данных с лейблом и сообщением об ошибке.
 */
export const AuthInput: React.FC<AuthInputProps> = ({ 
  label, 
  description,
  error, 
  required, 
  className = '', 
  ...props 
}) => {
  return (
    <div className={styles.inputGroup}>
      <div className={styles.labelWrapper}>
        <label className={`${styles.label} ${required ? styles.labelRequired : ''}`}>
          {label}
        </label>
        {description && <span className={styles.labelDescription}>{description}</span>}
      </div>
      <input 
        {...props}
        className={`${styles.input} ${error ? styles.inputError : ''} ${className}`}
      />
      {error && <div className={styles.errorText}>{error}</div>}
    </div>
  )
}
