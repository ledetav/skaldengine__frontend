import type { UserProfile } from '@/core/types/profile';
import type { Chat } from '@/core/types/chat';
import styles from '../Profile.module.css';

interface MainTabProps {
  user: UserProfile;
  lastChats: Chat[];
}

export default function MainTab({ user, lastChats }: MainTabProps) {
  const ChatIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );

  return (
    <div className={styles.aboutSection}>
      {/* Bio Section */}
      <div className={`${styles.card} angular-card`} style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <h3 className={styles.sectionTitle} style={{ marginTop: 0 }}>О себе</h3>
        <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
          {user.about || (lastChats.length > 0 ? 'Пользователь еще не заполнил информацию о себе.' : 'Этот пользователь предпочитает сохранять таинственность.')}
        </p>
      </div>

      {/* Statistics Section */}
      <h3 className={styles.sectionTitle}>Статистика</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className={`${styles.card} angular-card`} style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Чатов</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-purple)' }}>{user.statistics.total_chats}</div>
        </div>
        <div className={`${styles.card} angular-card`} style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Персон</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-fuchsia)' }}>{user.statistics.total_personas}</div>
        </div>
        <div className={`${styles.card} angular-card`} style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Лорбуков</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-purple)' }}>{user.statistics.total_lorebooks}</div>
        </div>
        <div className={`${styles.card} angular-card`} style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Сообщений</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-fuchsia)' }}>{user.statistics.total_messages}</div>
        </div>
      </div>

      {lastChats.length > 0 && (
        <>
          <h3 className={styles.sectionTitle}>Последняя активность</h3>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {lastChats.map(chat => (
              <div key={chat.id} className={`${styles.card} ${styles.interactiveCard} angular-card`} style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative' }}>
                <div style={{ 
                  width: '42px', 
                  height: '42px', 
                  background: 'rgba(139, 92, 246, 0.1)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'var(--accent-purple)',
                  clipPath: 'var(--clip-cut-sm)',
                  border: '1px solid rgba(139, 92, 246, 0.2)'
                }}>
                  <ChatIcon />
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem', gap: '0.5rem' }}>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{chat.title || 'Безымянный чат'}</h4>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {chat.updated_at ? new Date(chat.updated_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }) : 'Недавно'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span>Режим: <strong style={{ color: 'var(--accent-fuchsia)' }}>{chat.mode === 'scenario' ? 'Сценарий' : 'Песочница'}</strong></span>
                    <span>Сообщений: <strong>{chat.checkpoints_count}</strong></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div style={{ marginTop: '2rem', display: 'grid', gap: '1rem' }}>
        <div className={`${styles.card} angular-card`} style={{ padding: '1.25rem', background: 'rgba(217, 70, 239, 0.03)', borderLeft: '3px solid var(--accent-fuchsia)' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--accent-fuchsia)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Участник с</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{new Date(user.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
        </div>
      </div>
    </div>
  );
}
