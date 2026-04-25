import { useState, useEffect } from 'react'
import { Button, Input, Card, Badge, useToast } from '@/components/ui'
import styles from '../Admin.module.css'
import { SearchableSelect } from './SearchableSelect'
import type { Scenario } from '@/core/types/chat'
import type { Character } from '../types'
import { scenariosApi } from '@/core/api/scenarios'

interface ScenarioProfileViewProps {
  scenarioId: string
  scenarios: Scenario[]
  characters: Character[]
  onBack: () => void
  onDelete: (id: string) => void
  onSave: (scenario: Partial<Scenario>) => Promise<void>
}

export function ScenarioProfileView({ 
  scenarioId, 
  scenarios, 
  characters, 
  onBack, 
  onDelete,
  onSave
}: ScenarioProfileViewProps) {
  const { success } = useToast()
  const isCreate = scenarioId === 'create'
  
  const [draft, setDraft] = useState<Partial<Scenario>>({
    title: '',
    description: '',
    start_point: '',
    end_point: '',
    location: '',
    character_id: null
  })

  const [isEdit, setIsEdit] = useState(isCreate)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!isCreate) {
      const existing = scenarios.find(s => s.id === scenarioId)
      if (existing) {
        setDraft(existing)
      } else {
        // Fetch if not in list
        scenariosApi.getScenario(scenarioId).then(setDraft).catch(console.error)
      }
    }
  }, [scenarioId, scenarios, isCreate])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(draft)
      if (!isCreate) setIsEdit(false)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить этот сценарий?')) return
    setIsDeleting(true)
    try {
      await scenariosApi.deleteScenario(scenarioId)
      onDelete(scenarioId)
      success('Сценарий удален')
      onBack()
    } catch (e) {
      console.error(e)
      alert('Ошибка при удалении')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className={styles.sectionContainer}>
      <header className={styles.backHeader} style={{ marginBottom: '24px' }}>
        <button className={styles.backBtn} onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
        </button>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span className={styles.mainSubtitle}>Управление сценарием</span>
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900 }}>
            {isCreate ? 'Новый сценарий' : draft.title}
          </h2>
        </div>
      </header>

      <div className={styles.detailGroup}>
        <Card className={styles.detailsCard} style={{ padding: '32px', gap: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
            
            <div className={styles.detailGroup}>
              <div className={styles.detailTitle}>Заголовок</div>
              {isEdit ? (
                <Input 
                  value={draft.title || ''} 
                  onChange={e => setDraft(prev => ({ ...prev, title: e.target.value }))} 
                  placeholder="Название сценария..."
                />
              ) : (
                <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--white)' }}>{draft.title}</div>
              )}
            </div>

            <div className={styles.detailGroup}>
              <div className={styles.detailTitle}>Персонаж (привязка)</div>
              {isEdit ? (
                <SearchableSelect 
                  options={[
                    { id: '', name: 'Общий (нет привязки)' },
                    ...characters.map(c => ({ id: c.id, name: c.name, subtext: c.fandom }))
                  ]}
                  value={draft.character_id || ''}
                  onChange={val => setDraft(prev => ({ ...prev, character_id: val || null }))}
                  placeholder="Выберите персонажа..."
                />
              ) : (
                <Badge variant={draft.character_id ? 'orange' : 'blue'}>
                  {draft.character_id ? characters.find(c => c.id === draft.character_id)?.name : 'Общий'}
                </Badge>
              )}
            </div>

            <div className={styles.detailGroup}>
              <div className={styles.detailTitle}>Локация</div>
              {isEdit ? (
                <Input 
                  value={draft.location || ''} 
                  onChange={e => setDraft(prev => ({ ...prev, location: e.target.value }))} 
                  placeholder="Где происходит действие..."
                />
              ) : (
                <div style={{ opacity: 0.8 }}>{draft.location || 'Не указана'}</div>
              )}
            </div>

            <div className={styles.detailGroup} style={{ gridColumn: 'span 2' }}>
              <div className={styles.detailTitle}>Публичное описание</div>
              {isEdit ? (
                <textarea 
                  className={styles.editTextarea}
                  value={draft.description || ''}
                  onChange={e => setDraft(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Краткое описание для карточки..."
                  style={{ minHeight: '80px' }}
                />
              ) : (
                <div style={{ opacity: 0.7, lineHeight: 1.6 }}>{draft.description}</div>
              )}
            </div>

            <div className={styles.detailGroup} style={{ gridColumn: 'span 2' }}>
              <div className={styles.detailTitle}>Точка А (Старт)</div>
              {isEdit ? (
                <textarea 
                  className={styles.editTextarea}
                  value={draft.start_point || ''}
                  onChange={e => setDraft(prev => ({ ...prev, start_point: e.target.value }))}
                  placeholder="Как начинается сцена..."
                  style={{ minHeight: '120px' }}
                />
              ) : (
                <div style={{ opacity: 0.9, lineHeight: 1.6, whiteSpace: 'pre-wrap', padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                  {draft.start_point}
                </div>
              )}
            </div>

            <div className={styles.detailGroup} style={{ gridColumn: 'span 2' }}>
              <div className={styles.detailTitle}>Точка Б (Цель/Финал)</div>
              {isEdit ? (
                <textarea 
                  className={styles.editTextarea}
                  value={draft.end_point || ''}
                  onChange={e => setDraft(prev => ({ ...prev, end_point: e.target.value }))}
                  placeholder="К чему должен прийти сюжет..."
                  style={{ minHeight: '120px' }}
                />
              ) : (
                <div style={{ opacity: 0.9, lineHeight: 1.6, whiteSpace: 'pre-wrap', padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                  {draft.end_point}
                </div>
              )}
            </div>
          </div>

          <div className={styles.actionRow} style={{ border: 'none', padding: 0, marginTop: '16px' }}>
            {isEdit ? (
              <div style={{ display: 'flex', gap: '12px' }}>
                {!isCreate && <Button variant="ghost" onClick={() => setIsEdit(false)}>Отмена</Button>}
                <Button variant="orange" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? 'Сохранение...' : isCreate ? 'Создать сценарий' : 'Сохранить изменения'}
                </Button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between', width: '100%' }}>
                <Button variant="orange" onClick={() => setIsEdit(true)}>Редактировать</Button>
                <Button variant="danger" onClick={handleDelete} disabled={isDeleting}>Удалить</Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
