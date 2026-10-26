import React from 'react'
import { Button } from '@/components/ui'
import styles from './ConfirmModal.module.css'

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  description?: React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  danger?: boolean
}

/**
 * Модальное окно подтверждения необратимых или опасных действий (удаление, сброс).
 * 
 * @param props.isOpen - Флаг видимости модального окна
 * @param props.title - Заголовок действия
 * @param props.description - Поясняющий текст или предупреждение
 * @param props.confirmLabel - Текст на кнопке подтверждения (по умолчанию 'Подтвердить')
 * @param props.cancelLabel - Текст на кнопке отмены (по умолчанию 'Отмена')
 * @param props.onConfirm - Коллбэк при подтверждении
 * @param props.onCancel - Коллбэк при отмене или закрытии окна
 * @param props.danger - Флаг стилизации подтверждающей кнопки в красный цвет (опасное действие)
 */
export function ConfirmModal({
  isOpen,
  title,
  description,
  confirmLabel = 'Подтвердить',
  cancelLabel = 'Отмена',
  onConfirm,
  onCancel,
  danger = true,
}: ConfirmModalProps) {
  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.content} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <h3 className={styles.title}>{title}</h3>
        {description && (
          <p className={styles.description}>{description}</p>
        )}
        <div className={styles.actions}>
          <Button variant="ghost" onClick={onCancel}>{cancelLabel}</Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  )
}
