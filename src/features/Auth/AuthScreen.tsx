import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { authApi } from '@/core/api/auth'
import styles from '@/theme/screens/Auth/AuthScreen.module.css'

// Split components
import { LoginForm } from './components/LoginForm'
import { RegisterForm } from './components/RegisterForm'
import { AuthPanel } from './components/AuthPanel'

export default function AuthScreen() {
  const location = useLocation()
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(location.pathname.startsWith('/login'))

  // Form State
  const [formData, setFormData] = useState({
    login: '', 
    email: '',
    password: '',
    confirmPassword: '',
    birthDate: '',
    fullName: '',
    handle: '',
  })

  // Errors State
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)

  useEffect(() => {
    setIsLogin(location.pathname.startsWith('/login'))
    setErrors({})
    setGlobalError(null)
  }, [location.pathname])

  const toggleAuth = () => {
    navigate(isLogin ? '/register' : '/login')
  }

  // Validation Logic
  const validateField = (name: string, value: string) => {
    const fieldErrors: string[] = []

    if (isLogin) {
      if (name === 'login' && !value) fieldErrors.push('Обязательное поле')
      if (name === 'password' && !value) fieldErrors.push('Обязательное поле')
    } else {
      if (name === 'login') {
        if (!value) fieldErrors.push('Обязательное поле')
        else {
          if (value.trim() !== value) fieldErrors.push('Не должно быть пробелов в начале/конце')
          if (!/^[a-zA-Z0-9_-]+$/.test(value)) fieldErrors.push('Только буквы, цифры, "-" и "_"')
        }
      }
      if (name === 'email') {
        if (!value) fieldErrors.push('Обязательное поле')
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) fieldErrors.push('Некорректный формат email')
      }
      if (name === 'handle') {
        if (!value) fieldErrors.push('Обязательное поле')
        else if (value.trim() !== value) fieldErrors.push('Не должно быть пробелов')
        else if (!/^[a-zA-Z0-9_-]+$/.test(value)) fieldErrors.push('Только латиница, цифры, "-" и "_"')
      }
      if (name === 'fullName') {
        // Optional field
      }
      if (name === 'password') {
        if (!value) fieldErrors.push('Обязательное поле')
        else {
          if (value.length < 8) fieldErrors.push('Минимум 8 символов')
          if (!/\d/.test(value)) fieldErrors.push('Нет цифр')
          if (!/[A-Z]/.test(value)) fieldErrors.push('Нет заглавных букв')
          if (!/[^a-zA-Z0-9]/.test(value)) fieldErrors.push('Нужен спец. символ')
        }
      }
      if (name === 'confirmPassword') {
        if (!value) fieldErrors.push('Обязательное поле')
        else if (value !== formData.password) fieldErrors.push('Пароли не совпадают')
      }
      if (name === 'birthDate') {
        if (!value) fieldErrors.push('Укажите дату рождения')
        else if (!/^\d{2}\.\d{2}\.\d{4}$/.test(value)) fieldErrors.push('Формат: ДД.ММ.ГГГГ')
        else {
          const [d, m, y] = value.split('.').map(Number)
          const date = new Date(y, m - 1, d)
          const now = new Date()
          if (isNaN(date.getTime())) fieldErrors.push('Неверная дата')
          else if (date > now) fieldErrors.push('Дата в будущем?')
          else if (y < 1900) fieldErrors.push('Слишком старая дата')
          else if (m < 1 || m > 12) fieldErrors.push('Неверный месяц')
          else if (d < 1 || d > 31) fieldErrors.push('Неверный день')
        }
      }
    }

    setErrors(prev => ({ ...prev, [name]: fieldErrors }))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target
    
    if (name === 'birthDate') {
      // Input mask: dd.mm.yyyy
      const digits = value.replace(/\D/g, '')
      let formatted = ''
      if (digits.length > 0) {
        formatted += digits.substring(0, 2)
        if (digits.length > 2) {
          formatted += '.' + digits.substring(2, 4)
          if (digits.length > 4) {
            formatted += '.' + digits.substring(4, 8)
          }
        }
      }
      value = formatted
    }

    setFormData(prev => ({ ...prev, [name]: value }))
    validateField(name, value)
    setGlobalError(null)

    if (name === 'password' && !isLogin && formData.confirmPassword) {
      setTimeout(() => validateField('confirmPassword', formData.confirmPassword), 0)
    }
  }

  const getErrorText = (name: string) => {
    const fieldErrors = errors[name]
    return fieldErrors && fieldErrors.length > 0 ? fieldErrors.join(', ') : null
  }

  const isFormValid = () => {
    if (isLogin) {
      return !!(formData.login && formData.password && !errors.login?.length && !errors.password?.length)
    }
    return !!(
      formData.login && formData.email && formData.password && formData.confirmPassword && formData.birthDate && formData.handle &&
      Object.values(errors).every(errs => errs.length === 0)
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid() || isLoading) return

    setIsLoading(true)
    setGlobalError(null)

    try {
      if (isLogin) {
        const result = await authApi.login(formData) as { access_token: string }
        localStorage.setItem('token', result.access_token)
        window.dispatchEvent(new Event('auth-change'))
        navigate('/dashboard')
      } else {
        // Convert dd.mm.yyyy to yyyy-mm-dd for the API
        const [d, m, y] = formData.birthDate.split('.')
        const isoDate = `${y}-${m}-${d}`
        
        await authApi.register({ ...formData, birthDate: isoDate })
        const loginResult = await authApi.login(formData) as { access_token: string }
        localStorage.setItem('token', loginResult.access_token)
        window.dispatchEvent(new Event('auth-change'))
        navigate('/dashboard')
      }
    } catch (err: unknown) {
      setGlobalError(err instanceof Error ? err.message : 'Произошла ошибка')
    } finally {
      setIsLoading(false)
    }
  }

  const commonProps = {
    formData,
    onChange: handleChange,
    onSubmit: handleSubmit,
    isLoading,
    isFormValid: !!isFormValid(),
    globalError,
    getErrorText
  }

  return (
    <div className={styles.authScreen}>
      <Link to="/" className={styles.backBtn} title="Вернуться на главную">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
        </svg>
      </Link>

      <motion.div 
        layout 
        className={`${styles.authContainer} ${!isLogin ? styles.reverse : ''}`}
        transition={{ layout: { type: 'spring', stiffness: 200, damping: 25 }, opacity: { duration: 0.3 } }}
      >
        {/* Forms Side */}
        <motion.div layout className={`${styles.side} ${styles.formSide}`}>
          <AnimatePresence mode="wait">
            {isLogin ? (
              <LoginForm {...commonProps} />
            ) : (
              <RegisterForm {...commonProps} />
            )}
          </AnimatePresence>
        </motion.div>

        {/* Panel Side */}
        <AuthPanel isLogin={isLogin} onToggle={toggleAuth} />
      </motion.div>
    </div>
  )
}
