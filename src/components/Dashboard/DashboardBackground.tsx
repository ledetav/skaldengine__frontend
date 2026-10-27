/**
 * @fileoverview Декоративный неоновый фон витрины (Dashboard).
 * Рендерит сетку перспективы, градиентное затемнение и анимированные светящиеся сферы (orbs).
 */

import React from 'react'
import styles from '@/theme/screens/Dashboard/DashboardScreen.module.css'

/**
 * Фоновый декоративный слой экрана витрины персонажей.
 */
export const DashboardBackground: React.FC = () => {
  return (
    <div className={styles.bgContainer}>
      <div className={styles.bgGrid} />
      <div className={styles.bgOverlay} />
      <div className={`${styles.orb} ${styles.orbPurple}`} />
      <div className={`${styles.orb} ${styles.orbFuchsia}`} />
    </div>
  )
}
