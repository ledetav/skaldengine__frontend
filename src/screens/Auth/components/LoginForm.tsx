import React from 'react'
import { motion } from 'framer-motion'
import { AuthInput } from './AuthInput'
import styles from '../../../styles/screens/Auth/AuthScreen.module.css'

interface LoginFormProps {
  formData: any
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSubmit: (e: React.FormEvent) => void
  isLoading: boolean
  isFormValid: boolean
  globalError: string | null
  getErrorText: (name: string) => string | null
}

export const LoginForm: React.FC<LoginFormProps> = ({ 
  formData, onChange, onSubmit, isLoading, isFormValid, globalError, getErrorText 
}) => {
  return (
    <motion.div
      key="login-form"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className={styles.formTitle}>Вход</h2>
      <p className={styles.formSubtitle}>С возвращением!</p>
      <form className={styles.form} onSubmit={onSubmit}>
        {globalError && <div className={styles.globalError}>{globalError}</div>}
        
        <AuthInput 
          label="Логин или Email"
          name="login"
          type="text"
          placeholder="ivan_skald"
          value={formData.login}
          onChange={onChange}
          error={getErrorText('login')}
        />

        <AuthInput 
          label="Пароль"
          name="password"
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={onChange}
          error={getErrorText('password')}
        />

        <button type="submit" className={styles.submitBtn} disabled={!isFormValid || isLoading}>
          {isLoading ? 'Вход...' : 'Войти'}
        </button>
      </form>
    </motion.div>
  )
}
