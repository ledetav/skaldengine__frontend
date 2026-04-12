import type { UserProfile } from '@/core/types/profile';
import styles from './Profile.module.css';

interface ProfileHeaderProps {
  user: UserProfile;
  isPublic?: boolean;
}

export default function ProfileHeader({ user, isPublic = false }: ProfileHeaderProps) {
  const EditIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
  );

  const getRoleLabel = (role: string) => {
    switch(role) {
      case 'admin': return 'Администратор';
      case 'moderator': return 'Модератор';
      default: return 'Путешественник';
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.cover}>
        {user.cover_url ? (
          <img src={user.cover_url} alt="Cover" className={styles.coverImg} />
        ) : (
          <div className={styles.coverImg} style={{ background: 'var(--bg-secondary)' }} />
        )}
        <div className={styles.coverBottomGradient} />
        {!isPublic && (
          <div className={styles.coverOverlay} title="Изменить обложку">
            <EditIcon />
          </div>
        )}
      </div>

      <div className={styles.userInfo}>
        <div className={styles.avatarWrapper}>
          {user.avatar_url ? (
            <img src={user.avatar_url} alt={user.username} className={styles.avatar} />
          ) : (
            <div className={styles.avatar} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 900 }}>
              {user.username.charAt(1).toUpperCase()}
            </div>
          )}
          {!isPublic && (
            <div className={styles.avatarOverlay} title="Изменить аватар">
              <EditIcon />
            </div>
          )}
        </div>
        
        <h1 className={`${styles.displayName} gradient-text`}>{user.full_name || user.login}</h1>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <div className={styles.username}>@{user.username}</div>
          <div style={{ 
            fontSize: '0.65rem', 
            background: 'rgba(139, 92, 246, 0.1)', 
            color: 'var(--accent-purple)', 
            padding: '2px 8px', 
            borderRadius: '10px', 
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            border: '1px solid rgba(139, 92, 246, 0.2)'
          }}>
            {getRoleLabel(user.role)}
          </div>
        </div>

        <div className={styles.sidebarStats}>
          <div className={styles.sidebarStatItem}>
            <span className={styles.sidebarStatLabel} style={{ fontSize: '0.6rem' }}>Чатов</span>
            <span className={styles.sidebarStatValue}>{user.statistics.total_chats}</span>
          </div>
          <div className={styles.sidebarStatItem}>
            <span className={styles.sidebarStatLabel} style={{ fontSize: '0.6rem' }}>Персон</span>
            <span className={styles.sidebarStatValue}>{user.statistics.total_personas}</span>
          </div>
          <div className={styles.sidebarStatItem}>
            <span className={styles.sidebarStatLabel} style={{ fontSize: '0.6rem' }}>Лорбуков</span>
            <span className={styles.sidebarStatValue}>{user.statistics.total_lorebooks}</span>
          </div>
          <div className={styles.sidebarStatItem}>
            <span className={styles.sidebarStatLabel} style={{ fontSize: '0.6rem' }}>Сообщений</span>
            <span className={styles.sidebarStatValue}>{user.statistics.total_messages}</span>
          </div>
        </div>

        <div style={{ width: '100%', marginTop: '1.5rem', textAlign: 'left' }}>
          <h3 className={styles.sectionTitle}>Кратко</h3>
          <p style={{ 
            fontSize: '0.85rem', 
            lineHeight: '1.5', 
            color: 'var(--text-secondary)',
            margin: 0
          }}>
            {user.about || (user.full_name ? `${user.full_name} — активный участник SkaldEngine. Мастер историй.` : 'Путешественник, еще не поведавший миру о себе.')}
          </p>
        </div>
      </div>
    </header>
  );
}
