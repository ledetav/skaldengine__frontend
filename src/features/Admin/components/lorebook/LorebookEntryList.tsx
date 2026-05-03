import { useMemo, type ChangeEvent } from 'react'
import { Badge, Input } from '@/components/ui'
import { SearchableSelect } from '../SearchableSelect'
import { Pagination } from '../Pagination'
import { ConfirmModal } from '@/components/common'
import { ENTRY_CATEGORIES, CATEGORY_MAP } from './lorebookConstants'
import styles from '../../styles'
import type { LorebookEntry } from '../../types'

interface LorebookEntryListProps {
  lorebookType: 'fandom' | 'character' | 'persona'
  entries: LorebookEntry[]
  entriesTotal: number
  entriesPage: number
  entrySort: 'created_at' | 'priority'
  entryCategoryFilter: string
  entrySearch: string
  isLoading: boolean

  editingEntryId: string | null
  editKeywords: string
  editContent: string
  editCategory: string
  editAlwaysInc: boolean
  editPriority: number

  showDeleteModal: boolean
  onDeleteRequest: (id: string) => void
  onDeleteConfirm: () => void
  onDeleteCancel: () => void

  onPageChange: (page: number) => void
  onSortChange: (sort: 'created_at' | 'priority') => void
  onCategoryFilterChange: (cat: string) => void
  onSearchChange: (s: string) => void

  onEditStart: (entry: LorebookEntry) => void
  onEditSave: (entryId: string) => void
  onEditCancel: () => void
  onEditKeywordsChange: (v: string) => void
  onEditContentChange: (v: string) => void
  onEditCategoryChange: (v: string) => void
  onEditAlwaysIncChange: (v: boolean) => void
  onEditPriorityChange: (v: number) => void
}

