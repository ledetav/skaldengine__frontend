import { useState } from 'react'
import styles from '../styles'
import type { User } from '../types'
import { Button } from '@/components/ui'

interface UserProfileViewProps {
  userId: string
  users: User[]
  currentUser: User
  onBack: () => void
  onDelete: (id: string) => void
  onChangeRole: (id: string, role: string) => void
}

export function UserProfileView({ 
  userId, 
  users, 
  currentUser,
  onBack,
  onDelete,
  onChangeRole
}: UserProfileViewProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [selectedRole, setSelectedRole] = useState('')
  const [errorVisible, setErrorVisible] = useState(false)
  const [roleErrorVisible, setRoleErrorVisible] = useState(false)

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

  const handleDeleteClick = () => {
    if (user.id === currentUser.id) {
      setErrorVisible(true)
      setTimeout(() => setErrorVisible(false), 3000)
      return
    }
    setShowDeleteModal(true)
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
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900 }}>{user.full_name || user.username}</h2>
        </div>
      </header>

      <div className={styles.characterProfileContent}>
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
              <h1 className={styles.charProfileName}>{user.full_name || user.username}</h1>
              <p className={styles.charProfileFandom} style={{ color: 'var(--accent-pink)' }}>@{user.username}</p>
              
              <div style={{ marginTop: '20px' }}>
                <p style={{ 
                  fontSize: '0.9rem', 
                  color: 'rgba(255,255,255,0.45)', 
                  lineHeight: '1.6',
                  margin: 0,
                  fontWeight: 500
                }}>
                  {user.about || 'Пользователь еще не заполнил информацию о себе.'}
                </p>
              </div>
            </div>

            <div className={styles.charStatsGrid}>
              <div className={styles.charStatBox}>
                <span className={styles.statLabel}>Роль</span>
                <span className={styles.statValue} style={{ 
                  color: user.role === 'admin' ? 'var(--accent-orange)' : 
                         user.role === 'moderator' ? 'var(--accent-purple)' : 
                         'var(--accent-pink)', 
                  fontSize: '0.9rem' 
                }}>
                  {user.role.toUpperCase()}
                </span>
              </div>
              <div className={styles.charStatBox}>
                <span className={styles.statLabel}>Регистрация</span>
                <span className={styles.statValue} style={{ fontSize: '0.8rem' }}>{new Date(user.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </aside>

        <main className={styles.mainContentWrapper}>
          <div className={styles.detailsCard}>
            <div className={styles.detailGroup}>
              <div className={styles.detailTitle}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                О пользователе
              </div>
              <p className={styles.detailText} style={{ lineHeight: '1.8', opacity: 0.8 }}>
                {user.about || 'Информация о себе отсутствует.'}
              </p>
            </div>

            <div className={styles.detailGroup}>
              <div className={styles.detailTitle}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                Личные данные
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <span className={styles.dsLabel}>Дата рождения</span>
                  <p className={styles.detailText}>{user.birth_date ? new Date(user.birth_date).toLocaleDateString() : 'Не указана'}</p>
                </div>
                <div>
                  <span className={styles.dsLabel}>ID пользователя</span>
                  <code style={{ fontSize: '0.8rem', opacity: 0.5, display: 'block', marginTop: '4px' }}>{user.id}</code>
                </div>
              </div>
            </div>

            <div className={styles.detailGroup}>
              <div className={styles.detailTitle}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1V11a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H11a2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V15z"/></svg>
                Управление аккаунтом
              </div>
              <div className={styles.actionRow} style={{ justifyContent: 'flex-start', borderTop: 'none', paddingTop: 0, gap: '16px' }}>
                <div style={{ position: 'relative' }}>
                  <Button variant="ghost" onClick={() => { 
                    if (user.id === currentUser.id) {
                      setRoleErrorVisible(true)
                      setTimeout(() => setRoleErrorVisible(false), 3000)
                      return
                    }
                    setSelectedRole(user.role); 
                    setShowRoleModal(true); 
                  }}>Изменить роль</Button>
                  {roleErrorVisible && (
                    <div style={{
                      position: 'absolute',
                      top: '-40px',
                      left: '0',
                      background: 'var(--accent-red)',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      whiteSpace: 'nowrap',
                      zIndex: 10
                    }}>
                      Вы не можете изменить свою роль!
                    </div>
                  )}
                </div>
                <div style={{ position: 'relative' }}>
                  <Button variant="danger" onClick={handleDeleteClick}>Удалить пользователя</Button>
                  {errorVisible && (
                    <div style={{
                      position: 'absolute',
                      top: '-40px',
                      left: '0',
                      background: 'var(--accent-red)',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      whiteSpace: 'nowrap',
                      zIndex: 10
                    }}>
                      Вы не можете удалить самого себя!
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {showDeleteModal && (
        <div className={styles.modalOverlay} onClick={() => setShowDeleteModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Удалить пользователя?</h3>
            <p className={styles.modalDescription}>
              Это действие необратимо. Пользователь <strong>{user.username}</strong> будет полностью удален из системы вместе со всеми данными.
            </p>
            <div className={styles.modalActions}>
              <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>Отмена</Button>
              <Button variant="danger" onClick={() => {
                onDelete(user.id)
                setShowDeleteModal(false)
              }}>Да, удалить</Button>
            </div>
          </div>
        </div>
      )}

      {showRoleModal && (
        <div className={styles.modalOverlay} onClick={() => setShowRoleModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Изменение роли</h3>
            <p className={styles.modalDescription}>Выберите новую роль для пользователя <strong>{user.username}</strong>:</p>
            
            <div className={styles.roleBtnGroup}>
              {['user', 'moderator', 'admin'].map(role => (
                <button 
                  key={role}
                  className={`${styles.roleBtn} ${selectedRole === role ? styles.roleBtnActive : ''}`}
                  onClick={() => setSelectedRole(role)}
                >
                  {role}
                </button>
              ))}
            </div>

            <div className={styles.modalActions}>
              <Button variant="ghost" onClick={() => setShowRoleModal(false)}>Отмена</Button>
              <Button variant="orange" onClick={() => {
                onChangeRole(user.id, selectedRole)
                setShowRoleModal(false)
              }}>Сохранить</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
