import { logger } from "@/core/utils/logger";
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
import { useProfile } from '@/core/hooks/useProfile'

import type { LorebookType } from '@/core/types/chat'

interface FormData {
  name: string
  type: LorebookType
  description: string
  fandom: string
  character_id: string
  user_persona_id: string
  tags: string[]
}

const EMPTY: FormData = { name: '', type: 'fandom', description: '', fandom: '', character_id: '', user_persona_id: '', tags: [] }

function toForm(lb: Lorebook): FormData {
  // Определяем тип на основе имеющихся связей, так как бэкенд не хранит 'type'
  let type: LorebookType = 'fandom';
  if (lb.character_id) type = 'character';
  else if (lb.user_persona_id) type = 'persona';

  return {
    name: lb.name,
    type: type,
    description: lb.description || '',
    fandom: lb.fandom || '',
    character_id: lb.character_id || '',
    user_persona_id: lb.user_persona_id || '',
    tags: lb.tags || []
  }
}

export default function LorebookFormScreen() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { success, error } = useToast()
  const { profile } = useProfile()
  const isAdmin = profile?.role === 'admin' || profile?.role === 'moderator'

  const isEdit = !!id
  const [form, setForm] = useState<FormData>(EMPTY)
  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [submitting, setSubmitting] = useState(false)

  const [personas, setPersonas] = useState<UserPersona[]>([])
  const [characters, setCharacters] = useState<Character[]>([])

  const selectedChar = characters.find((c: Character) => c.id === form.character_id);
  const isOriginalChar = selectedChar?.type?.toLowerCase() === 'original' || selectedChar?.fandom?.toLowerCase() === 'original' || selectedChar?.fandom?.toLowerCase() === 'оригинальный';
  const isMain = form.tags?.includes('main');

  const [charLorebooks, setCharLorebooks] = useState<Lorebook[]>([])

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
          
          // Load other lorebooks for the character to check main status
          if (existing.character_id) {
            const lbs = await lorebooksApi.getLorebooks(0, 50, undefined, undefined, existing.character_id)
            setCharLorebooks(lbs || [])
          }
        }
      } catch (err: any) {
        logger.error('Ошибка загрузки данных', err)
      }
    }
    loadData()
  }, [id, isEdit])

  // Fetch lorebooks if character_id changes in the form
  useEffect(() => {
    if (form.character_id && form.type === 'character') {
      lorebooksApi.getLorebooks(0, 50, undefined, undefined, form.character_id).then(setCharLorebooks)
    } else {
      setCharLorebooks([])
    }
  }, [form.character_id, form.type])

  const mainLbsForChar = charLorebooks.filter((lb: Lorebook) => lb.tags?.includes('main'));
  const holdsMainTag = isMain && mainLbsForChar.some((lb: Lorebook) => lb.id === id); // This specific lorebook is one of the main ones
  const isToggleLocked = isEdit && holdsMainTag && isOriginalChar && mainLbsForChar.length === 1;

  const set = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev: FormData) => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) setErrors((prev: Partial<FormData>) => ({ ...prev, [field]: undefined }))
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
      const payload: Partial<Lorebook> & Record<string, any> = {
        name: form.name,
        type: form.type, // Back-end DOES expect this field!
        description: form.description || undefined,
        fandom: form.type === 'fandom' && form.fandom ? form.fandom : null,
        character_id: form.type === 'character' && form.character_id ? form.character_id : null,
        user_persona_id: form.type === 'persona' && form.user_persona_id ? form.user_persona_id : null,
        tags: form.tags
      }
      
      if (isEdit && id) {
        if (isAdmin) {
          await lorebooksApi.updateAdminLorebook(id, payload as any)
        } else {
          await lorebooksApi.updateLorebook(id, payload as any)
        }
        success('Лорбук успешно обновлён')
      } else {
        if (isAdmin) {
          await lorebooksApi.createAdminLorebook(payload as any)
        } else {
          await lorebooksApi.createLorebook(payload as any)
        }
        success('Лорбук создан')
      }
      navigate('/lorebooks')
    } catch (err: any) {
      error(`Ошибка сохранения: ${err.message}`)
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
              <div className={styles.previewFandom}>{form.fandom === 'Original' ? 'Оригинальный' : (form.fandom || 'Оригинальный / Независимый')}</div>
              <p className={styles.previewDesc}>{form.description || 'Описание пока не заполнено...'}</p>
            </div>

              <div className={styles.previewStats}>
                <div className={styles.previewStat}>
                  <span className={styles.previewStatLabel}>Тип</span>
                  <span className={styles.previewStatValue}>
                    {form.type === 'fandom' ? 'Фандом' : form.type === 'persona' ? 'Персона' : 'Персонаж'}
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

                {form.type === 'fandom' && (
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
                  {form.type === 'persona' && (
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
                        {personas.map((p: UserPersona) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {form.type === 'character' && (
                    <div className={styles.formGroup}>
                      <label className={styles.label}>К персонажу</label>
                      <select className={styles.formInput} value={form.character_id} onChange={set('character_id')} required>
                        <option value="">— Выберите персонажа —</option>
                        {characters.map((c: Character) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {form.type === 'character' && isOriginalChar && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div className={styles.formGroup} style={{ 
                        flexDirection: 'row', 
                        alignItems: 'center', 
                        gap: '12px',
                        padding: '12px',
                        background: isToggleLocked ? 'rgba(255,255,255,0.03)' : 'rgba(255,140,66,0.05)',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,140,66,0.1)',
                        opacity: isToggleLocked ? 0.6 : 1
                      }}>
                        <input 
                          type="checkbox" 
                          id="isMain"
                          checked={isMain}
                          disabled={isToggleLocked}
                          onChange={(e) => {
                            const newTags = e.target.checked 
                              ? [...(form.tags || []), 'main']
                              : (form.tags || []).filter((t: string) => t !== 'main');
                            setForm((prev: FormData) => ({ ...prev, tags: newTags }));
                          }}
                          style={{ width: '18px', height: '18px', cursor: isToggleLocked ? 'not-allowed' : 'pointer' }}
                        />
                        <label htmlFor="isMain" style={{ cursor: isToggleLocked ? 'not-allowed' : 'pointer', fontSize: '0.9rem', color: 'var(--accent-orange)' }}>
                          Сделать основным лорбуком персонажа
                        </label>
                      </div>
                      {isToggleLocked && (
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255, 140, 66, 0.7)', padding: '0 12px' }}>
                          ℹ️ У оригинального персонажа должен быть хотя бы один основной лорбук.
                        </div>
                      )}
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
