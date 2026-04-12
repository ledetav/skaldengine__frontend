import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styles from './PersonaForm.module.css'
import type { UserPersona } from '@/core/types/chat'
import { personasApi } from '@/core/api/personas'
import { useToast } from '@/components/ui'

interface PersonaFormData {
  name: string
  description: string
  age: string
  gender: string
  appearance: string
  personality: string
  facts: string
}

const EMPTY_FORM: PersonaFormData = {
  name: '',
  description: '',
  age: '',
  gender: '',
  appearance: '',
  personality: '',
  facts: '',
}

function toFormData(persona: UserPersona): PersonaFormData {
  return {
    name: persona.name,
    description: persona.description || '',
    age: persona.age != null ? String(persona.age) : '',
    gender: persona.gender || '',
    appearance: persona.appearance || '',
    personality: persona.personality || '',
    facts: persona.facts || '',
  }
}

export default function PersonaFormScreen() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { success } = useToast()

  const isEdit = !!id
  const [form, setForm] = useState<PersonaFormData>(EMPTY_FORM)
  const [errors, setErrors] = useState<Partial<PersonaFormData>>({})
  const [submitting, setSubmitting] = useState(false)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (isEdit && id) {
      const fetchPersona = async () => {
        try {
          const existing = await personasApi.getPersona(id)
          setForm(toFormData(existing))
        } catch (err) {
          setNotFound(true)
        }
      }
      fetchPersona()
    }
  }, [id, isEdit])

  const set = (field: keyof PersonaFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  const validate = (): boolean => {
    const newErrors: Partial<PersonaFormData> = {}
    if (!form.name.trim()) newErrors.name = 'Имя обязательно'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)

    try {
      const payload = {
        name: form.name,
        description: form.description || undefined,
        gender: form.gender || undefined,
        age: form.age ? parseInt(form.age, 10) : undefined,
        appearance: form.appearance || undefined,
        personality: form.personality || undefined,
        facts: form.facts || undefined,
      }
      
      if (isEdit && id) {
        await personasApi.updatePersona(id, payload)
        success(`Персона «${form.name}» обновлена`)
      } else {
        await personasApi.createPersona(payload as any)
        success(`Персона «${form.name}» создана`)
      }
      navigate('/personas')
    } catch (err: any) {
      success(`Ошибка сохр��нения: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  if (notFound) {
    return (
      <div className={styles.page}>
        <div className={styles.content} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <h2 style={{ color: 'rgba(255,255,255,0.5)' }}>Персона не найдена</h2>
          <button className={styles.cancelBtn} onClick={() => navigate('/personas')} style={{ marginTop: 16 }}>
            Вернуться к списку
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      {/* Background */}
      <div className={styles.bgOrbs}>
        <div className={`${styles.orb} ${styles.orbPurple}`} />
        <div className={`${styles.orb} ${styles.orbFuchsia}`} />
      </div>

      <div className={styles.content}>
        {/* Header */}
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={() => navigate('/personas')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            Назад к персонам
          </button>
          <h1 className={styles.title}>{isEdit ? `Редактирование: ${form.name || '...'}` : 'Новая Персона'}</h1>
          <p className={styles.subtitle}>
            {isEdit
              ? 'Обновите данные в��шей игровой личности'
              : 'Создайте игровую личность, от лица которой будете общаться с персонажами'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className={styles.formCard}>

            {/* ─── Core Identity ─── */}
            <div className={styles.sectionTitle}>Основная информация</div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Имя <span className={styles.required}>*</span>
              </label>
              <input
                className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                value={form.name}
                onChange={set('name')}
                placeholder="Как зовут вашего персонажа?"
                maxLength={80}
              />
              {errors.name && <span className={styles.errorMsg}>{errors.name}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Краткое описание</label>
              <textarea
                className={styles.textarea}
                value={form.description}
                onChange={set('description')}
                placeholder="Одна-две фразы, описывающие персону..."
                rows={3}
              />
            </div>

            <div className={styles.row}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Возраст</label>
                <input
                  className={styles.input}
                  type="number"
                  value={form.age}
                  onChange={set('age')}
                  placeholder="—"
                  min={0}
                  max={999}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Пол</label>
                <input
                  className={styles.input}
                  value={form.gender}
                  onChange={set('gender')}
                  placeholder="Мужской / Женский / Другое"
                  maxLength={40}
                />
              </div>
            </div>

            {/* ─── Detailed Profile ─── */}
            <div className={styles.sectionTitle}>Детальный профиль</div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Внешность</label>
              <textarea
                className={styles.textarea}
                value={form.appearance}
                onChange={set('appearance')}
                placeholder="Опишите внешность: рост, цвет волос, особые черты..."
                rows={4}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Личность</label>
              <textarea
                className={styles.textarea}
                value={form.personality}
                onChange={set('personality')}
                placeholder="Характер, ценности, манера речи..."
                rows={4}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Дополнительные факты</label>
              <textarea
                className={styles.textarea}
                value={form.facts}
                onChange={set('facts')}
                placeholder="Любые факты, которые должен знать AI: навыки, история, секреты..."
                rows={4}
              />
              <span className={styles.hint}>
                Эти данные используются AI для понимания контекста вашего персонажа
              </span>
            </div>

            {/* ─── Actions ─── */}
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => navigate('/personas')}
              >
                Отмена
              </button>
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                    </svg>
                    {isEdit ? 'Сохраняем...' : 'Создаём...'}
                  </>
                ) : (
                  isEdit ? 'Сохранить изменения' : 'Создать персону'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
