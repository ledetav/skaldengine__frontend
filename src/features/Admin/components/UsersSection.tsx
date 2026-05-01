import React from 'react'
import { Badge } from '@/components/ui'
import { SearchInput } from '@/components/common'
import { FilterButton } from '@/components/common'
import styles from '../Admin.module.css'
import type { User } from '../types'

interface UsersSectionProps {
  users: User[]
  onSelectUser: (id: string) => void
  onToggleFilter?: () => void
  isFilterActive?: boolean
  onSort: (field: string) => void
  renderSortIcon: (field: string) => React.ReactNode
  search: string
  onSearchChange: (v: string) => void
}

export function UsersSection({
  users, onSelectUser, onToggleFilter, isFilterActive,
  onSort, renderSortIcon, search, onSearchChange,
}: UsersSectionProps) {
  return (
    <div className={styles.sectionContainer}>
      <div className={styles.sectionHeader} style={{ marginBottom: '16px' }}>
        <SearchInput
          value={search}
          onChange={onSearchChange}
          placeholder="Поиск по пользователям..."
        />
        <FilterButton isActive={isFilterActive} onClick={onToggleFilter} />
      </div>
      <div className={styles.tableWrapper}>
        <table className={styles.compactTable}>
          <thead>
            <tr>
              <th onClick={() => onSort('full_name')} style={{ cursor: 'pointer' }}>Имя {renderSortIcon('full_name')}</th>
              <th onClick={() => onSort('username')} style={{ cursor: 'pointer' }}>Никнейм {renderSortIcon('username')}</th>
              <th onClick={() => onSort('role')} style={{ cursor: 'pointer' }}>Роль {renderSortIcon('role')}</th>
              <th onClick={() => onSort('created_at')} style={{ cursor: 'pointer' }}>Дата регистрации {renderSortIcon('created_at')}</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} onClick={() => onSelectUser(u.id)} style={{ cursor: 'pointer' }}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', overflow: 'hidden', background: 'var(--bg-card)' }}>
                      <img src={u.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`} alt="" style={{ width: '100%', height: '100%' }} />
                    </div>
                    <span style={{ fontWeight: 700 }}>{u.full_name || u.login}</span>
                  </div>
                </td>
                <td><span style={{ opacity: 0.6, fontSize: '0.85rem' }}>{u.username}</span></td>
                <td><Badge variant={u.role === 'admin' ? 'orange' : u.role === 'moderator' ? 'purple' : 'fuchsia'}>{u.role}</Badge></td>
                <td><span style={{ opacity: 0.5, fontSize: '0.8rem' }}>{new Date(u.created_at).toLocaleDateString()}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
