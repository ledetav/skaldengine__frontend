import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styles from './Lorebooks.module.css'
import { mockLorebooks } from './lorebookMockData'
import type { Lorebook, LorebookEntry } from './lorebookMockData'
import { useToast } from '@/components/ui/Toast'

/* ─── Add Single Entry Panel ───────────────────── */
function AddSingleEntry({ onAdd, onCancel }: {
  onAdd: (entry: Omit<LorebookEntry, 'id' | 'lorebook_id' | 'created_at'>) => void
  onCancel: () => void
}) {
  const [keywords, setKeywords] = useState('')
  const [content, setContent] = useState('')
  const [priority, setPriority] = useState('5')
  const [submitting, setSubmitting] = useState(false)
  const { error } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!keywords.trim() || !content.trim()) {
      error('Ключевые слова и контент обязательны')
      return
    }
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 500))
    onAdd({
      keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
      content: content.trim(),
      priority: parseInt(priority) || 5,
    })
    setSubmitting(false)
  }

  return (
    <div className={styles.addEntryPanel}>
      <div className={styles.panelTitle}>Добавить запись</div>
      <form onSubmit={handleSubmit} noValidate>
        <div className={styles.formRow}>
          <div className={styles.inputRow}>
            <input
              className={styles.formInput}
              value={keywords}
              onChange={e => setKeywords(e.target.value)}
              placeholder="Ключевые слова через запятую: магия, заклинание, артефакт"
            />
            <input
              className={`${styles.formInput} ${styles.numberInput}`}
              type="number"
              value={priority}
              onChange={e => setPriority(e.target.value)}
              min={0}
              max={100}
              title="Приоритет (0-100)"
            />
          </div>
          <textarea
            className={styles.formTextarea}
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Содержание записи — факт, описание, правило мира..."
            rows={4}
          />
          <div className={styles.formActions}>
            <button type="button" className={styles.cancelBtn} onClick={onCancel}>Отмена</button>
            <button type="submit" className={styles.submitBtn} disabled={submitting}>
              {submitting ? 'Добавляем...' : 'Добавить запись'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

/* ─── Batch Import Panel ───────────────────────── */
const BATCH_EXAMPLE = JSON.stringify([
  { keywords: ['пример', 'ключ'], content: 'Описание факта...', priority: 5 },
  { keywords: ['другой'], content: 'Ещё один факт.', priority: 8 },
], null, 2)

function BatchImportPanel({ onImport, onCancel }: {
  onImport: (entries: Omit<LorebookEntry, 'id' | 'lorebook_id' | 'created_at'>[]) => void
  onCancel: () => void
}) {
  const [json, setJson] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)

  const handleImport = () => {
    setResult(null)
    setParseError(null)
    try {
      const parsed = JSON.parse(json)
      if (!Array.isArray(parsed)) throw new Error('Ожидается массив объектов JSON')
      const entries = parsed.map((item: any, i: number) => {
        if (!Array.isArray(item.keywords)) throw new Error(`Запись ${i + 1}: поле "keywords" должно быть массивом`)
        if (typeof item.content !== 'string') throw new Error(`Запись ${i + 1}: поле "content" должно быть строкой`)
        return {
          keywords: item.keywords as string[],
          content: item.content as string,
          priority: typeof item.priority === 'number' ? item.priority : 5,
        }
      })
      onImport(entries)
      setResult(`✓ Импортировано ${entries.length} записей`)
    } catch (e: any) {
      setParseError(e.message)
    }
  }

  return (
    <div className={styles.addEntryPanel}>
      <div className={styles.panelTitle}>Пакетный импорт (JSON)</div>
      <p className={styles.batchHint}>
        Вставьте массив JSON в формате:
        {' '}[&#123;"keywords": ["слово1"], "content": "Текст", "priority": 5&#125;, ...]
      </p>
      {result && <div className={styles.batchResult}>{result}</div>}
      {parseError && <div className={styles.batchError}>Ошибка парсинга: {parseError}</div>}
      <textarea
        className={styles.formTextarea}
        value={json}
        onChange={e => setJson(e.target.value)}
        placeholder={BATCH_EXAMPLE}
        rows={8}
        style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
      />
      <div className={styles.formActions} style={{ marginTop: 12 }}>
        <button className={styles.cancelBtn} onClick={onCancel}>Закрыть</button>
        <button className={styles.submitBtn} onClick={handleImport} disabled={!json.trim()}>
          Импортировать
        </button>
      </div>
    </div>
  )
}

/* ─── Entries Table ────────────────────────────── */
function EntriesTable({ entries, onDelete }: {
  entries: LorebookEntry[]
  onDelete: (id: string) => void
}) {
  if (entries.length === 0) {
    return (
      <div style={{ padding: '48px 28px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.875rem' }}>
        Записей пока нет — добавьте первую через форму ниже
      </div>
    )
  }

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th style={{ width: 200 }}>Ключевые слова</th>
            <th>Содержание</th>
            <th style={{ width: 80 }}>Приоритет</th>
            <th style={{ width: 90 }}>Добавлено</th>
            <th style={{ width: 60 }}></th>
          </tr>
        </thead>
        <tbody>
          {entries.map(entry => (
            <tr key={entry.id}>
              <td>
                <div className={styles.keywords}>
                  {entry.keywords.map(kw => (
                    <span key={kw} className={styles.keyword}>{kw}</span>
                  ))}
                </div>
              </td>
              <td className={styles.contentCell}>{entry.content}</td>
              <td className={styles.priorityCell}>{entry.priority}</td>
              <td style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap' }}>
                {new Date(entry.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
              </td>
              <td>
                <div className={styles.rowActions}>
                  <button
                    className={`${styles.iconBtn} ${styles['iconBtn--danger']}`}
                    onClick={() => onDelete(entry.id)}
                    title="Удалить запись"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ─── Main Component ───────────────────────────── */
type AddMode = 'none' | 'single' | 'batch'

export default function LorebookDetailScreen() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { success } = useToast()

  const found = mockLorebooks.find(l => l.id === id)
  const [lorebook] = useState<Lorebook | null>(found || null)
  const [entries, setEntries] = useState<LorebookEntry[]>(found?.entries || [])
  const [addMode, setAddMode] = useState<AddMode>('none')

  if (!lorebook) {
    return (
      <div className={styles.page} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 16 }}>Лорбук не найден</h2>
          <button className={styles.cancelBtn} onClick={() => navigate('/lorebooks/debug')}>Вернуться к списку</button>
        </div>
      </div>
    )
  }

  const handleAddEntry = (entry: Omit<LorebookEntry, 'id' | 'lorebook_id' | 'created_at'>) => {
    const newEntry: LorebookEntry = {
      id: `entry-${Date.now()}`,
      lorebook_id: lorebook.id,
      ...entry,
      created_at: new Date().toISOString(),
    }
    setEntries(prev => [...prev, newEntry])
    setAddMode('none')
    success('Запись добавлена')
  }

  const handleBatchImport = (newEntries: Omit<LorebookEntry, 'id' | 'lorebook_id' | 'created_at'>[]) => {
    const created: LorebookEntry[] = newEntries.map(e => ({
      id: `entry-${Date.now()}-${Math.random()}`,
      lorebook_id: lorebook.id,
      ...e,
      created_at: new Date().toISOString(),
    }))
    setEntries(prev => [...prev, ...created])
    success(`Импортировано ${created.length} записей`)
  }

  const handleDeleteEntry = (entryId: string) => {
    setEntries(prev => prev.filter(e => e.id !== entryId))
    success('Запись удалена')
  }

  const handleExport = () => {
    const data = entries.map(({ keywords, content, priority }) => ({ keywords, content, priority }))
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${lorebook.name.replace(/\s+/g, '_')}_entries.json`
    a.click()
    URL.revokeObjectURL(url)
    success(`Экспортировано ${entries.length} записей`)
  }

  return (
    <div className={styles.page}>
      <div className={styles.debugBanner}>
        🔧 Debug — GET /lorebooks/entries/&#123;id&#125; · POST /lorebooks/{lorebook.id}/entries · DELETE /lorebooks/entries/&#123;id&#125;
      </div>

      <div className={styles.bgOrbs}>
        <div className={`${styles.orb} ${styles.orbPurple}`} />
        <div className={`${styles.orb} ${styles.orbFuchsia}`} />
      </div>

      <div className={styles.content}>
        {/* Header */}
        <div className={styles.detailTop}>
          <div className={styles.headerLeft}>
            <button className={styles.backBtn} onClick={() => navigate('/lorebooks/debug')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
              </svg>
              Все лорбуки
            </button>
            <h1 className={styles.title}>{lorebook.name}</h1>
            {lorebook.description && (
              <p className={styles.subtitle}>{lorebook.description}</p>
            )}
          </div>
          <div className={styles.detailActions}>
            <button className={styles.editBtn} onClick={() => navigate(`/lorebooks/${lorebook.id}/edit/debug`)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Редактировать
            </button>
          </div>
        </div>

        {/* Entries panel */}
        <div className={styles.entriesPanel}>
          <div className={styles.entriesHeader}>
            <div className={styles.entriesTitle}>
              Записи
              <span className={styles.entriesCount}>{entries.length}</span>
            </div>
            <div className={styles.entriesActions}>
              {entries.length > 0 && (
                <button className={styles.exportBtn} onClick={handleExport}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Экспорт JSON
                </button>
              )}
              <button
                className={styles.editBtn}
                onClick={() => setAddMode(m => m === 'batch' ? 'none' : 'batch')}
                style={addMode === 'batch' ? { borderColor: 'var(--border-purple)', color: 'var(--accent-purple)' } : {}}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/>
                </svg>
                Батч-импорт
              </button>
              <button
                className={styles.createBtn}
                onClick={() => setAddMode(m => m === 'single' ? 'none' : 'single')}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Добавить запись
              </button>
            </div>
          </div>

          <EntriesTable entries={entries} onDelete={handleDeleteEntry} />
        </div>

        {/* Add forms */}
        {addMode === 'single' && (
          <AddSingleEntry
            onAdd={handleAddEntry}
            onCancel={() => setAddMode('none')}
          />
        )}
        {addMode === 'batch' && (
          <BatchImportPanel
            onImport={handleBatchImport}
            onCancel={() => setAddMode('none')}
          />
        )}
      </div>
    </div>
  )
}
