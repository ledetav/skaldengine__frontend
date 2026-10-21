import React from 'react'
import { Badge } from '@/components/ui'
import { SearchInput, FilterButton } from '@/components/common'
import styles from '../styles'
import type { User, UserPersona } from '../types'

interface PersonasSectionProps {
  personas: UserPersona[]
  users: User[]
  onSelectPersona: (id: string) => void
  onToggleFilter?: () => void
  isFilterActive?: boolean
  onSort: (field: string) => void
  renderSortIcon: (field: string) => React.ReactNode
  search: string
  onSearchChange: (v: string) => void
}

export function PersonasSection({
  personas, users, onSelectPersona, onToggleFilter, isFilterActive,
  onSort, renderSortIcon, search, onSearchChange,
}: PersonasSectionProps) {
  return (
    <div className={styles.sectionContainer}>
      <div className={styles.sectionHeader} style={{ marginBottom: '16px' }}>
        <SearchInput
          value={search}
          onChange={onSearchChange}
          placeholder="Поиск по персонам..."
        />
        <FilterButton isActive={isFilterActive} onClick={onToggleFilter} />
      </div>
      <div className={styles.tableWrapper}>
        <table className={styles.compactTable}>
          <thead>
            <tr>
              <th onClick={() => onSort('name')} style={{ cursor: 'pointer' }}>Персона {renderSortIcon('name')}</th>
              <th onClick={() => onSort('owner_id')} style={{ cursor: 'pointer' }}>Владелец {renderSortIcon('owner_id')}</th>
              <th onClick={() => onSort('chat_count')} style={{ cursor: 'pointer' }}>Чаты {renderSortIcon('chat_count')}</th>
              <th onClick={() => onSort('lorebook_count')} style={{ cursor: 'pointer' }}>Лорбуки {renderSortIcon('lorebook_count')}</th>
            </tr>
          </thead>
          <tbody>
            {personas.map(p => {
              const owner = users.find(u => u.id === p.owner_id)
              return (
                <tr key={p.id} onClick={() => onSelectPersona(p.id)} style={{ cursor: 'pointer' }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className={styles.charAvatarWrapper} style={{ width: '28px', height: '28px', position: 'static', flexShrink: 0, borderRadius: '50%', clipPath: 'none' }}>
                        <img src={p.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.name}`} className={styles.charAvatar} style={{ borderRadius: '50%', clipPath: 'none' }} alt="" />
                      </div>
                      <span style={{ fontWeight: 700 }}>{p.name}</span>
                    </div>
                  </td>
                  <td>
                    <Badge variant="purple" style={{ opacity: 0.9 }}>
                      {owner ? owner.username : p.owner_id}
                    </Badge>
                  </td>
                  <td><span style={{ fontWeight: 600 }}>{p.chat_count}</span></td>
                  <td><span style={{ opacity: 0.7 }}>{p.lorebook_count}</span></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
