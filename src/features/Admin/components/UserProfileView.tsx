import React from 'react'
import styles from '../Admin.module.css'
import type { User } from '../types'
import { Badge } from '@/components/ui'

interface UserProfileViewProps {
  userId: string
  users: User[]
  onBack: () => void
}

export function UserProfileView({ 
  userId, 
  users, 
  onBack 
}: UserProfileViewProps) {
  const user = users.find(u => u.id === userId)
  
  if (!user) {
    return (
      <div className={styles.characterProfileOverlay}>
        <div style={{ padding: '40px', color: '#fff' }}>
          <h2>Пользователь не найден</h2>
          <button onClick={onBack} className={styles.createBtn}>Назад</button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.characterProfileOverlay}>
      <header className={styles.backHeader}>
        <button className={styles.backBtn} onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
        </button>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span className={styles.mainSubtitle}>Панель управления пользователем</span>
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900 }}>{user.full_name || user.login || user.username}</h2>
        </div>
      </header>

      <div className={styles.characterProfileContent}>
        {/* LEFT: Sidebar style card */}
        <aside className={styles.sidebarWrapper}>
          <div className={styles.charSidebarCard}>
            <div className={styles.charCover}>
              <img 
                src={user.cover_url || 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1000'} 
                className={styles.charCoverImg} 
                alt="Cover" 
              />
              <div className={styles.charAvatarWrapper}>
                <img 
                  src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} 
                  className={styles.charAvatar} 
                  alt={user.username} 
                />
              </div>
            </div>

            <div className={styles.charBasicInfo}>
              <h1 className={styles.charProfileName}>{user.full_name || user.login}</h1>
              <p className={styles.charProfileFandom} style={{ color: 'var(--accent-blue)' }}>@{user.username}</p>
              
              <div style={{ marginTop: '20px' }}>
                <p style={{ 
                  fontSize: '0.9rem', 
                  color: 'rgba(255,255,255,0.45)', 
                  lineHeight: '1.6',
                  margin: 0,
                  fontWeight: 500
                }}>
                  {user.about || 'Информация о себе не заполнена.'}
                </p>
              </div>
            </div>

            <div className={styles.charStatsGrid}>
              <div className={styles.charStatBox}>
                <span className={styles.statLabel}>Роль</span>
                <Badge variant={user.role === 'admin' ? 'orange' : 'purple'}>{user.role}</Badge>
              </div>
              <div className={styles.charStatBox}>
                <span className={styles.statLabel}>Дата регистрации</span>
                <span className={styles.statValue} style={{ fontSize: '0.8rem' }}>{new Date(user.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* RIGHT: Detailed content */}
        <main className={styles.mainContentWrapper}>
          <div className={styles.detailsCard}>
            <div className={styles.detailGroup}>
              <div className={styles.detailTitle}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                Аккаунт
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <span className={styles.dsLabel}>Email</span>
                  <p className={styles.detailText}>{user.email}</p>
                </div>
                <div>
                  <span className={styles.dsLabel}>ID пользователя</span>
                  <code style={{ fontSize: '0.8rem', opacity: 0.5 }}>{user.id}</code>
                </div>
                <div>
                  <span className={styles.dsLabel}>Дата рождения</span>
                  <p className={styles.detailText}>{user.birth_date ? new Date(user.birth_date).toLocaleDateString() : 'Не указана'}</p>
                </div>
                <div>
                  <span className={styles.dsLabel}>Логин</span>
                  <p className={styles.detailText}>{user.login}</p>
                </div>
              </div>
            </div>

            <div className={styles.detailGroup}>
              <div className={styles.detailTitle}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1V11a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H11a2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V15z"/></svg>
                Действия администратора
              </div>
              <div className={styles.actionRow} style={{ justifyContent: 'flex-start', borderTop: 'none', paddingTop: 0 }}>
                <button className={styles.secondaryBtn}>Сбросить пароль</button>
                <button className={styles.secondaryBtn} style={{ color: 'var(--accent-orange)' }}>Изменить роль</button>
                <button className={styles.secondaryBtn} style={{ color: 'var(--accent-red)' }}>Заблокировать</button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
