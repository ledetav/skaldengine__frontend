import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Lorebooks.module.css'
import type { Lorebook } from '@/core/types/chat'
import { lorebooksApi } from '@/core/api/lorebooks'
import { useToast } from '@/components/ui'

function BookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  )
}

function ConfirmDelete({ lorebook, onConfirm, onCancel }: {
  lorebook: Lorebook; onConfirm: () => void; onCancel: () => void
}) {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2 className={styles.modalTitle}>Удалить лорбук?</h2>
        <p className={styles.modalText}>
          «<strong style={{ color: '#fff' }}>{lorebook.name}</strong>» и все его{' '}
          <strong style={{ color: 'var(--accent-red)' }}>{lorebook.entries_count}</strong> записей будут удалены безвозвратно.
        </p>
        <div className={styles.modalActions}>
          <button className={styles.cancelBtn} onClick={onCancel}>Отмена</button>
          <button className={styles.dangerBtn} onClick={onConfirm}>Удалить</button>
        </div>
      </div>
    </div>
  )
}

function LorebookCard({ lorebook, onOpen, onEdit, onDelete }: {
  lorebook: Lorebook
  onOpen: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className={styles.lorebookCard} onClick={onOpen}>
      <div className={styles.cardHeader}>
        <div className={styles.cardIcon}><BookIcon /></div>
        <div className={styles.cardMeta}>
          <div className={styles.cardName}>{lorebook.name}</div>
          <div className={styles.cardTags}>
            {lorebook.fandom && <span className={styles.cardTag}>{lorebook.fandom}</span>}
            {lorebook.character_name && (
              <span className={`${styles.cardTag} ${styles['cardTag--char']}`}>
                📖 {lorebook.character_name}
              </span>
            )}
            {lorebook.user_persona_name && (
              <span className={styles.cardTag}>👤 {lorebook.user_persona_name}</span>
            )}
          </div>
        </div>
        <div className={styles.cardActions} onClick={e => e.stopPropagation()}>
          <button className={styles.iconBtn} onClick={onEdit} title="Редактировать">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button className={`${styles.iconBtn} ${styles['iconBtn--danger']}`} onClick={onDelete} title="Удалить">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </button>
        </div>
      </div>

      {lorebook.description && (
        <p className={styles.cardDescription}>{lorebook.description}</p>
      )}

      <div className={styles.cardFooter}>
        <div className={styles.entryCount}>
          <span>{lorebook.entries_count || 0}</span>
          {(lorebook.entries_count || 0) === 1 ? 'запись' : ((lorebook.entries_count || 0) < 5 ? 'запси' : 'записей')}
        </div>
        <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)' }}>
          {new Date(lorebook.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>
    </div>
  )
}

export default function LorebooksListScreen() {
  const navigate = useNavigate()
  const { success, error } = useToast()
  const [lorebooks, setLorebooks] = useState<Lorebook[]>([])
  const [toDelete, setToDelete] = useState<Lorebook | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchLorebooks = async () => {
      try {
        setIsLoading(true)
        const data = await lorebooksApi.getLorebooks()
        setLorebooks(data || [])
      } catch (err: any) {
        console.error('Error fetching lorebooks:', err)
        error('Не удалось загрузить списк лорбуков')
      } finally {
        setIsLoading(false)
      }
    }
    fetchLorebooks()
  }, [error])

  const handleDelete = async (lb: Lorebook) => {
    try {
      await lorebooksApi.deleteLorebook(lb.id)
      setLorebooks(prev => prev.filter(l => l.id !== lb.id))
      success(`Лорбук «${lb.name}» удалён`)
    } catch (err: any) {
      error(`Ошибка удаления: ${err.message}`)
    } finally {
      setToDelete(null)
    }
  }

  const totalEntries = lorebooks.reduce((s, l) => s + ((l as any).entries?.length || 0), 0)

  return (
    <div className={styles.page}>
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
                <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
              </svg>
              На главную
            </button>
            <h1 className={styles.title}>Лорбуки</h1>
            <p className={styles.subtitle}>
              {lorebooks.length} лорбуков · {totalEntries} записей
            </p>
          </div>
          <button className={styles.createBtn} onClick={() => navigate('/lorebooks/create')}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Создать лорбук
          </button>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.5)' }}>Загрузка...</div>
        ) : (
          <div className={styles.grid}>
            {lorebooks.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}><BookIcon /></div>
                <h3 className={styles.emptyTitle}>Лорбуков пока нет</h3>
                <p className={styles.emptyText}>Создайте базу знаний для обогащения контекста AI-персонажей</p>
                <button className={styles.createBtn} onClick={() => navigate('/lorebooks/create')} style={{ marginTop: 8 }}>
                  Создать первый лорбук
                </button>
              </div>
            ) : (
              lorebooks.map(lb => (
                <LorebookCard
                  key={lb.id}
                  lorebook={lb}
                  onOpen={() => navigate(`/lorebooks/${lb.id}`)}
                  onEdit={() => navigate(`/lorebooks/${lb.id}/edit`)}
                  onDelete={() => setToDelete(lb)}
                />
              ))
            )}
          </div>
        )}
      </div>

      {toDelete && (
        <ConfirmDelete
          lorebook={toDelete}
          onConfirm={() => handleDelete(toDelete)}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  )
}
