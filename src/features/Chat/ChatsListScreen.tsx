import { useNavigate } from 'react-router-dom'
import Navbar from '@/components/ui/Navbar'
import styles from './Chat.module.css'

export default function ChatsListScreen() {
  const navigate = useNavigate()
  
  return (
    <div className={styles.page}>
      <Navbar variant="dashboard" />
      
      <div className={styles.bgOrbs}>
        <div className={`${styles.orb} ${styles.orbPurple}`} />
        <div className={`${styles.orb} ${styles.orbBlue}`} />
      </div>

      <main className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>Мои чаты</h1>
          <p className={styles.subtitle}>Список ваших последних переписок</p>
        </div>

        <section className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <h3 className={styles.emptyTitle}>Чатов пока нет</h3>
          <p className={styles.emptyText}>Выберите персонажа на дашборде, чтобы начать общение</p>
          <button className={styles.primaryBtn} onClick={() => navigate('/dashboard')}>
            Перейти к персонажам
          </button>
        </section>
      </main>
    </div>
  )
}
