import React from 'react'
import { motion } from 'framer-motion'
import { AuthInput } from './AuthInput'
import styles from '../../../styles/screens/Auth/AuthScreen.module.css'

interface RegisterFormProps {
  formData: any
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSubmit: (e: React.FormEvent) => void
  isLoading: boolean
  isFormValid: boolean
  globalError: string | null
  getErrorText: (name: string) => string | null
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ 
  formData, onChange, onSubmit, isLoading, isFormValid, globalError, getErrorText 
}) => {
  return (
    <motion.div
      key="register-form"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className={styles.formTitle}>Регистрация</h2>
      <p className={styles.formSubtitle}>Присоединяйтесь к комьюнити!</p>
      <form className={styles.form} onSubmit={onSubmit}>
        {globalError && <div className={styles.globalError}>{globalError}</div>}
        
        <AuthInput 
          label="Логин"
          name="login"
          type="text"
          placeholder="skald_engine"
          value={formData.login}
          onChange={onChange}
          error={getErrorText('login')}
          required
        />

        <AuthInput 
          label="Email"
          name="email"
          type="email"
          placeholder="skaldengine@example.com"
          value={formData.email}
          onChange={onChange}
          error={getErrorText('email')}
          required
        />

        <AuthInput 
          label="Дата рождения"
          name="birthDate"
          type="date"
          value={formData.birthDate}
          onChange={onChange}
          error={getErrorText('birthDate')}
          required
        />

        <AuthInput 
          label="Пароль"
          name="password"
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={onChange}
          error={getErrorText('password')}
          required
        />

        <AuthInput 
          label="Повторите пароль"
          name="confirmPassword"
          type="password"
          placeholder="••••••••"
          value={formData.confirmPassword}
          onChange={onChange}
          error={getErrorText('confirmPassword')}
          required
        />

        <button type="submit" className={styles.submitBtn} disabled={!isFormValid || isLoading}>
          {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
        </button>
      </form>
    </motion.div>
  )
}
