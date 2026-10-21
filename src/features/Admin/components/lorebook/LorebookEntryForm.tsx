import { useState, type ChangeEvent } from 'react'
import { Button, Card, Input } from '@/components/ui'
import { SearchableSelect } from '../SearchableSelect'
import { ENTRY_CATEGORIES } from './lorebookConstants'
import styles from '../../styles'

interface LorebookEntryFormProps {
  lorebookId: string
  onSaved: () => void
  onCancel: () => void
}

export function LorebookEntryForm({ lorebookId, onSaved, onCancel }: LorebookEntryFormProps) {
  const [addType, setAddType] = useState<'single' | 'batch' | 'json'>('single')

  const [keywords, setKeywords] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('fact')
  const [alwaysInc, setAlwaysInc] = useState(false)
  const [priority, setPriority] = useState(3)
  const [batchText, setBatchText] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (isSaving) return
    setIsSaving(true)
    try {
      const { lorebooksApi } = await import('@/core/api/lorebooks')

      if (addType === 'single') {
        await lorebooksApi.createLorebookEntry(lorebookId, {
          keywords: keywords.split(',').map((k: string) => k.trim()).filter(Boolean),
          content,
          category,
          is_always_included: alwaysInc,
          priority
        })
      } else if (addType === 'batch') {
        const entries = batchText.split('\n')
          .map(line => {
            const [kw, cnt, cat] = line.split('|').map(s => s.trim())
            return {
              keywords: kw ? [kw] : [],
              content: cnt || '',
              category: cat || category,
              is_always_included: alwaysInc,
              priority
            }
          })
          .filter(e => e.keywords.length > 0 && e.content)
        await lorebooksApi.createLorebookEntriesBulk(lorebookId, entries)
      } else {
        const entries = JSON.parse(batchText)
        await lorebooksApi.createLorebookEntriesBulk(
          lorebookId,
          entries.map((e: any) => ({
            keywords: e.keywords || [],
            content: e.content || '',
            category: e.category || category,
            is_always_included: e.is_always_included !== undefined ? e.is_always_included : alwaysInc,
            priority: e.priority || priority
          }))
        )
      }

      // Reset form
      setKeywords('')
      setContent('')
      setBatchText('')
      onSaved()
    } catch (e: any) {
      console.error('Entry save error:', e)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card style={{ padding: '24px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Mode switcher */}
      <div className={styles.roleBtnGroup} style={{ margin: 0, alignSelf: 'flex-start' }}>
        {(['single', 'batch', 'json'] as const).map(t => (
          <button
            key={t}
            className={`${styles.roleBtn} ${addType === t ? styles.roleBtnActive : ''}`}
            onClick={() => setAddType(t)}
          >
            {{ single: 'Одиночная', batch: 'Массовая', json: 'JSON' }[t]}
          </button>
        ))}
      </div>

      {/* Single entry */}
      {addType === 'single' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Input
            placeholder="Ключевые слова (через запятую)"
            value={keywords}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setKeywords(e.target.value)}
          />
          <textarea
            className={styles.editTextarea}
            placeholder="Содержание записи..."
            value={content}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
            style={{ minHeight: '80px' }}
          />
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '140px' }}>
              <SearchableSelect
                options={ENTRY_CATEGORIES}
                value={category}
                onChange={setCategory}
                placeholder="Категория..."
              />
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', opacity: 0.6, whiteSpace: 'nowrap' }}>Приоритет:</span>
              <div className={styles.roleBtnGroup} style={{ margin: 0 }}>
                {[1, 2, 3, 4, 5].map(p => (
                  <button
                    key={p}
                    className={`${styles.roleBtn} ${priority === p ? styles.roleBtnActive : ''}`}
                    onClick={() => setPriority(p)}
                    style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', opacity: alwaysInc ? 1 : 0.5 }}
              onClick={() => setAlwaysInc(!alwaysInc)}
            >
              <div style={{
                width: '16px', height: '16px', border: '2px solid var(--accent-fuchsia)', borderRadius: '4px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: alwaysInc ? 'var(--accent-fuchsia)' : 'transparent'
              }}>
                {alwaysInc && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </div>
              <span style={{ fontSize: '0.75rem' }}>Всегда в памяти</span>
            </div>
          </div>
          <div className={styles.infoNote} style={{ marginTop: '4px', marginBottom: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', color: 'var(--accent-teal)' }}>
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            <span style={{ fontSize: '0.75rem' }}>Чем выше приоритет (1→5), тем больше шансов у факта попасть в контекст при нехватке места.</span>
          </div>
        </div>
      )}

      {/* Batch / JSON */}
      {(addType === 'batch' || addType === 'json') && (
        <textarea
          className={styles.editTextarea}
          placeholder={
            addType === 'batch'
              ? 'Формат: ключевое слово | описание | категория (опционально)'
              : '[{"keywords": ["слово"], "content": "описание", "category": "appearance"}, ...]'
          }
          value={batchText}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setBatchText(e.target.value)}
          style={{ minHeight: '150px', fontFamily: 'monospace', fontSize: '0.8rem' }}
        />
      )}

      <div style={{ display: 'flex', gap: '10px' }}>
        <Button variant="orange" onClick={handleSave} loading={isSaving}>
          Сохранить записи
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          Отмена
        </Button>
      </div>
    </Card>
  )
}
