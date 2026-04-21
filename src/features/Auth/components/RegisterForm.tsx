import React from 'react'
import { motion } from 'framer-motion'
import { AuthInput } from './AuthInput'
import styles from '@/theme/screens/Auth/AuthScreen.module.css'

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

        <div className={styles.requiredInfo}>
          <span className={styles.bulletMini}>•</span> — обязательное поле
        </div>
        
        <div className={styles.formRow}>
          <AuthInput 
            label="Твое имя"
            description="Будет отображаться на твоей странице. Например, Скальдик."
            name="fullName"
            type="text"
            placeholder="Иван Иванов"
            value={formData.fullName}
            onChange={onChange}
            error={getErrorText('fullName')}
          />

          <AuthInput 
            label="Юзернейм"
            description="По нему тебя смогут найти другие пользователи."
            name="handle"
            type="text"
            placeholder="handle"
            value={formData.handle}
            onChange={onChange}
            error={getErrorText('handle')}
            required
          />
        </div>

        <AuthInput 
          label="Дата рождения"
          description="Дата твоего рождения. Нужна по закону, нам не особо интересно."
          name="birthDate"
          type="date"
          value={formData.birthDate}
          onChange={onChange}
          error={getErrorText('birthDate')}
          required
        />

        <div className={styles.formRow}>
          <AuthInput 
            label="Логин"
            description="По нему ты сможешь войти, он никому не виден."
            name="login"
            type="text"
            placeholder="skald_engine"
            value={formData.login}
            onChange={onChange}
            error={getErrorText('login')}
            required
          />

          <AuthInput 
            label="Почта"
            description="По ней тоже можно войти, а ещё восстановить пароль."
            name="email"
            type="email"
            placeholder="skaldengine@example.com"
            value={formData.email}
            onChange={onChange}
            error={getErrorText('email')}
            required
          />
        </div>

        <div className={styles.formRow}>
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
        </div>

        <button type="submit" className={styles.submitBtn} disabled={!isFormValid || isLoading}>
          {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
        </button>
      </form>
    </motion.div>
  )
}
