import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styles from './Lorebooks.module.css'
import { mockLorebooks } from './lorebookMockData'
import type { Lorebook } from './lorebookMockData'
import { mockPersonas } from '../Personas/personaMockData'
import { useToast, Button, Input, Textarea, Card } from '@/components/ui'

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
        🔧 DEBUG MODE — {isEdit ? `PUT /admin/lorebooks/${id}` : 'POST /lorebooks/'}
      </div>

      <div className={styles.bgOrbs}>
        <div className={`${styles.orb} ${styles.orbPurple}`} />
        <div className={`${styles.orb} ${styles.orbFuchsia}`} />
        <div className={`${styles.orb} ${styles.orbOrange}`} />
      </div>

      <div className={styles.contentNarrow}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button className={styles.backBtn} onClick={() => navigate('/lorebooks/debug')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
              </svg>
              Назад к списку
            </button>
            <h1 className={styles.title}>{isEdit ? 'Редактирование' : 'Новый лорбук'}</h1>
            <p className={styles.subtitle}>{isEdit ? `ID: ${id}` : 'Создайте новую базу знаний для вашего мира'}</p>
          </div>
        </header>

        <div className={styles.layout}>
          {/* LEFT: Preview */}
          <aside className={styles.previewCard}>
            <div className={styles.previewIconArea}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
            </div>
            
            <div className={styles.previewInfo}>
              <h3 className={styles.previewName}>{form.name || 'Название лорбука'}</h3>
              <div className={styles.previewFandom}>{form.fandom || 'Оригинальная вселенная'}</div>
              <p className={styles.previewDesc}>{form.description || 'Описание пока не заполнено...'}</p>
            </div>

            <div className={styles.previewStats}>
              <div className={styles.previewStat}>
                <span className={styles.previewStatLabel}>Тип</span>
                <span className={styles.previewStatValue}>
                  {form.character_id ? 'Персонаж' : 'Мир'}
                </span>
              </div>
              <div className={styles.previewStat}>
                <span className={styles.previewStatLabel}>Записей</span>
                <span className={styles.previewStatValue}>0</span>
              </div>
            </div>
          </aside>

          {/* RIGHT: Form */}
          <main>
            <Card style={{ padding: '36px' }}>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div className={styles.sectionTitle}>Основная информация</div>
                
                <Input
                  label="Название лорбука"
                  value={form.name}
                  onChange={set('name')}
                  placeholder="Напр: Хроники Этернии"
                  error={errors.name}
                  required
                />

                <Textarea
                  label="Краткое описание"
                  value={form.description}
                  onChange={set('description')}
                  placeholder="О чем этот лорбук?"
                  rows={4}
                />

                <Input
                  label="Вселенная / Фандом"
                  value={form.fandom}
                  onChange={set('fandom')}
                  placeholder="Fantasy, Genshin Impact, и т.д."
                  hint="Оставьте пустым для оригинальной вселенной"
                />

                <div className={styles.sectionTitle} style={{ marginTop: '12px' }}>Связи и контекст</div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Привязать к персоне</label>
                    <select
                      className={styles.formInput}
                      value={form.user_persona_id}
                      onChange={set('user_persona_id')}
                      style={{ cursor: 'pointer' }}
                    >
                      <option value="">— Без привязки —</option>
                      {mockPersonas.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <Input
                    label="ID Персонажа (AI)"
                    value={form.character_id}
                    onChange={set('character_id')}
                    placeholder="UUID если это лорбук конкретного персонажа"
                  />
                </div>

                <div style={{ 
                  marginTop: '12px', 
                  display: 'flex', 
                  gap: '12px', 
                  justifyContent: 'flex-end',
                  paddingTop: '32px',
                  borderTop: '1px solid rgba(255,255,255,0.05)'
                }}>
                  <Button variant="ghost" type="button" onClick={() => navigate('/lorebooks/debug')}>
                    Отмена
                  </Button>
                  <Button variant="orange" type="submit" loading={submitting}>
                    {isEdit ? 'Сохранить изменения' : 'Создать лорбук'}
                  </Button>
                </div>
              </form>
            </Card>
          </main>
        </div>
      </div>
    </div>
  )
}
