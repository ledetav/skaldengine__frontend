import React from 'react'
import styles from '../Admin.module.css'
import type { UserPersona, User } from '../types'
import { Badge } from '@/components/ui'

interface PersonaProfileViewProps {
  personaId: string
  personas: UserPersona[]
  users: User[]
  onBack: () => void
}

export function PersonaProfileView({ 
  personaId, 
  personas, 
  users,
  onBack 
}: PersonaProfileViewProps) {
  const persona = personas.find(p => p.id === personaId)
  const owner = users.find(u => u.id === persona?.owner_id)
  
  if (!persona) {
    return (
      <div className={styles.characterProfileOverlay}>
        <div style={{ padding: '40px', color: '#fff' }}>
          <h2>Персона не найдена</h2>
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
          <span className={styles.mainSubtitle}>Панель управления персоной пользователя</span>
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900 }}>{persona.name}</h2>
        </div>
      </header>

      <div className={styles.characterProfileContent}>
        {/* LEFT: Sidebar style card */}
        <aside className={styles.sidebarWrapper}>
          <div className={styles.charSidebarCard}>
            <div className={styles.charCover} style={{ height: '120px', background: 'linear-gradient(135deg, var(--accent-teal), #0f766e)' }}>
              <div className={styles.charAvatarWrapper} style={{ bottom: '-30px' }}>
                <img 
                  src={persona.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${persona.name}`} 
                  className={styles.charAvatar} 
                  alt={persona.name} 
                />
              </div>
            </div>

            <div className={styles.charBasicInfo} style={{ marginTop: '40px' }}>
              <h1 className={styles.charProfileName}>{persona.name}</h1>
              <p className={styles.charProfileFandom} style={{ color: 'var(--accent-teal)' }}>
                Владелец: {owner ? `@${owner.username}` : persona.owner_id}
              </p>
              
              <div style={{ marginTop: '20px' }}>
                <p style={{ 
                  fontSize: '0.9rem', 
                  color: 'rgba(255,255,255,0.45)', 
                  lineHeight: '1.6',
                  margin: 0,
                  fontWeight: 500
                }}>
                  {persona.description || 'Описание персоны не заполнено.'}
                </p>
              </div>
            </div>

            <div className={styles.charStatsGrid}>
              <div className={styles.charStatBox}>
                <span className={styles.statLabel}>Чаты</span>
                <span className={styles.statValue}>{persona.chat_count}</span>
              </div>
              <div className={styles.charStatBox}>
                <span className={styles.statLabel}>Лоры</span>
                <span className={styles.statValue}>{persona.lorebook_count}</span>
              </div>
              <div className={styles.charStatBox} style={{ gridColumn: 'span 2' }}>
                <span className={styles.statLabel}>Дата создания</span>
                <span className={styles.statValue} style={{ fontSize: '0.8rem' }}>{new Date(persona.created_at).toLocaleDateString()}</span>
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
                Характеристики
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <span className={styles.dsLabel}>Пол</span>
                  <p className={styles.detailText}>{persona.gender || 'Не указан'}</p>
                </div>
                <div>
                  <span className={styles.dsLabel}>Возраст</span>
                  <p className={styles.detailText}>{persona.age || 'Не указан'}</p>
                </div>
              </div>
            </div>

            <div className={styles.detailGroup}>
              <div className={styles.detailTitle}>Внешность</div>
              <p className={styles.detailText}>{persona.appearance || 'Описание внешности не задано.'}</p>
            </div>

            <div className={styles.detailGroup}>
              <div className={styles.detailTitle}>Личность</div>
              <p className={styles.detailText}>{persona.personality || 'Описание личности не задано.'}</p>
            </div>

            {persona.facts && (
              <div className={styles.detailGroup}>
                <div className={styles.detailTitle}>Дополнительные факты</div>
                <p className={styles.detailText}>{persona.facts}</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
