import { useState, useEffect } from 'react'
import { Button, Input, Badge, useToast } from '@/components/ui'
import styles from '../styles'
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
    internal_description: '',
    character_id: null
  })

  const [isEdit, setIsEdit] = useState(isCreate)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!isCreate) {
      const existing = scenarios.find(s => s.id === scenarioId)
      console.log('[ScenarioProfileView] Existing in list:', existing)
      if (existing) {
        setDraft(existing)
      } else {
        console.log('[ScenarioProfileView] Not in list, fetching...', scenarioId)
        scenariosApi.getScenario(scenarioId)
          .then(res => {
            console.log('[ScenarioProfileView] Fetched data:', res)
            setDraft(res)
          })
          .catch(err => console.error('[ScenarioProfileView] Fetch error:', err))
      }
    }
  }, [scenarioId, scenarios, isCreate])

  const handleSave = async () => {
    if (!draft.character_id) {
      alert('Пожалуйста, выберите персонажа для сценария.')
      return
    }
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
    <div className={`${styles.characterProfileOverlay} ${!isEdit ? styles.nonEditing : ''}`}>
      <header className={styles.backHeader}>
        <button className={styles.backBtn} onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
        </button>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span className={styles.mainSubtitle}>Панель управления сценарием</span>
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900 }}>
            {isCreate ? 'Новый сценарий' : draft.title}
          </h2>
        </div>
      </header>

      <div className={styles.characterProfileContent}>
        {/* LEFT CARD: Sidebar/Metadata */}
        <aside className={styles.sidebarWrapper}>
          <div className={styles.charSidebarCard}>
            <div className={styles.charBasicInfo} style={{ paddingTop: '24px' }}>
              {isEdit ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                  <div className={styles.detailGroup}>
                    <div className={styles.detailTitle}>Заголовок</div>
                    <Input 
                      value={draft.title || ''} 
                      onChange={e => setDraft(prev => ({ ...prev, title: e.target.value }))} 
                      placeholder="Название сценария..."
                    />
                  </div>

                  <div className={styles.detailGroup}>
                    <div className={styles.detailTitle}>Персонаж (привязка)</div>
                    <SearchableSelect 
                      options={characters.map(c => ({ id: c.id, name: c.name, subtext: c.fandom }))}
                      value={draft.character_id || ''}
                      onChange={val => setDraft(prev => ({ ...prev, character_id: val || null }))}
                      placeholder="Выберите персонажа..."
                    />
                  </div>

                  <div className={styles.detailGroup}>
                    <div className={styles.detailTitle}>Локация</div>
                    <Input 
                      value={draft.location || ''} 
                      onChange={e => setDraft(prev => ({ ...prev, location: e.target.value }))} 
                      placeholder="Где происходит действие..."
                    />
                  </div>
                </div>
              ) : (
                <>
                  <h1 className={styles.charProfileName}>{draft.title}</h1>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                    <Badge variant="orange">
                      {characters.find(c => c.id === draft.character_id)?.name || 'Персонаж'}
                    </Badge>
                    {draft.location && <Badge variant="teal">{draft.location}</Badge>}
                  </div>
                </>
              )}
              
              <div style={{ marginTop: '20px' }}>
                <div className={styles.detailTitle}>Описание для карточки</div>
                {isEdit ? (
                  <textarea 
                    className={styles.editTextarea}
                    value={draft.description || ''}
                    onChange={e => setDraft(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Краткое описание..."
                    style={{ minHeight: '80px', fontSize: '0.85rem' }}
                  />
                ) : (
                  <p style={{ 
                    fontSize: '0.9rem', 
                    color: 'rgba(255,255,255,0.45)', 
                    lineHeight: '1.6',
                    margin: 0,
                    fontWeight: 500
                  }}>
                    {draft.description}
                  </p>
                )}
              </div>
            </div>

            <div className={styles.charStatsGrid}>
              <div className={styles.charStatBox}>
                <span className={styles.statLabel}>Всего чатов</span>
                <span className={styles.statValue}>0</span>
              </div>
              <div className={styles.charStatBox}>
                <span className={styles.statLabel}>За месяц</span>
                <span className={styles.statValue}>0</span>
              </div>
            </div>
          </div>
        </aside>

        {/* RIGHT CARD: Points and Actions */}
        <main className={styles.mainContentWrapper}>
          <div className={styles.detailsCard}>
            <div className={styles.detailGroup}>
              <div className={styles.detailTitle}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Точка А (Стартовая ситуация)
              </div>
              {isEdit ? (
                <textarea 
                  className={styles.editTextarea}
                  value={draft.start_point || ''}
                  onChange={e => setDraft(prev => ({ ...prev, start_point: e.target.value }))}
                  placeholder="Как начинается сцена..."
                  style={{ minHeight: '180px' }}
                />
              ) : (
                <p className={styles.detailText} style={{ whiteSpace: 'pre-wrap' }}>
                  {draft.start_point || 'Начальная точка не задана.'}
                </p>
              )}
            </div>

            <div className={styles.detailGroup}>
              <div className={styles.detailTitle}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                Точка Б (Финальная цель)
              </div>
              {isEdit ? (
                <textarea 
                  className={styles.editTextarea}
                  value={draft.end_point || ''}
                  onChange={e => setDraft(prev => ({ ...prev, end_point: e.target.value }))}
                  placeholder="К чему должен прийти сюжет..."
                  style={{ minHeight: '180px' }}
                />
              ) : (
                <p className={styles.detailText} style={{ whiteSpace: 'pre-wrap' }}>
                  {draft.end_point || 'Конечная цель не задана.'}
                </p>
              )}
            </div>

            <div className={styles.detailGroup}>
              <div className={styles.detailTitle}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                Внутреннее описание (Скрыто от игрока)
              </div>
              {isEdit ? (
                <textarea 
                  className={styles.editTextarea}
                  value={draft.internal_description || ''}
                  onChange={e => setDraft(prev => ({ ...prev, internal_description: e.target.value }))}
                  placeholder="Пропишите здесь истинную суть сюжета, скрытые угрозы и нюансы для ИИ..."
                  style={{ minHeight: '180px' }}
                />
              ) : (
                <p className={styles.detailText} style={{ whiteSpace: 'pre-wrap', color: 'rgba(255,255,255,0.4)' }}>
                  {draft.internal_description || 'Внутреннее описание не задано.'}
                </p>
              )}
            </div>

            <div className={styles.actionRow} style={{ marginTop: 'auto', paddingTop: '24px', justifyContent: 'space-between' }}>
              {isEdit ? (
                <div style={{ display: 'flex', gap: '12px' }}>
                  {!isCreate && <Button variant="ghost" onClick={() => setIsEdit(false)}>Отмена</Button>}
                  <Button variant="orange" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? 'Сохранение...' : isCreate ? 'Создать сценарий' : 'Сохранить изменения'}
                  </Button>
                </div>
              ) : (
                <>
                  <Button variant="orange" onClick={() => setIsEdit(true)}>Редактировать</Button>
                  <Button variant="danger" onClick={handleDelete} disabled={isDeleting}>Удалить</Button>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
