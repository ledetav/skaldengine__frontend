import React from 'react'
import styles from '../../styles/screens/Dashboard/DashboardScreen.module.css'

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
