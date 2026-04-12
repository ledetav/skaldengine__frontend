import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styles from './Lorebooks.module.css'
import type { Lorebook } from '@/core/types/chat'
import { lorebooksApi } from '@/core/api/lorebooks'
import { personasApi } from '@/core/api/personas'
import { charactersApi } from '@/core/api/characters'
import type { UserPersona } from '@/core/types/chat'
import type { Character } from '@/core/types/character'
import { useToast, Button, Input, Textarea, Card } from '@/components/ui'

import type { LorebookType } from '@/core/types/chat'

interface FormData {
  name: string
  type: LorebookType
  description: string
  fandom: string
  character_id: string
  user_persona_id: string
}

const EMPTY: FormData = { name: '', type: 'Fandom', description: '', fandom: '', character_id: '', user_persona_id: '' }

function toForm(lb: Lorebook): FormData {
  return {
    name: lb.name,
    type: lb.type || 'Fandom',
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

  const [personas, setPersonas] = useState<UserPersona[]>([])
  const [characters, setCharacters] = useState<Character[]>([])

  useEffect(() => {
    const loadData = async () => {
      try {
        const [ps, cs] = await Promise.all([
          personasApi.getPersonas(),
          charactersApi.getCharacters()
        ])
        setPersonas(ps || [])
        setCharacters(cs || [])

        if (isEdit && id) {
          const existing = await lorebooksApi.getLorebook(id)
          setForm(toForm(existing))
        }
      } catch (err: any) {
        console.error('Ошибка загрузки данных', err)
      }
    }
    loadData()
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
    try {
      const payload: Partial<Lorebook> = {
        name: form.name,
        type: form.type,
        description: form.description || undefined,
        fandom: form.type === 'Fandom' && form.fandom ? form.fandom : undefined,
        character_id: form.type === 'Character' && form.character_id ? form.character_id : undefined,
        user_persona_id: form.type === 'Persona' && form.user_persona_id ? form.user_persona_id : undefined
      }
      
      if (isEdit && id) {
        await lorebooksApi.updateLorebook(id, payload)
        success('Лорбук успешно обновлён')
      } else {
        await lorebooksApi.createLorebook(payload)
        success('Лорбук создан')
      }
      navigate('/lorebooks')
    } catch (err: any) {
      success(`Ошибка сохранения: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
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
            <button className={styles.backBtn} onClick={() => navigate('/lorebooks')}>
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
              <div className={styles.previewFandom}>{form.fandom || 'Оригинальный / Независимый'}</div>
              <p className={styles.previewDesc}>{form.description || 'Описание пока не заполнено...'}</p>
            </div>

              <div className={styles.previewStats}>
                <div className={styles.previewStat}>
                  <span className={styles.previewStatLabel}>Тип</span>
                  <span className={styles.previewStatValue}>
                    {form.type === 'Fandom' ? 'Фандом' : form.type === 'Persona' ? 'Персона' : 'Персонаж'}
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

                {form.type === 'Fandom' && (
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Фандом</label>
                    <input 
                      className={styles.formInput}
                      value={form.fandom}
                      onChange={set('fandom')}
                      placeholder="Fantasy, Genshin Impact, и т.д."
                    />
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
                      Оставьте пустым для независимого мира
                    </div>
                  </div>
                )}
                
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

                <div className={styles.sectionTitle} style={{ marginTop: '12px' }}>Связи и контекст</div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {form.type === 'Persona' && (
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Привязать к персоне</label>
                      <select
                        className={styles.formInput}
                        value={form.user_persona_id}
                        onChange={set('user_persona_id')}
                        style={{ cursor: 'pointer' }}
                        required
                      >
                        <option value="">— Выберите персону —</option>
                        {personas.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {form.type === 'Character' && (
                    <div className={styles.formGroup}>
                      <label className={styles.label}>К персонажу</label>
                      <select className={styles.formInput} value={form.character_id} onChange={set('character_id')} required>
                        <option value="">— Выберите персонажа —</option>
                        {characters.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div style={{ 
                  marginTop: '12px', 
                  display: 'flex', 
                  gap: '12px', 
                  justifyContent: 'flex-end',
                  paddingTop: '32px',
                  borderTop: '1px solid rgba(255,255,255,0.05)'
                }}>
                  <Button variant="ghost" type="button" onClick={() => navigate('/lorebooks')}>
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
