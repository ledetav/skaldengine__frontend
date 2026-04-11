import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Personas.module.css'
import { mockPersonas, mockPersonaStats } from './personaMockData'
import type { UserPersona } from '@/core/types/chat'
import { useToast } from '@/components/ui'

/* ─── Debug banner ─────────────────────────────── */
function DebugBanner() {
  return (
    <div style={{
      background: 'rgba(139,92,246,0.12)',
      border: '1px solid var(--border-purple)',
      padding: '8px 16px',
      fontSize: '0.72rem',
      fontWeight: 700,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: 'var(--accent-purple)',
      textAlign: 'center',
      marginBottom: 0,
    }}>
      🔧 DEBUG MODE — Используются мок-данные / POST /personas/ · PATCH /personas/&#123;id&#125; · DELETE /personas/&#123;id&#125;
    </div>
  )
}

/* ─── Confirm Delete Modal ─────────────────────── */
function ConfirmDeleteModal({ persona, onConfirm, onCancel }: {
  persona: UserPersona
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2 className={styles.modalTitle}>Удалить персону?</h2>
        <p className={styles.modalText}>
          Персона <strong style={{ color: '#fff' }}>«{persona.name}»</strong> будет удалена безвозвратно.
          Все связанные чаты сохранятся, но потеряют привязку к этой персоне.
        </p>
        <div className={styles.modalActions}>
          <button className="btn-ghost" onClick={onCancel}>Отмена</button>
          <button className="btn-danger" onClick={onConfirm}>Удалить</button>
        </div>
      </div>
    </div>
  )
}

/* ─── Persona Card ─────────────────────────────── */
function PersonaCard({ persona, onEdit, onDelete }: {
  persona: UserPersona
  onEdit: () => void
  onDelete: () => void
}) {
  const initial = persona.name.charAt(0).toUpperCase()
  const subtitle = [
    persona.age ? `${persona.age} лет` : null,
    persona.gender,
  ].filter(Boolean).join(', ')

  return (
    <div className={styles.personaCard} onClick={onEdit}>
      <div className={styles.cardHeader}>
        <div className={styles.cardAvatar}>
          {initial}
        </div>
        <div className={styles.cardMeta}>
          <h3 className={styles.cardName}>{persona.name}</h3>
          <div className={styles.cardSubtitle}>{subtitle || 'Персона'}</div>
        </div>
        <div className={styles.cardActions} onClick={e => e.stopPropagation()}>
          <button className={styles.iconBtn} onClick={onEdit} title="Редактировать">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button className={`${styles.iconBtn} ${styles['iconBtn--danger']}`} onClick={onDelete} title="Удалить">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </button>
        </div>
      </div>

      {persona.description && (
        <p className={styles.cardDescription}>{persona.description}</p>
      )}

      <div className={styles.cardStats}>
        <div className={styles.cardStat}>
          <span className={styles.cardStatLabel}>Чатов</span>
          <span className={styles.cardStatValue}>{persona.chat_count}</span>
        </div>
        <div className={styles.cardStat}>
          <span className={styles.cardStatLabel}>Лорбуков</span>
          <span className={styles.cardStatValue}>{persona.lorebook_count}</span>
        </div>
        <div className={styles.cardStat}>
          <span className={styles.cardStatLabel}>Создана</span>
          <span className={styles.cardStatValue}>
            {new Date(persona.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
          </span>
        </div>
      </div>
    </div>
  )
}

/* ─── Main Component ───────────────────────────── */
export default function PersonasListScreen() {
  const navigate = useNavigate()
  const { success } = useToast()
  const [personas, setPersonas] = useState<UserPersona[]>(mockPersonas)
  const [toDelete, setToDelete] = useState<UserPersona | null>(null)

  const handleDelete = (persona: UserPersona) => {
    setPersonas(prev => prev.filter(p => p.id !== persona.id))
    setToDelete(null)
    success(`Персона «${persona.name}» удалена`)
  }

  return (
    <div className={styles.page}>
      <DebugBanner />

      <div className={styles.bgOrbs}>
        <div className={`${styles.orb} ${styles.orbPurple}`} />
        <div className={`${styles.orb} ${styles.orbFuchsia}`} />
        <div className={`${styles.orb} ${styles.orbOrange}`} />
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <button className={styles.backBtn} onClick={() => navigate('/dashboard')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
              </svg>
              На главную
            </button>
            <h1 className={styles.title}>Мои Персоны</h1>
            <p className={styles.subtitle}>Управляйте своими игровыми личностями</p>
          </div>
          <button className={styles.createBtn} onClick={() => navigate('/personas/create/debug')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Создать персону
          </button>
        </div>

        {/* Stats */}
        <div className={styles.statsBar}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Персон</span>
            <span className={`${styles.statValue} ${styles['statValue--purple']}`}>{personas.length}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Всего чатов</span>
            <span className={styles.statValue}>{mockPersonaStats.total_chats}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Лорбуков</span>
            <span className={`${styles.statValue} ${styles['statValue--orange']}`}>{mockPersonaStats.total_lorebooks}</span>
          </div>
        </div>

        {/* Grid */}
        <div className={styles.grid}>
          {personas.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <h3 className={styles.emptyTitle}>Персон пока нет</h3>
              <p className={styles.emptyText}>Создайте игровую личность, чтобы начать приключения</p>
              <button className={styles.createBtn} onClick={() => navigate('/personas/create/debug')}>
                Создать первую персону
              </button>
            </div>
          ) : (
            personas.map(persona => (
              <PersonaCard
                key={persona.id}
                persona={persona}
                onEdit={() => navigate(`/personas/${persona.id}/edit/debug`)}
                onDelete={() => setToDelete(persona)}
              />
            ))
          )}
        </div>
      </div>

      {toDelete && (
        <ConfirmDeleteModal
          persona={toDelete}
          onConfirm={() => handleDelete(toDelete)}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  )
}
