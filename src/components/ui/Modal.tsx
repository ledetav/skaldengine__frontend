/**
 * @fileoverview Базовый компонент модального окна дизайн-системы.
 * Рендерится через React Portal, блокирует прокрутку body и закрывается по клику на оверлей или крестик.
 */

import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import styles from './Modal.module.css'
import { Card } from './Card'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'small' | 'medium' | 'large'
}

/**
 * Базовое модальное окно с блокировкой прокрутки страницы и рендерингом через React Portal.
 * 
 * @param props.isOpen - Флаг видимости модального окна
 * @param props.onClose - Коллбэк закрытия окна при клике на оверлей или крестик
 * @param props.title - Опциональный заголовок в шапке модального окна
 * @param props.children - Содержимое тела модального окна
 * @param props.size - Размер окна ('small', 'medium', 'large')
 */
export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'medium' 
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <Card 
        className={`${styles.modal} ${styles[`modal--${size}`]}`} 
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <header className={styles.header}>
            <h2 className={styles.title}>{title}</h2>
            <button className={styles.closeBtn} onClick={onClose}>✕</button>
          </header>
        )}
        <div className={styles.content}>
          {children}
        </div>
      </Card>
    </div>,
    document.body
  )
}
