import { useState, useMemo, type ChangeEvent, type ReactNode } from 'react'
import { Badge } from '@/components/ui'
import { ConfirmModal } from '@/components/common'
import styles from '../../styles'
import type { Lorebook, Character, UserPersona } from '../../types'
import { LB_CATEGORY_MAP } from './lorebookConstants'

export interface LorebookListViewProps {
  initialType: 'fandom' | 'character' | 'persona'
  lorebooks: Lorebook[]
  characters?: Character[]
  personas?: UserPersona[]
  onToggleFilter?: () => void
  isFilterActive?: boolean
  onSort?: (field: string) => void
  renderSortIcon?: (field: string) => ReactNode
  onView: (id: string) => void
  onEdit: (id: string) => void
  onCreate: () => void
  onDelete: (id: string) => Promise<void>
}

type ViewMode = 'grid' | 'table'

/**
 * Компонент представления списка лорбуков (таблица / карточки) в админ-панели.
 */
export function LorebookListView({
  initialType,
  lorebooks,
  characters = [],
  personas = [],
  onToggleFilter,
  isFilterActive,
  onSort,
  renderSortIcon,
  onView,
  onEdit,
  onCreate,
  onDelete,
}: LorebookListViewProps) {
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [lbToDeleteId, setLbToDeleteId] = useState<string | null>(null)

  /**
   * Отфильтрованный список лорбуков по подтипу (фандомный, персонажа или персоны) и строке поиска.
   */
  const filteredLorebooks = useMemo(() => {
    return lorebooks.filter(l => {
      const s = search.toLowerCase()
      const matches = l.name.toLowerCase().includes(s) ||
                      l.fandom?.toLowerCase().includes(s) ||
                      l.user_persona_name?.toLowerCase().includes(s)

      if (initialType === 'fandom') return matches && !!l.fandom && !l.character_id && !l.user_persona_id
      if (initialType === 'character') return matches && !!l.character_id
      if (initialType === 'persona') return matches && !!l.user_persona_id
      return matches
    })
  }, [lorebooks, search, initialType])

  /**
   * Открывает диалог подтверждения удаления для выбранного лорбука.
   */
  const handleDeleteRequest = (id: string) => {
    setLbToDeleteId(id)
    setShowDeleteModal(true)
  }

  /**
   * Подтверждает удаление лорбука и закрывает модальное окно.
   */
  const handleConfirmDelete = async () => {
    if (lbToDeleteId) {
      await onDelete(lbToDeleteId)
      setShowDeleteModal(false)
      setLbToDeleteId(null)
    }
  }

  return (
    <div className={styles.sectionContainer}>
      <div className={styles.sectionHeader}>
        <div className={styles.searchWrapper}>
          <svg className={styles.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Поиск по названию или привязке..."
            className={styles.searchBox}
            value={search}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          />
        </div>

        <div className={styles.sectionActions}>
          <div className={styles.viewControls}>
            <button className={`${styles.viewBtn} ${viewMode === 'table' ? styles.activeViewBtn : ''}`} onClick={() => setViewMode('table')}>Список</button>
            <button className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.activeViewBtn : ''}`} onClick={() => setViewMode('grid')}>Карточки</button>
            <button className={`${styles.filterBtn} ${isFilterActive ? styles.filterBtnActive : ''}`} onClick={onToggleFilter} style={{ padding: '8px', width: '38px', height: '38px', justifyContent: 'center', marginLeft: '8px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            </button>
          </div>
          {initialType !== 'persona' && <button className={styles.createBtn} onClick={onCreate}>+ Создать</button>}
        </div>
      </div>

      {viewMode === 'table' ? (
        <div className={styles.tableWrapper}>
          <table className={styles.compactTable}>
            <thead>
              <tr>
                <th onClick={() => onSort?.('name')} style={{ cursor: 'pointer' }}>Название {renderSortIcon?.('name')}</th>
                <th onClick={() => onSort?.(initialType === 'fandom' ? 'fandom' : initialType === 'persona' ? 'user_persona_id' : 'character_id')} style={{ cursor: 'pointer' }}>
                  {initialType === 'fandom' ? 'Вселенная' : initialType === 'persona' ? 'Владелец' : 'Персонаж'} {renderSortIcon?.(initialType === 'fandom' ? 'fandom' : initialType === 'persona' ? 'user_persona_id' : 'character_id')}
                </th>
                <th onClick={() => onSort?.('entries_count')} style={{ cursor: 'pointer' }}>Записей {renderSortIcon?.('entries_count')}</th>
                <th onClick={() => onSort?.('category')} style={{ cursor: 'pointer' }}>Категория {renderSortIcon?.('category')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredLorebooks.map(lb => (
                <tr key={lb.id} onClick={() => onView(lb.id)} style={{ cursor: 'pointer' }}>
                  <td><span style={{ fontWeight: 700 }}>{lb.name}</span></td>
                  <td>
                    <Badge variant={initialType === 'fandom' ? 'fuchsia' : initialType === 'persona' ? 'teal' : 'orange'}>
                      {initialType === 'fandom' ? lb.fandom : initialType === 'persona' ? (lb.user_persona_name || personas.find(p => p.id === lb.user_persona_id)?.name || lb.user_persona_id) : (lb.character_name || characters.find(c => c.id === lb.character_id)?.name || lb.character_id)}
                    </Badge>
                  </td>
                  <td>{lb.entries?.length || lb.entries_count || 0}</td>
                  <td>
                    <Badge variant="purple" style={{ alignSelf: 'flex-start' }}>{LB_CATEGORY_MAP[lb.category || 'general'] || lb.category || 'Общая'}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredLorebooks.map(lb => (
            <div key={lb.id} className={styles.adminCard} onClick={() => onView(lb.id)} style={{ cursor: 'pointer' }}>
              <div className={styles.cardActions}>
                <button className={`${styles.iconBtn} ${styles.editBtn}`} onClick={(e) => { e.stopPropagation(); onEdit(lb.id); }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                {initialType !== 'persona' && (
                  <div style={{ position: 'relative', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {lb.tags?.includes('main') && (characters.find(c => String(c.id) === String(lb.character_id))?.type === 'original') && (
                      <div className={styles.infoNote} style={{ margin: '-20px -20px 16px -20px', padding: '10px 16px', fontSize: '0.75rem', borderLeft: 'none', borderRight: 'none', borderTop: 'none', width: 'auto' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px', color: 'var(--accent-orange)', flexShrink: 0}}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                        Основной лорбук
                      </div>
                    )}
                    <button className={`${styles.iconBtn} ${styles.dangerBtn}`} style={{ '--btn-accent': 'var(--accent-red)' } as React.CSSProperties} onClick={(e) => { e.stopPropagation(); handleDeleteRequest(lb.id); }} disabled={lb.tags?.includes('main') && (characters.find(c => String(c.id) === String(lb.character_id))?.type === 'original')} title={lb.tags?.includes('main') && (characters.find(c => String(c.id) === String(lb.character_id))?.type === 'original') ? "Основной лорбук нельзя удалить" : "Удалить"}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                )}
              </div>
              <div className={styles.cardTop}>
                <div className={styles.cardInfo}>
                  <h3 className={styles.cardName}>{lb.name}</h3>
                  <div style={{ marginTop: '6px' }}>
                    <Badge variant={initialType === 'fandom' ? 'fuchsia' : initialType === 'persona' ? 'teal' : 'orange'}>
                      {initialType === 'fandom' ? lb.fandom : initialType === 'persona' ? (lb.user_persona_name || personas.find(p => p.id === lb.user_persona_id)?.name || lb.user_persona_id) : (lb.character_name || characters.find(c => c.id === lb.character_id)?.name || lb.character_id)}
                    </Badge>
                    <Badge variant="purple" style={{ marginLeft: '6px', alignSelf: 'flex-start' }}>{LB_CATEGORY_MAP[lb.category || 'general'] || lb.category || 'Общая'}</Badge>
                  </div>
                </div>
              </div>
              <div className={styles.cardStats} style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Записей</span><span className={styles.statValue}>{lb.entries?.length || lb.entries_count || 0}</span>
                </div>
                <div className={styles.statItem} style={{ gridColumn: 'span 2' }}>
                  <span className={styles.statLabel}>Лорбук</span><span className={styles.statValue} style={{ fontSize: '0.75rem', opacity: 0.4, fontFamily: 'monospace' }}>{initialType.toUpperCase()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showDeleteModal && (
        <ConfirmModal
          isOpen={showDeleteModal}
          title="Удалить лорбук?"
          description="Это действие необратимо. Лорбук будет полностью удален."
          confirmLabel="Да, удалить"
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setShowDeleteModal(false)
            setLbToDeleteId(null)
          }}
        />
      )}
    </div>
  )
}
