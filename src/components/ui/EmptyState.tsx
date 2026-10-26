import React from 'react'
import styles from './EmptyState.module.css'

interface EmptyStateProps {
  title: string
  description?: string
  icon?: React.ReactNode
  action?: React.ReactNode
  fullHeight?: boolean
}

/**
 * Компонент-заглушка для пустого состояния списков, результатов поиска или корзины.
 * 
 * @param props.title - Заголовок пустого состояния
 * @param props.description - Поясняющий текст
 * @param props.icon - Графическая иконка или иллюстрация
 * @param props.action - Кнопка действия (например, "Создать" или "Сбросить фильтры")
 * @param props.fullHeight - Занимать ли всю высоту родительского контейнера
 */
export function EmptyState({ 
  title, 
  description, 
  icon, 
  action,
  fullHeight = false 
}: EmptyStateProps) {
  return (
    <div className={`${styles.container} ${fullHeight ? styles.fullHeight : ''}`}>
      {icon && <div className={styles.icon}>{icon}</div>}
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  )
}
