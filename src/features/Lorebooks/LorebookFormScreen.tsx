import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styles from './Lorebooks.module.css'
import { mockLorebooks } from './lorebookMockData'
import type { Lorebook } from './lorebookMockData'
import { mockPersonas } from '../Personas/personaMockData'
import { useToast } from '@/components/ui/Toast'

interface FormData {
  name: string
  description: string
  fandom: string
  character_id: string
  user_persona_id: string
}

const EMPTY: FormData = { name: '', description: '', fandom: '', character_id: '', user_persona_id: '' }

function toForm(lb: Lorebook): FormData {
  return {
    name: lb.name,
    description: lb.description || '',
    fandom: lb.fandom || '',
    character_id: lb.character_id || '',
    user_persona_id: lb.user_persona_id || '',
  }
}

export default function LorebookFormScreen() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { success } = useToast()

  const isEdit = !!id
  const [form, setForm] = useState<FormData>(EMPTY)
  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (isEdit) {
      const existing = mockLorebooks.find(l => l.id === id)
      if (existing) setForm(toForm(existing))
    }
  }, [id, isEdit])

  const set = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  const validate = (): boolean => {
    const e: Partial<FormData> = {}
    if (!form.name.trim()) e.name = 'Название обязательно'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 600))
    setSubmitting(false)
    success(isEdit ? `Лорбук «${form.name}» обновлён` : `Лорбук «${form.name}» создан`)
    navigate('/lorebooks/debug')
  }

  return (
    <div className={styles.page}>
      <div className={styles.debugBanner}>
        🔧 Debug — {isEdit ? `PUT /admin/lorebooks/${id}` : 'POST /lorebooks/'}
      </div>

      <div className={styles.bgOrbs}>
        <div className={`${styles.orb} ${styles.orbPurple}`} />
        <div className={`${styles.orb} ${styles.orbFuchsia}`} />
      </div>

      <div className={styles.contentNarrow}>
        {/* Header */}
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={() => navigate('/lorebooks/debug')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            {isEdit ? `Назад к лорбуку` : 'Все лорбуки'}
          </button>
          <h1 className={styles.title}>{isEdit ? `Редактировать: ${form.name || '...'}` : 'Новый Лорбук'}</h1>
          <p className={styles.subtitle}>
            {isEdit ? 'Обновите метаданные лорбука' : 'Создайте новую базу знаний для вашего персонажа или персоны'}
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className={styles.formCard}>
            <div className={styles.sectionTitle}>Основная информация</div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Название <span style={{ color: 'var(--accent-orange)' }}>*</span>
              </label>
              <input
                className={`${styles.formInput} ${errors.name ? '' : ''}`}
                value={form.name}
                onChange={set('name')}
                placeholder="Хроники Лунных Земель..."
                maxLength={120}
                style={{ width: '100%', padding: '12px 16px', fontSize: '0.9rem' }}
              />
              {errors.name && <span style={{ fontSize: '0.75rem', color: 'var(--accent-red)' }}>{errors.name}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Описание</label>
              <textarea
                className={styles.formTextarea}
                value={form.description}
                onChange={set('description')}
                placeholder="Краткое описание содержания лорбука..."
                rows={4}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Фандом / Вселенная</label>
              <input
                className={styles.formInput}
                value={form.fandom}
                onChange={set('fandom')}
                placeholder="Fantasy, Sci-Fi, Modern, ..."
                style={{ width: '100%', padding: '12px 16px' }}
              />
              <span className={styles.hint}>Опционально. Помогает фильтровать лорбуки по жанру.</span>
            </div>

            <div className={styles.sectionTitle}>Привязка</div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Персона (привязать к персоне)</label>
              <select
                className={styles.formInput}
                value={form.user_persona_id}
                onChange={set('user_persona_id')}
                style={{ width: '100%', padding: '12px 16px', cursor: 'pointer' }}
              >
                <option value="">— Без привязки к персоне —</option>
                {mockPersonas.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>ID Персонажа (для связи с AI-персонажем)</label>
              <input
                className={styles.formInput}
                value={form.character_id}
                onChange={set('character_id')}
                placeholder="UUID персонажа..."
                style={{ width: '100%', padding: '12px 16px' }}
              />
              <span className={styles.hint}>
                Укажите ID AI-персонажа, если лорбук относится к конкретному персонажу.
                При публикации персонажа лорбук добавится в его контекст.
              </span>
            </div>

            <div className={styles.formActionsRow}>
              <button type="button" className={styles.cancelBtn} onClick={() => navigate('/lorebooks/debug')}>
                Отмена
              </button>
              <button type="submit" className={styles.submitBtnOrange} disabled={submitting}>
                {submitting
                  ? (isEdit ? 'Сохраняем...' : 'Создаём...')
                  : (isEdit ? 'Сохранить изменения' : 'Создать лорбук')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
