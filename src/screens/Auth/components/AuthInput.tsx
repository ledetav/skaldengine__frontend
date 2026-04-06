import React from 'react'
import styles from '../../../styles/screens/Auth/AuthScreen.module.css'

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string | null
  required?: boolean
  className?: string
}

export const AuthInput: React.FC<AuthInputProps> = ({ 
  label, 
  error, 
  required, 
  className = '', 
  ...props 
}) => {
  return (
    <div className={styles.inputGroup}>
      <label className={`${styles.label} ${required ? styles.labelRequired : ''}`}>
        {label}
      </label>
      <input 
        {...props}
        className={`${styles.input} ${error ? styles.inputError : ''} ${className}`}
      />
      {error && <div className={styles.errorText}>{error}</div>}
    </div>
  )
}
