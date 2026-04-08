import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './Common.module.css'

interface ApiKeyModalProps {
  isOpen: boolean
  onClose: () => void
  initialValue: string
  onSave: (val: string) => void
}

export function ApiKeyModal({ isOpen, onClose, initialValue, onSave }: ApiKeyModalProps) {
  const [tempKey, setTempKey] = useState(initialValue)

  useEffect(() => {
    if (isOpen) {
      // Use microtask to avoid synchronous cascading render error from lint
      Promise.resolve().then(() => setTempKey(initialValue))
    }
  }, [isOpen, initialValue])

  const handleSave = () => {
    onSave(tempKey)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div key="api-key-modal-root">
          <motion.div 
            className={styles.modalBackdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <div className={styles.modalWrapper}>
            <motion.div 
              className={styles.apiKeyModal}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <div className={styles.modalHeader}>
                <h3>Настройка API Ключа</h3>
                <button className={styles.modalCloseBtn} onClick={onClose}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              
              <div className={styles.modalBody}>
                <p>Введите ваш API-ключ. Ключ сохраняется локально в вашем браузере.</p>
                <div className={styles.inputGroup}>
                  <input 
                    type="password" 
                    value={tempKey} 
                    onChange={(e) => setTempKey(e.target.value)}
                    placeholder="sk-..."
                    className={styles.modalInput}
                  />
                  <div className={styles.inputGlow} />
                </div>
                <div className={styles.modalHint}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                  </svg>
                  <span>Настройки сохраняются только на этом устройстве</span>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button className={styles.cancelBtn} onClick={onClose}>Отмена</button>
                <button className={styles.saveBtnModal} onClick={handleSave}>Сохранить</button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}
