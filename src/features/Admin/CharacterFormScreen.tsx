import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styles from './CharacterForm.module.css'
import { mockCharacters } from './mockData'
import type { Character } from './types'
import { useToast, Button, Toggle, Input, Textarea, Badge, Card } from '@/components/ui'

interface CharFormData {
  name: string
  fandom: string
  gender: string
  description: string
  appearance: string
  personality: string
  nsfw_allowed: boolean
  is_public: boolean
  avatar_url: string
  card_image_url: string
}

const EMPTY: CharFormData = {
  name: '', fandom: '', gender: '', description: '', appearance: '', personality: '',
  nsfw_allowed: false, is_public: true, avatar_url: '', card_image_url: '',
}

function charToForm(c: Character): CharFormData {
  return {
    name: c.name,
    fandom: c.fandom || '',
    gender: c.gender || '',
    description: c.description || '',
    appearance: c.appearance || '',
    personality: c.personality || '',
    nsfw_allowed: c.nsfw_allowed,
    is_public: c.is_public,
    avatar_url: c.avatar_url || '',
    card_image_url: c.card_image_url || '',
  }
}



/* ─── Image Upload Zone ────────────────────────── */
function ImageUpload({ label, previewUrl, onFile }: {
  label: string; previewUrl?: string; onFile: (url: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string>(previewUrl || '')

  useEffect(() => { setPreview(previewUrl || '') }, [previewUrl])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setPreview(url)
    onFile(url)
  }

  return (
    <div className={styles.formGroup}>
      <label className={styles.label}>{label}</label>
      <div
        className={`${styles.imageUpload} ${preview ? styles.hasImage : ''}`}
        onClick={() => inputRef.current?.click()}
      >
        {preview ? (
          <img src={preview} alt={label} className={styles.uploadPreview} />
        ) : (
          <>
            <div className={styles.uploadIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
              </svg>
            </div>
            <div className={styles.uploadText}>Нажмите для загрузки</div>
            <div className={styles.uploadHint}>PNG, JPG, WEBP</div>
          </>
        )}
        <input ref={inputRef} type="file" accept="image/*" className={styles.uploadInput} onChange={handleChange} />
      </div>
    </div>
  )
}

/* ─── Main Component ───────────────────────────── */
export default function CharacterFormScreen() {
  const { characterId } = useParams<{ characterId: string }>()
  const navigate = useNavigate()
  const { success } = useToast()

  const isEdit = !!characterId && characterId !== 'create'
  const [form, setForm] = useState<CharFormData>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<keyof CharFormData, string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (isEdit) {
      const found = mockCharacters.find(c => c.id === characterId)
      if (found) {
        setForm(charToForm(found))
      } else {
        setNotFound(true)
      }
    }
  }, [characterId, isEdit])

  const set = (field: keyof CharFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  const toggle = (field: 'nsfw_allowed' | 'is_public') => () => {
    setForm(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const validate = (): boolean => {
    const e: Partial<Record<keyof CharFormData, string>> = {}
    if (!form.name.trim()) e.name = 'Имя обязательно'
    if (!form.fandom.trim()) e.fandom = 'Фандом обязателен'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 800))
    setSubmitting(false)
    success(isEdit ? `Персонаж «${form.name}» обновлён` : `Персонаж «${form.name}» создан`)
    navigate('/admin/debug')
  }

  if (notFound) {
    return (
      <div className={styles.page} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 16 }}>Персонаж не найден</h2>
          <button className={styles.cancelBtn} onClick={() => navigate('/admin/debug')}>Вернуться</button>
        </div>
      </div>
    )
  }

  const previewInitial = form.name ? form.name[0].toUpperCase() : '?'

  return (
    <div className={styles.page}>
      <div className={styles.debugBanner}>
        🔧 Debug — {isEdit ? `PATCH /admin/characters/${characterId}` : 'POST /admin/characters/'} · POST /admin/characters/&#123;id&#125;/images
      </div>

      <div className={styles.bgOrbs}>
        <div className={`${styles.orb} ${styles.orbPurple}`} />
        <div className={`${styles.orb} ${styles.orbFuchsia}`} />
        <div className={`${styles.orb} ${styles.orbOrange}`} />
      </div>

      <div className={styles.content}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <button className={styles.backBtn} onClick={() => navigate('/admin/debug')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
              </svg>
              Панель администратора
            </button>
            <h1 className={styles.title}>
              {isEdit ? `Редактирование: ${form.name || '...'}` : 'Новый Персонаж'}
            </h1>
            <p className={styles.subtitle}>
              {isEdit
                ? 'Обновите параметры AI-персонажа'
                : 'Создайте нового AI-персонажа для платформы SkaldEngine'}
            </p>
          </div>
        </div>

        <div className={styles.layout}>
          {/* ─── LEFT: Preview ─── */}
          <Card className={styles.previewCard}>
            <div className={styles.previewCover}>
              {form.card_image_url ? (
                <img src={form.card_image_url} className={styles.previewCoverImg} alt="" />
              ) : null}
              <div className={styles.previewAvatarWrap}>
                {form.avatar_url ? (
                  <img src={form.avatar_url} className={styles.previewAvatarImg} alt="" />
                ) : (
                  <div className={styles.previewPlaceholder}>{previewInitial}</div>
                )}
              </div>
            </div>
            <div className={styles.previewInfo}>
              <div className={styles.previewName}>{form.name || 'Имя персонажа'}</div>
              {form.fandom && <div className={styles.previewFandom}>{form.fandom}</div>}
              {form.description && (
                <p className={styles.previewDesc}>{form.description.slice(0, 120)}{form.description.length > 120 ? '...' : ''}</p>
              )}
            </div>
            <div className={styles.previewBadges}>
              <Badge variant={form.is_public ? 'purple' : 'red'}>
                {form.is_public ? '✓ Публичный' : '✗ Скрытый'}
              </Badge>
              {form.nsfw_allowed && (
                <Badge variant="red">NSFW 18+</Badge>
              )}
            </div>
          </Card>

          {/* ─── RIGHT: Form ─── */}
          <form onSubmit={handleSubmit} noValidate>
            <div className={styles.formCard}>
              {/* Core identity */}
              <div className={styles.sectionTitle}>Основное</div>

              <Input
                label="Имя"
                required
                value={form.name}
                onChange={set('name')}
                placeholder="Элара Лунный Шёпот"
                error={errors.name}
              />

              <Input
                label="Фандом / Вселенная"
                required
                value={form.fandom}
                onChange={set('fandom')}
                placeholder="Fantasy, Sci-Fi, Современный мир..."
                error={errors.fandom}
              />

              <Input
                label="Пол"
                value={form.gender}
                onChange={set('gender')}
                placeholder="Мужской / Женский / Небинарный"
              />


              <Textarea
                label="Описание (публичное)"
                value={form.description}
                onChange={set('description')}
                placeholder="Такое описание увидят пользователи в карточке персонажа..."
                rows={3}
              />

              {/* Detailed AI context */}
              <div className={styles.sectionTitle}>Личность (для AI)</div>

              <Textarea
                label="Внешность"
                value={form.appearance}
                onChange={set('appearance')}
                placeholder="Точное описание внешности — как AI будет её описывать в нарративе..."
                rows={4}
              />

              <Textarea
                label="Характер и личность"
                value={form.personality}
                onChange={set('personality')}
                placeholder="Черты характера, манера речи, убеждения, триггеры реакций..."
                rows={5}
              />

              {/* Images */}
              <div className={styles.sectionTitle}>Изображения</div>

              <div className={styles.imageRow}>
                <ImageUpload
                  label="Аватар персонажа"
                  previewUrl={form.avatar_url}
                  onFile={url => setForm(prev => ({ ...prev, avatar_url: url }))}
                />
                <ImageUpload
                  label="Фоновая карточка"
                  previewUrl={form.card_image_url}
                  onFile={url => setForm(prev => ({ ...prev, card_image_url: url }))}
                />
              </div>

              {/* Toggles */}
              <div className={styles.sectionTitle}>Настройки публикации</div>

              <Toggle 
                label="Публичный персонаж"
                checked={form.is_public}
                onChange={() => setForm(prev => ({ ...prev, is_public: !prev.is_public }))}
                className={styles.toggleRow}
              />

              <Toggle 
                label="Открытый контент 18+"
                checked={form.nsfw_allowed}
                onChange={() => setForm(prev => ({ ...prev, nsfw_allowed: !prev.nsfw_allowed }))}
                className={styles.toggleRow}
              />

              {/* Actions */}
              <div className={styles.actions}>
                <Button variant="ghost" type="button" onClick={() => navigate('/admin/debug')}>
                  Отмена
                </Button>
                <Button variant="orange" type="submit" loading={submitting}>
                  {isEdit ? 'Сохранить изменения' : 'Создать персонажа'}
                </Button>
              </div>

            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
