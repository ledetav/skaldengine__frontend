import React, { useState, useMemo } from 'react'
import styles from '../Admin.module.css'
import { Button, Input } from '@/components/ui'
import type { AdminTab } from './AdminSidebar'
import type { User, UserPersona, Character, Lorebook } from '../types'

export interface FilterState {
  roles?: string[]
  regDateStart?: string
  regDateEnd?: string
  userIds?: string[]
  chatCountMin?: number
  chatCountMax?: number
  lorebookCountMin?: number
  lorebookCountMax?: number
  fandoms?: string[]
  isPublic?: 'all' | 'public' | 'private'
  isNSFW?: 'all' | 'safe' | 'nsfw'
  entriesCountMin?: number
  entriesCountMax?: number
  characterIds?: string[]
}

interface AdminFilterModalProps {
  tab: AdminTab
  isOpen: boolean
  onClose: () => void
  onApply: (filters: FilterState) => void
  initialFilters: FilterState
  users: User[]
  personas: UserPersona[]
  characters: Character[]
  lorebooks: Lorebook[]
}

export function AdminFilterModal({
  tab,
  isOpen,
  onClose,
  onApply,
  initialFilters,
  users,
  personas,
  characters,
  lorebooks
}: AdminFilterModalProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters)
  const [fandomSearch, setFandomSearch] = useState('')

  const allFandoms = useMemo(() => {
    const s = new Set<string>()
    lorebooks.forEach(l => { if (l.fandom) s.add(l.fandom) })
    characters.forEach(c => { if (c.fandom) s.add(c.fandom) })
    return Array.from(s).sort()
  }, [lorebooks, characters])

  const filteredFandoms = allFandoms.filter(f => 
    f.toLowerCase().includes(fandomSearch.toLowerCase()) && 
    !filters.fandoms?.includes(f)
  )

  if (!isOpen) return null

  const renderRoles = () => (
    <div className={styles.filterGroup}>
      <label className={styles.filterLabel}>Роль пользователя</label>
      <div className={styles.roleBtnGroup} style={{ margin: 0 }}>
        {['admin', 'moderator', 'user'].map(role => (
          <button 
            key={role}
            className={`${styles.roleBtn} ${filters.roles?.includes(role) ? styles.roleBtnActive : ''}`}
            onClick={() => {
              const roles = filters.roles || []
              const newRoles = roles.includes(role) ? roles.filter(r => r !== role) : [...roles, role]
              setFilters({ ...filters, roles: newRoles })
            }}
          >
            {role}
          </button>
        ))}
      </div>
    </div>
  )

  const renderRange = (label: string, fieldMin: keyof FilterState, fieldMax: keyof FilterState, type: 'number' | 'date' = 'number') => (
    <div className={styles.filterGroup}>
      <label className={styles.filterLabel}>{label}</label>
      <div className={styles.rangeInputs}>
        <input 
          type={type} 
          className={styles.rangeInput} 
          placeholder="От" 
          value={filters[fieldMin] as string || ''} 
          onChange={(e) => setFilters({ ...filters, [fieldMin]: type === 'number' ? Number(e.target.value) : e.target.value })}
        />
        <span style={{ opacity: 0.3 }}>—</span>
        <input 
          type={type} 
          className={styles.rangeInput} 
          placeholder="До" 
          value={filters[fieldMax] as string || ''}
          onChange={(e) => setFilters({ ...filters, [fieldMax]: type === 'number' ? Number(e.target.value) : e.target.value })}
        />
      </div>
    </div>
  )

  const renderMultiSelect = (label: string, field: keyof FilterState, options: {id: string, name: string}[], search: string, setSearch: (s:string)=>void) => {
    const selected = (filters[field] as string[]) || []
    const filteredOptions = options.filter(o => 
      o.name.toLowerCase().includes(search.toLowerCase()) && !selected.includes(o.id)
    )

    return (
      <div className={styles.filterGroup}>
        <label className={styles.filterLabel}>{label}</label>
        <div className={styles.chipsContainer}>
          {selected.map(id => (
            <div key={id} className={styles.chip}>
              {options.find(o => o.id === id)?.name || id}
              <span className={styles.chipRemove} onClick={() => {
                setFilters({ ...filters, [field]: selected.filter(v => v !== id) })
              }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </span>
            </div>
          ))}
        </div>
        <Input 
          placeholder="Поиск..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && filteredOptions.length > 0 && (
          <div className={styles.filterOptionList}>
            {filteredOptions.map(o => (
              <div key={o.id} className={styles.filterOption} onClick={() => {
                setFilters({ ...filters, [field]: [...selected, o.id] })
                setSearch('')
              }}>
                {o.name}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  const renderTriState = (label: string, field: keyof FilterState, options: {val: string, label: string}[]) => (
    <div className={styles.filterGroup}>
      <label className={styles.filterLabel}>{label}</label>
      <div className={styles.roleBtnGroup} style={{ margin: 0 }}>
        {options.map(opt => (
          <button 
            key={opt.val}
            className={`${styles.roleBtn} ${filters[field] === opt.val ? styles.roleBtnActive : ''}`}
            onClick={() => setFilters({ ...filters, [field]: opt.val })}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <div className={styles.modalOverlay} onClick={onClose} style={{ zIndex: 2000 }}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <h3 className={styles.modalTitle}>Фильтры</h3>
        
        <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '8px', margin: '20px 0' }}>
          {tab === 'users' && (
            <>
              {renderRoles()}
              {renderRange('Дата регистрации', 'regDateStart', 'regDateEnd', 'date')}
            </>
          )}

          {tab === 'personas' && (
            <>
              {renderMultiSelect('Пользователь', 'userIds', users.map(u => ({id: u.id, name: u.username})), fandomSearch, setFandomSearch)}
              {renderRange('Количество чатов', 'chatCountMin', 'chatCountMax')}
              {renderRange('Количество лорбуков', 'lorebookCountMin', 'lorebookCountMax')}
            </>
          )}

          {tab === 'characters' && (
            <>
              {renderMultiSelect('Фандомы', 'fandoms', allFandoms.map(f => ({id: f, name: f})), fandomSearch, setFandomSearch)}
              {renderTriState('Публичность', 'isPublic', [
                {val: 'all', label: 'Все'},
                {val: 'public', label: 'Публичные'},
                {val: 'private', label: 'Приватные'}
              ])}
              {renderTriState('NSFW Режим', 'isNSFW', [
                {val: 'all', label: 'Все'},
                {val: 'safe', label: 'SFW'},
                {val: 'nsfw', label: 'NSFW'}
              ])}
            </>
          )}

          {(tab === 'lorebooks_fandom' || tab === 'lorebooks_character' || tab === 'lorebooks_persona') && (
            <>
              {tab === 'lorebooks_fandom' && renderMultiSelect('Фандомы', 'fandoms', allFandoms.map(f => ({id: f, name: f})), fandomSearch, setFandomSearch)}
              {tab === 'lorebooks_character' && renderMultiSelect('Персонажи', 'characterIds', characters.map(c => ({id: c.id, name: c.name})), fandomSearch, setFandomSearch)}
              {tab === 'lorebooks_persona' && renderMultiSelect('Персоны', 'characterIds', personas.map(p => ({id: p.id, name: p.name})), fandomSearch, setFandomSearch)}
              {renderRange('Количество записей', 'entriesCountMin', 'entriesCountMax')}
            </>
          )}
        </div>

        <div className={styles.modalActions}>
          <Button variant="ghost" onClick={() => {
            setFilters({})
            onApply({})
            onClose()
          }}>Сбросить</Button>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button variant="ghost" onClick={onClose}>Отмена</Button>
            <Button variant="orange" onClick={() => {
              onApply(filters)
              onClose()
            }}>Применить</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
