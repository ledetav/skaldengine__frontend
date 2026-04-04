import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import styles from '../../styles/screens/Auth/AuthScreen.module.css'

export default function AuthScreen() {
  const location = useLocation()
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(location.pathname === '/login')

  useEffect(() => {
    setIsLogin(location.pathname === '/login')
  }, [location.pathname])

  const toggleAuth = () => {
    const newPath = isLogin ? '/register' : '/login'
    navigate(newPath)
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
                    <input type="text" className={styles.input} placeholder="ivan_skald" />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Пароль</label>
                    <input type="password" className={styles.input} placeholder="••••••••" />
                  </div>
                  <button type="submit" className={styles.submitBtn}>Войти</button>
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
                    <label className={styles.label}>Логин</label>
                    <input type="text" className={styles.input} placeholder="skald_engine" />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Email</label>
                    <input type="email" className={styles.input} placeholder="skaldengine@example.com" />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Пароль</label>
                    <input type="password" className={styles.input} placeholder="••••••••" />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Повторите пароль</label>
                    <input type="password" className={styles.input} placeholder="••••••••" />
                  </div>
                  <button type="submit" className={styles.submitBtn}>Зарегистрироваться</button>
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
