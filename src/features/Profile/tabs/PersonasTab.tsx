import type { ProfilePersona } from '@/core/types/profile';
import styles from '../Profile.module.css';

interface PersonasTabProps {
  personas: ProfilePersona[];
}

export default function PersonasTab({ personas }: PersonasTabProps) {
  const EditIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
  );

  const DeleteIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );

  return (
    <div className={styles.grid}>
      <button className={`${styles.card} ${styles.interactiveCard} ${styles.addCard} angular-card`}>
        <div className={styles.addIcon}>+</div>
        <div style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.85rem' }}>Добавить персону</div>
      </button>

      {personas.map((persona) => {
        const isLongName = persona.name.length > 15 && !persona.name.includes(' ');
        return (
          <div key={persona.id} className={`${styles.card} ${styles.interactiveCard} angular-card`} style={{ padding: '1rem' }}>
            <div className={styles.cardShade} />
            <div className={styles.cardOverlay}>
              <div className={styles.cardActions}>
                <button className={`${styles.actionBtn} ${styles.editBtn}`} title="Редактировать"><EditIcon /></button>
                <button className={`${styles.actionBtn} ${styles.deleteBtn}`} title="Удалить"><DeleteIcon /></button>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '0.85rem', marginBottom: '1rem' }}>
              <img 
                src={persona.avatar_url || 'https://via.placeholder.com/60'} 
                alt={persona.name} 
                className="angular-card"
                style={{ width: '56px', height: '56px', objectFit: 'cover', border: '1px solid var(--border-glass)', flexShrink: 0 }} 
              />
              <div style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <h3 style={{ 
                  margin: 0, 
                  fontSize: isLongName ? '0.9rem' : '1.05rem', 
                  fontWeight: 800,
                  lineHeight: 1.2,
                  color: '#fff',
                  wordBreak: persona.name.includes(' ') ? 'normal' : 'break-all',
                  overflowWrap: 'break-word',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {persona.name}
                </h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-fuchsia)', fontWeight: 600, marginTop: '0.25rem' }}>
                  {persona.gender || '—'}, {persona.age || '—'} лет
                </div>
              </div>
            </div>
            
            <p style={{ 
              fontSize: '0.8rem', 
              color: 'var(--text-secondary)',
              marginBottom: '1rem', 
              display: '-webkit-box', 
              WebkitLineClamp: 3, 
              WebkitBoxOrient: 'vertical', 
              overflow: 'hidden',
              height: '3.6em',
              lineHeight: '1.2'
            }}>
              {persona.description || 'Нет описания.'}
            </p>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-glass)', paddingTop: '0.75rem' }}>
              <span>Лорбуков: <strong style={{ color: 'var(--text-secondary)' }}>{persona.lorebook_count}</strong></span>
              <span>Чатов: <strong style={{ color: 'var(--text-secondary)' }}>{persona.chat_count}</strong></span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
