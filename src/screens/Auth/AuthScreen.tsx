import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import styles from '../../styles/screens/Auth/AuthScreen.module.css'

export default function AuthScreen() {
  const location = useLocation()
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(location.pathname === '/login')

  // Form State
  const [formData, setFormData] = useState({
    login: '', // Used for both login field and registration username
    email: '',
    password: '',
    confirmPassword: '',
    birthDate: '',
  })

  // Errors State: mapping field names to an array of error messages
  const [errors, setErrors] = useState<Record<string, string[]>>({})

  useEffect(() => {
    setIsLogin(location.pathname === '/login')
    // Clear errors when switching
    setErrors({})
  }, [location.pathname])

  const toggleAuth = () => {
    const newPath = isLogin ? '/register' : '/login'
    navigate(newPath)
  }

  // Validation Logic
  const validateField = (name: string, value: string) => {
    const fieldErrors: string[] = []

    if (isLogin) {
      if (name === 'login' && !value) fieldErrors.push('Обязательное поле')
      if (name === 'password' && !value) fieldErrors.push('Обязательное поле')
    } else {
      // Registration specific rules
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

      if (name === 'birthDate' && !value) {
        fieldErrors.push('Укажите дату рождения')
      }
    }

    setErrors(prev => ({
      ...prev,
      [name]: fieldErrors
    }))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    validateField(name, value)

    // Re-validate confirm password if password changes
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
      return formData.login && formData.password && !errors.login?.length && !errors.password?.length
    }
    return (
      formData.login && formData.email && formData.password && formData.confirmPassword && formData.birthDate &&
      Object.values(errors).every(errs => errs.length === 0)
    )
  }

  return (
    <div className={styles.authScreen}>
      <Link to="/" className={styles.backBtn} title="Вернуться на главную">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
      </Link>

      <motion.div 
        layout 
        className={`${styles.authContainer} ${!isLogin ? styles.reverse : ''}`}
        transition={{ 
          layout: { type: 'spring', stiffness: 200, damping: 25 },
          opacity: { duration: 0.3 }
        }}
      >
        {/* Form Side */}
        <motion.div layout className={`${styles.side} ${styles.formSide}`}>
          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.div
                key="login-form"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className={styles.formTitle}>Вход</h2>
                <p className={styles.formSubtitle}>С возвращением!</p>
                <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Логин или Email</label>
                    <input 
                      name="login"
                      type="text" 
                      className={`${styles.input} ${getErrorText('login') ? styles.inputError : ''}`}
                      placeholder="ivan_skald" 
                      value={formData.login}
                      onChange={handleChange}
                    />
                    {getErrorText('login') && <div className={styles.errorText}>{getErrorText('login')}</div>}
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Пароль</label>
                    <input 
                      name="password"
                      type="password" 
                      className={`${styles.input} ${getErrorText('password') ? styles.inputError : ''}`}
                      placeholder="••••••••" 
                      value={formData.password}
                      onChange={handleChange}
                    />
                    {getErrorText('password') && <div className={styles.errorText}>{getErrorText('password')}</div>}
                  </div>
                  <button type="submit" className={styles.submitBtn} disabled={!isFormValid()}>Войти</button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="register-form"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className={styles.formTitle}>Регистрация</h2>
                <p className={styles.formSubtitle}>Присоединяйтесь к комьюнити!</p>
                <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
                  <div className={styles.inputGroup}>
                    <label className={`${styles.label} ${styles.labelRequired}`}>Логин</label>
                    <input 
                      name="login"
                      type="text" 
                      className={`${styles.input} ${getErrorText('login') ? styles.inputError : ''}`}
                      placeholder="skald_engine" 
                      value={formData.login}
                      onChange={handleChange}
                    />
                    {getErrorText('login') && <div className={styles.errorText}>{getErrorText('login')}</div>}
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={`${styles.label} ${styles.labelRequired}`}>Email</label>
                    <input 
                      name="email"
                      type="email" 
                      className={`${styles.input} ${getErrorText('email') ? styles.inputError : ''}`}
                      placeholder="skaldengine@example.com" 
                      value={formData.email}
                      onChange={handleChange}
                    />
                    {getErrorText('email') && <div className={styles.errorText}>{getErrorText('email')}</div>}
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={`${styles.label} ${styles.labelRequired}`}>Дата рождения</label>
                    <input 
                      name="birthDate"
                      type="date" 
                      className={`${styles.input} ${getErrorText('birthDate') ? styles.inputError : ''}`}
                      placeholder="2000-01-01" 
                      value={formData.birthDate}
                      onChange={handleChange}
                    />
                    {getErrorText('birthDate') && <div className={styles.errorText}>{getErrorText('birthDate')}</div>}
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={`${styles.label} ${styles.labelRequired}`}>Пароль</label>
                    <input 
                      name="password"
                      type="password" 
                      className={`${styles.input} ${getErrorText('password') ? styles.inputError : ''}`}
                      placeholder="••••••••" 
                      value={formData.password}
                      onChange={handleChange}
                    />
                    {getErrorText('password') && <div className={styles.errorText}>{getErrorText('password')}</div>}
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={`${styles.label} ${styles.labelRequired}`}>Повторите пароль</label>
                    <input 
                      name="confirmPassword"
                      type="password" 
                      className={`${styles.input} ${getErrorText('confirmPassword') ? styles.inputError : ''}`}
                      placeholder="••••••••" 
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                    {getErrorText('confirmPassword') && <div className={styles.errorText}>{getErrorText('confirmPassword')}</div>}
                  </div>
                  <button type="submit" className={styles.submitBtn} disabled={!isFormValid()}>Зарегистрироваться</button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Panel Side */}
        <motion.div layout className={`${styles.side} ${styles.sidePanel}`}>
          <div className={styles.orb + ' ' + styles.orb1} />
          <div className={styles.orb + ' ' + styles.orb2} />
          
          <AnimatePresence mode="wait">
            <motion.div 
              key={isLogin ? 'login-panel' : 'reg-panel'}
              initial={{ opacity: 0, x: isLogin ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isLogin ? -20 : 20 }}
              transition={{ duration: 0.3 }}
              className={styles.panelContent}
            >
              <h2 className={styles.panelTitle}>
                {isLogin ? 'Нет аккаунта?' : 'Уже с нами?'}
              </h2>
              <p className={styles.panelText}>
                {isLogin 
                  ? 'Не беда! Нужно всего лишь заполнить небольшую регистрационную форму..' 
                  : 'Тогда скорее жми кнопку ниже, чтобы продолжить..'}
              </p>
              <button className={styles.toggleBtn} onClick={toggleAuth}>
                {isLogin ? 'Создать аккаунт' : 'Войти в аккаунт'}
              </button>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  )
}
