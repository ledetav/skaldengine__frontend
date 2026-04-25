import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styles from './Lorebooks.module.css'
import { lorebooksApi } from '@/core/api/lorebooks'
import type { Lorebook, LorebookEntry } from '@/core/types/chat'
import { useToast, Button, Card, Input, Textarea } from '@/components/ui'

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
    <Card style={{ padding: '28px', marginBottom: '24px' }}>
      <div className={styles.panelTitle}>Добавить запись</div>
      <form onSubmit={handleSubmit} noValidate>
        <div className={styles.formRow}>
          <div className={styles.inputRow}>
            <Input
              label="Ключевые слова"
              value={keywords}
              onChange={e => setKeywords(e.target.value)}
              placeholder="магия, заклинание, артефакт"
            />
            <div style={{ width: '100px' }}>
              <Input
                label="Приоритет"
                type="number"
                value={priority}
                onChange={e => setPriority(e.target.value)}
                min="0"
                max="100"
              />
            </div>
          </div>
          <Textarea
            label="Содержание"
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Факт, описание или правило мира..."
            rows={4}
          />
          <div className={styles.formActions}>
            <Button variant="ghost" type="button" onClick={onCancel}>Отмена</Button>
            <Button variant="primary" type="submit" loading={submitting}>
              Добавить запись
            </Button>
          </div>
        </div>
      </form>
    </Card>
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
    <Card style={{ padding: '28px', marginBottom: '24px' }}>
      <div className={styles.panelTitle}>Пакетный импорт (JSON)</div>
      <p className={styles.batchHint}>
        Вставьте массив JSON в формате:
        {' '}[&#123;"keywords": ["слово1"], "content": "Текст", "priority": 5&#125;, ...]
      </p>
      {result && <div className={styles.batchResult}>{result}</div>}
      {parseError && <div className={styles.batchError}>Ошибка парсинга: {parseError}</div>}
      <Textarea
        value={json}
        onChange={e => setJson(e.target.value)}
        placeholder={BATCH_EXAMPLE}
        rows={8}
        style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
      />
      <div className={styles.formActions} style={{ marginTop: 12 }}>
        <Button variant="ghost" onClick={onCancel}>Закрыть</Button>
        <Button variant="primary" onClick={handleImport} disabled={!json.trim()}>
          Импортировать
        </Button>
      </div>
    </Card>
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
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
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

function ConfirmDeleteLorebook({ name, onConfirm, onCancel }: { name: string, onConfirm: () => void, onCancel: () => void }) {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2 className={styles.modalTitle}>Удалить лорбук?</h2>
        <p className={styles.modalText}>
          «<strong style={{ color: '#fff' }}>{name}</strong>» будет удалён безвозвратно.
        </p>
        <div className={styles.modalActions}>
          <button className={styles.cancelBtn} onClick={onCancel}>Отмена</button>
          <button className={styles.dangerBtn} onClick={onConfirm}>Удалить</button>
        </div>
      </div>
    </div>
  )
}

export default function LorebookDetailScreen() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { success, error } = useToast()

  const [lorebook, setLorebook] = useState<Lorebook | null>(null)
  const [entries, setEntries] = useState<LorebookEntry[]>([])
  const [addMode, setAddMode] = useState<AddMode>('none')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!id) return
      try {
        setLoading(true)
        const data = await lorebooksApi.getLorebook(id)
        setLorebook(data)
        setEntries(data.entries || [])
      } catch (err) {
        error('Ошибка загрузки лорбука')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, error])

  if (loading) {
    return (
      <div className={styles.page} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <p style={{ color: 'rgba(255,255,255,0.5)' }}>Loading...</p>
      </div>
    )
  }

  if (!lorebook) {
    return (
      <div className={styles.page} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 16 }}>Лорбук не найден</h2>
          <button className={styles.cancelBtn} onClick={() => navigate('/lorebooks')}>Вернуться к списку</button>
        </div>
      </div>
    )
  }

  const handleAddEntry = async (entry: Omit<LorebookEntry, 'id' | 'lorebook_id' | 'created_at'>) => {
    try {
      if (!id) return;
      await lorebooksApi.createLorebookEntry(id, {
        keywords: entry.keywords,
        content: entry.content,
        priority: entry.priority
      });
      // We can refetch or just push to local state loosely for now:
      const newEntry: LorebookEntry = {
        id: `entry-${Date.now()}`, // Temporary ID if we don't return the full model right away
        lorebook_id: lorebook.id,
        ...entry,
        created_at: new Date().toISOString(),
      }
      setEntries([...entries, newEntry])
      setAddMode('none')
      success('Запись добавлена')
    } catch (err) {
      error('Ошибка при добавлении записи')
    }
  }

  const handleBatchImport = async (newEntries: Omit<LorebookEntry, 'id' | 'lorebook_id' | 'created_at'>[]) => {
    try {
      if (!id) return;
      
      await lorebooksApi.createLorebookEntriesBulk(id, newEntries)

      setAddMode('none')
      success(`Импортировано ${newEntries.length} записей. Пожалуйста, обновите страницу для просмотра.`)
    } catch (err) {
        error('Ошибка при импорте записей')
    }
  }

  const handleDeleteEntry = async (entryId: string) => {
    try {
      if (!id) return;
      // Depending on structure sometimes fake ids are generated, but if it has a real UUID it comes from GET
      await lorebooksApi.deleteLorebookEntry(id, entryId);
      setEntries(entries.filter(e => e.id !== entryId))
      success('Запись удалена')
    } catch (err) {
      error('Ошибка при удалении записи')
    }
  }

  const handleDeleteLorebook = async () => {
    try {
      if (!id) return;
      await lorebooksApi.deleteLorebook(id);
      success('Лорбук удалён');
      navigate('/lorebooks');
    } catch (err) {
      error('Ошибка при удалении лорбука');
    } finally {
      setShowDeleteConfirm(false);
    }
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
      <div className={styles.bgOrbs}>
        <div className={`${styles.orb} ${styles.orbPurple}`} />
        <div className={`${styles.orb} ${styles.orbFuchsia}`} />
      </div>

      <div className={styles.content}>
        {/* Header */}
        <div className={styles.detailTop}>
          <div className={styles.headerLeft}>
            <button className={styles.backBtn} onClick={() => navigate('/lorebooks')}>
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
            <button className={styles.editBtn} onClick={() => navigate(`/lorebooks/${lorebook.id}/edit`)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Редактировать
            </button>
            <button className={`${styles.editBtn} ${styles.dangerBtnInline}`} onClick={() => setShowDeleteConfirm(true)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
              Удалить
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
                <Button variant="ghost" onClick={handleExport} style={{ fontSize: '0.75rem' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Экспорт
                </Button>
              )}
              <Button
                variant="ghost"
                onClick={() => setAddMode(m => m === 'batch' ? 'none' : 'batch')}
                style={{ opacity: addMode === 'batch' ? 1 : 0.7 }}
              >
                Батч-импорт
              </Button>
              <Button
                variant="primary"
                onClick={() => setAddMode(m => m === 'single' ? 'none' : 'single')}
              >
                + Добавить запись
              </Button>
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

      {showDeleteConfirm && (
        <ConfirmDeleteLorebook
          name={lorebook.name}
          onConfirm={handleDeleteLorebook}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  )
}