export function LorebookEntryList({
  lorebookType,
  entries, entriesTotal, entriesPage, entrySort, entryCategoryFilter, entrySearch, isLoading,
  editingEntryId, editKeywords, editContent, editCategory, editAlwaysInc, editPriority,
  showDeleteModal, onDeleteRequest, onDeleteConfirm, onDeleteCancel,
  onPageChange, onSortChange, onCategoryFilterChange, onSearchChange,
  onEditStart, onEditSave, onEditCancel,
  onEditKeywordsChange, onEditContentChange, onEditCategoryChange, onEditAlwaysIncChange, onEditPriorityChange,
}: LorebookEntryListProps) {
  const badgeVariant = lorebookType === 'fandom' ? 'fuchsia' : lorebookType === 'persona' ? 'teal' : 'purple'

  const filteredEntries = useMemo(() => {
    let result = entries
    if (entryCategoryFilter !== 'all') {
      result = result.filter(e => e.category === entryCategoryFilter)
    }
    if (entrySearch) {
      const s = entrySearch.toLowerCase()
      result = result.filter(e =>
        e.content.toLowerCase().includes(s) ||
        e.keywords.some(k => k.toLowerCase().includes(s))
      )
    }
    return result
  }, [entries, entryCategoryFilter, entrySearch])

  return (
    <div className={styles.detailGroup}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div className={styles.detailTitle}>Записи ({entriesTotal})</div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search */}
          <div className={styles.searchWrapper} style={{ margin: 0, height: '36px', width: '170px' }}>
            <svg className={styles.searchIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Поиск..."
              className={styles.searchBox}
              style={{ padding: '6px 10px 6px 32px', fontSize: '0.75rem', height: '36px' }}
              value={entrySearch}
              onChange={(e: ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
            />
          </div>

          {/* Sort */}
          <div className={styles.roleBtnGroup} style={{ margin: 0 }}>
            <button
              className={`${styles.roleBtn} ${entrySort === 'created_at' ? styles.roleBtnActive : ''}`}
              onClick={() => onSortChange('created_at')}
              style={{ padding: '6px 10px', fontSize: '0.7rem', height: '36px' }}
            >
              Новые
            </button>
            <button
              className={`${styles.roleBtn} ${entrySort === 'priority' ? styles.roleBtnActive : ''}`}
              onClick={() => onSortChange('priority')}
              style={{ padding: '6px 10px', fontSize: '0.7rem', height: '36px' }}
            >
              Приоритет
            </button>
          </div>

          {/* Category filter */}
          <div style={{ width: '170px' }}>
            <SearchableSelect
              options={[{ id: 'all', name: 'Все категории' }, ...ENTRY_CATEGORIES]}
              value={entryCategoryFilter}
              onChange={onCategoryFilterChange}
              placeholder="Фильтр..."
              className={styles.compact}
            />
          </div>
        </div>
      </header>

      {/* Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.compactTable}>
          <thead>
            <tr>
              <th style={{ width: '200px' }}>Тэги</th>
              <th>Содержание</th>
              <th style={{ width: '120px' }}>Категория</th>
              <th style={{ width: '80px' }}>Приор.</th>
              <th style={{ width: '100px', textAlign: 'right' }}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredEntries.slice(0, 20).map((entry, i) => {
              const isEditing = editingEntryId === entry.id
              return (
                <tr key={entry.id || i} className={isEditing ? styles.tableEditingRow : ''}>
                  {/* Keywords */}
                  <td>
                    {isEditing ? (
                      <Input
                        value={editKeywords}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => onEditKeywordsChange(e.target.value)}
                        placeholder="Тэги через запятую"
                        style={{ fontSize: '0.8rem', height: '32px' }}
                        autoFocus
                      />
                    ) : (
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {entry.keywords?.flatMap(k => k.split(',').map(s => s.trim())).filter(Boolean).map((kw, idx) => (
                          <Badge key={`${kw}-${idx}`} variant={badgeVariant} style={{ fontSize: '0.6rem', padding: '2px 6px' }}>{kw}</Badge>
                        ))}
                      </div>
                    )}
                  </td>

                  {/* Content */}
                  <td>
                    {isEditing ? (
                      <textarea
                        className={styles.editTextarea}
                        value={editContent}
                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onEditContentChange(e.target.value)}
                        style={{ minHeight: '60px', fontSize: '0.85rem', width: '100%', background: 'rgba(0,0,0,0.2)' }}
                      />
                    ) : (
                      <div style={{ fontSize: '0.85rem', opacity: 0.7, maxWidth: '500px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {entry.content}
                      </div>
                    )}
                  </td>

                  {/* Category */}
                  <td>
                    {isEditing ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <SearchableSelect
                          options={ENTRY_CATEGORIES}
                          value={editCategory}
                          onChange={onEditCategoryChange}
                          className={styles.compact}
                          placeholder="Категория"
                        />
                        <div
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', opacity: editAlwaysInc ? 1 : 0.5 }}
                          onClick={() => onEditAlwaysIncChange(!editAlwaysInc)}
                        >
                          <div style={{
                            width: '14px', height: '14px', border: '1.5px solid var(--accent-fuchsia)', borderRadius: '3px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: editAlwaysInc ? 'var(--accent-fuchsia)' : 'transparent'
                          }}>
                            {editAlwaysInc && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                          </div>
                          <span style={{ fontSize: '0.7rem' }}>В памяти</span>
                        </div>
                        <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                          {[1, 2, 3, 4, 5].map(p => (
                            <button
                              key={p}
                              className={`${styles.roleBtn} ${editPriority === p ? styles.roleBtnActive : ''}`}
                              onClick={() => onEditPriorityChange(p)}
                              style={{ padding: '2px 8px', fontSize: '0.7rem', flex: 1 }}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', opacity: 0.8 }}>
                        <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-teal)' }}>
                          {CATEGORY_MAP[entry.category || 'fact'] || entry.category}
                        </span>
                        {entry.is_always_included && (
                          <span title="Всегда в памяти">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--accent-fuchsia)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                          </span>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Priority */}
                  <td>
                    <div style={{ fontSize: '0.8rem', fontWeight: '600', color: entry.priority >= 4 ? 'var(--accent-orange)' : 'inherit', opacity: entry.priority === 1 ? 0.4 : 0.9 }}>
                      {entry.priority}
                    </div>
                  </td>

                  {/* Actions */}
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                      {isEditing ? (
                        <>
                          <button className={styles.iconBtn} onClick={() => onEditSave(entry.id)} style={{ color: 'var(--accent-teal)' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          </button>
                          <button className={styles.iconBtn} onClick={onEditCancel} style={{ color: 'var(--accent-red)' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                          </button>
                        </>
                      ) : (
                        <>
                          <button className={styles.iconBtn} onClick={() => onEditStart(entry)}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                          </button>
                          <button className={styles.iconBtn} onClick={() => onDeleteRequest(entry.id)} style={{ opacity: 0.5 }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {isLoading && <div style={{ padding: '20px', textAlign: 'center', opacity: 0.5 }}>Загрузка записей...</div>}
      </div>

      <Pagination
        currentPage={entriesPage}
        totalItems={entriesTotal}
        pageSize={20}
        onPageChange={onPageChange}
      />

      <ConfirmModal
        isOpen={showDeleteModal}
        title="Удалить запись?"
        description="Это действие необратимо. Запись будет полностью удалена из лорбука."
        confirmLabel="Да, удалить"
        onConfirm={onDeleteConfirm}
        onCancel={onDeleteCancel}
      />
    </div>
  )
}
