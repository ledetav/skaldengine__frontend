import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styles from '@/theme/screens/Auth/AuthScreen.module.css'

interface AuthPanelProps {
  isLogin: boolean
  onToggle: () => void
}

export const AuthPanel: React.FC<AuthPanelProps> = ({ isLogin, onToggle }) => {
  const panelTitle = isLogin ? 'Нет аккаунта?' : 'Уже с нами?'
  const panelText = isLogin 
    ? 'Не беда! Нужно всего лишь заполнить небольшую регистрационную форму..' 
    : 'Тогда скорее жми кнопку ниже, чтобы продолжить..'
  const buttonText = isLogin ? 'Создать аккаунт' : 'Войти в аккаунт'

  return (
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
          <h2 className={styles.panelTitle}>{panelTitle}</h2>
          <p className={styles.panelText}>{panelText}</p>
          <button className={styles.toggleBtn} onClick={onToggle}>
            {buttonText}
          </button>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}
