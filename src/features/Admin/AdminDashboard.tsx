import { useState, useEffect, useMemo } from 'react'
import { useParams, useLocation, useNavigate, Navigate } from 'react-router-dom'

import styles from './Admin.module.css'
import { AdminSidebar, type AdminTab } from './components/AdminSidebar'
import { CharacterSection } from './components/CharacterSection'
import { LorebookSection } from './components/LorebookSection'
import { CharacterProfileView } from './components/CharacterProfileView'
import { mockCharacters, mockLorebooks, mockUsersList, mockPersonas } from './mockData'
import type { Character, Lorebook, User, UserPersona } from './types'
import { useProfile } from '@/core/hooks/useProfile'
import { Badge } from '@/components/ui'
import { UserProfileView } from './components/UserProfileView'
import { PersonaProfileView } from './components/PersonaProfileView'
import { AdminFilterModal, type FilterState } from './components/AdminFilterModal'

export default function AdminDashboard() {
  const { id } = useParams<{ id: string }>()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  
  const navigateDebug = (route: string) => {
    const isDebug = pathname.includes('/debug')
    const finalRoute = isDebug && !route.endsWith('/debug') ? route.replace(/\/?$/, '/debug') : route
    navigate(finalRoute)
  }
  
  const [activeTab, setActiveTab] = useState<AdminTab>('characters')
  
  // State lifted from children for real-time updates
  const [characters, setCharacters] = useState(mockCharacters)
  const [lorebooks, setLorebooks] = useState(mockLorebooks)
  const [users, setUsers] = useState(mockUsersList)
  const [personas, setPersonas] = useState(mockPersonas)

  // Filter State
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [activeFilters, setActiveFilters] = useState<FilterState>({})

  // Sorting State
  const [sortField, setSortField] = useState<string>('')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const [userSearch, setUserSearch] = useState('')
  const [personaSearch, setPersonaSearch] = useState('')

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <span style={{ opacity: 0.2, marginLeft: '4px' }}>⇅</span>
    return sortDir === 'asc' ? <span style={{ color: 'var(--accent-purple)', marginLeft: '4px' }}>↑</span> : <span style={{ color: 'var(--accent-purple)', marginLeft: '4px' }}>↓</span>
  }

  const isDebug = pathname.includes('/debug')
  const { profile: currentUser, isLoading } = useProfile(undefined, isDebug)
  // Determine admin status: use real role from currentUser, or fallback to localStorage in debug mode
  const roleFromStorage = localStorage.getItem('user_role')
  const effectiveRole = currentUser?.role || (isDebug ? roleFromStorage : null)
  const isAdmin = effectiveRole === 'admin' || effectiveRole === 'moderator'

  useEffect(() => {
    if (pathname.includes('/admin/users')) setActiveTab('users')
    else if (pathname.includes('/admin/personas')) setActiveTab('personas')
    else if (pathname.includes('/admin/characters')) setActiveTab('characters')
    else if (pathname.includes('/admin/lorebooks/fandom')) setActiveTab('lorebooks_fandom')
    else if (pathname.includes('/admin/lorebooks/characters')) setActiveTab('lorebooks_character')
    else if (pathname.includes('/admin/lorebooks/personas')) setActiveTab('lorebooks_persona')
  }, [pathname])

  const isDetailView = id && pathname.includes('/characters/') && !pathname.includes('/lorebooks/')
  const isLorebookDetail = pathname.includes('/lorebooks/') && id && !pathname.includes('/fandom/') && !pathname.includes('/characters/') && !pathname.includes('/personas/')
  const isUserDetail = pathname.includes('/users/') && id
  const isPersonaDetail = pathname.includes('/personas/') && id

  // --- Filtering & Sorting Logic ---
  const applySort = (data: any[]) => {
    if (!sortField) return data
    return [...data].sort((a, b) => {
      const valA = a[sortField] || ''
      const valB = b[sortField] || ''
      if (valA < valB) return sortDir === 'asc' ? -1 : 1
      if (valA > valB) return sortDir === 'asc' ? 1 : -1
      return 0
    })
  }

  const filteredUsers = useMemo(() => {
    const list = users.filter(u => {
      const searchMatch = u.username.toLowerCase().includes(userSearch.toLowerCase()) || 
                        (u.full_name || '').toLowerCase().includes(userSearch.toLowerCase()) ||
                        u.login.toLowerCase().includes(userSearch.toLowerCase())
      if (!searchMatch) return false
      if (activeFilters.roles?.length && !activeFilters.roles.includes(u.role)) return false
      if (activeFilters.regDateStart && new Date(u.created_at) < new Date(activeFilters.regDateStart)) return false
      if (activeFilters.regDateEnd && new Date(u.created_at) > new Date(activeFilters.regDateEnd)) return false
      return true
    })
    return applySort(list)
  }, [users, activeFilters, sortField, sortDir, userSearch])

  const filteredPersonas = useMemo(() => {
    const list = personas.filter(p => {
      const searchMatch = p.name.toLowerCase().includes(personaSearch.toLowerCase())
      if (!searchMatch) return false
      if (activeFilters.userIds?.length && !activeFilters.userIds.includes(p.owner_id)) return false
      if (activeFilters.chatCountMin !== undefined && (p.chat_count || 0) < activeFilters.chatCountMin) return false
      if (activeFilters.chatCountMax !== undefined && (p.chat_count || 0) > activeFilters.chatCountMax) return false
      if (activeFilters.lorebookCountMin !== undefined && (p.lorebook_count || 0) < activeFilters.lorebookCountMin) return false
      if (activeFilters.lorebookCountMax !== undefined && (p.lorebook_count || 0) > activeFilters.lorebookCountMax) return false
      return true
    })
    return applySort(list)
  }, [personas, activeFilters, sortField, sortDir, personaSearch])

  const filteredCharacters = useMemo(() => {
    const list = characters.filter(c => {
      if (activeFilters.fandoms?.length && !activeFilters.fandoms.includes(c.fandom || '')) return false
      if (activeFilters.isPublic === 'public' && !c.is_public) return false
      if (activeFilters.isPublic === 'private' && c.is_public) return false
      if (activeFilters.isNSFW === 'safe' && c.is_nsfw) return false
      if (activeFilters.isNSFW === 'nsfw' && !c.is_nsfw) return false
      return true
    })
    return applySort(list)
  }, [characters, activeFilters, sortField, sortDir])

  const filteredLorebooks = useMemo(() => {
    const list = lorebooks.filter(lb => {
      if (activeTab === 'lorebooks_fandom' && activeFilters.fandoms?.length && !activeFilters.fandoms.includes(lb.fandom || '')) return false
      if (activeTab === 'lorebooks_character' && activeFilters.characterIds?.length && !activeFilters.characterIds.includes(lb.character_id || '')) return false
      if (activeTab === 'lorebooks_persona' && activeFilters.characterIds?.length && !activeFilters.characterIds.includes(lb.user_persona_id || '')) return false
      
      const count = lb.entries?.length || lb.entries_count || 0
      if (activeFilters.entriesCountMin !== undefined && count < activeFilters.entriesCountMin) return false
      if (activeFilters.entriesCountMax !== undefined && count > activeFilters.entriesCountMax) return false
      return true
    })
    return applySort(list)
  }, [lorebooks, activeFilters, activeTab, sortField, sortDir])

  if (isLoading) return <div className={styles.adminPage}><div style={{ padding: '40px', color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>Загрузка...</div></div>
  if (!isAdmin) return <Navigate to="/dashboard" replace />
  if (!currentUser && !pathname.includes('/debug')) return <Navigate to="/auth" replace />

  const isFilterActiveForTab = (filters: FilterState, tab: AdminTab) => {
    if (tab === 'users') {
      return !!(filters.roles?.length || filters.regDateStart || filters.regDateEnd)
    }
    if (tab === 'personas') {
      return !!(filters.userIds?.length || filters.chatCountMin !== undefined || filters.chatCountMax !== undefined || filters.lorebookCountMin !== undefined || filters.lorebookCountMax !== undefined)
    }
    if (tab === 'characters') {
      return !!(filters.fandoms?.length || (filters.isPublic && filters.isPublic !== 'all') || (filters.isNSFW && filters.isNSFW !== 'all'))
    }
    if (tab.startsWith('lorebooks_')) {
      return !!(filters.fandoms?.length || filters.characterIds?.length || filters.entriesCountMin !== undefined || filters.entriesCountMax !== undefined)
    }
    return false
  }

  const isAnyFilterActive = isFilterActiveForTab(activeFilters, activeTab)

  return (
    <div className={styles.adminPage}>
      <div className={styles.backgroundEffects}>
        <div className={`${styles.orb} ${styles.orbPurple}`} />
        <div className={`${styles.orb} ${styles.orbPink}`} />
        <div className={`${styles.orb} ${styles.orbOrange}`} />
      </div>

      <AdminSidebar activeTab={activeTab} />
      
      <main className={styles.mainContainer}>
        <header className={styles.mainHeader}>
          <div className={styles.titleGroup}>
            <h1 className={styles.mainTitle}>
              {activeTab === 'users' && 'Управление пользователями'}
              {activeTab === 'personas' && 'Персоны пользователей'}
              {activeTab === 'characters' && 'Персонажи'}
              {activeTab === 'lorebooks_fandom' && 'Лорбуки фандомов'}
              {activeTab === 'lorebooks_character' && 'Лорбуки персонажей'}
              {activeTab === 'lorebooks_persona' && 'Лорбуки персон'}
            </h1>
            <p className={styles.mainSubtitle}>Система мониторинга и редактирования контента</p>
          </div>
          
          <div className={styles.headerActions}>
            <div className={styles.userBadge}>
              <div className={styles.userBadgeInfo}>
                <span className={styles.userBadgeName}>
                  {currentUser?.full_name || currentUser?.login || currentUser?.username || 'Admin'}
                </span>
                <span className={styles.userBadgeRole}>
                  {currentUser?.role === 'admin' ? 'Master Admin' : 'Moderator'}
                </span>
              </div>
              <div className={styles.userBadgeAvatar}>
                {currentUser?.avatar_url ? (
                  <img src={currentUser.avatar_url} alt="" />
                ) : (
                  (currentUser?.login || currentUser?.username || 'A').charAt(0).toUpperCase()
                )}
                <div className={styles.statusIndicator} />
              </div>
            </div>
            <button className={styles.logoutBtn} onClick={() => {
              localStorage.removeItem('token')
              localStorage.removeItem('user_role')
              window.dispatchEvent(new Event('auth-change'))
              navigate('/login')
            }} title="Выйти">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
          </div>
        </header>

        <section className={styles.contentArea}>
          {activeTab === 'characters' && !isDetailView && (
            <CharacterSection 
              characters={filteredCharacters}
              onSelectCharacter={(cid) => navigateDebug(`/admin/characters/${cid}`)}
              onToggleFilter={() => setIsFilterOpen(true)}
              isFilterActive={isAnyFilterActive}
              onSort={handleSort}
              renderSortIcon={(f) => <SortIcon field={f} />}
            />
          )}

          {(activeTab === 'lorebooks_fandom' || activeTab === 'lorebooks_character' || activeTab === 'lorebooks_persona') && (
            <LorebookSection 
              type={activeTab === 'lorebooks_fandom' ? 'fandom' : activeTab === 'lorebooks_persona' ? 'persona' : 'character'} 
              lorebooks={filteredLorebooks}
              characters={characters}
              users={users}
              personas={personas}
              onToggleFilter={() => setIsFilterOpen(true)}
              isFilterActive={isAnyFilterActive}
              onSort={handleSort}
              renderSortIcon={(f) => <SortIcon field={f} />}
            />
          )}

          {activeTab === 'users' && !isUserDetail && (
            <div className={styles.sectionContainer}>
              <div className={styles.sectionHeader} style={{ marginBottom: '16px' }}>
                <div className={styles.searchWrapper}>
                  <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input 
                    type="text" 
                    placeholder="Поиск по пользователям..." 
                    className={styles.searchBox}
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                </div>
                <button 
                  className={`${styles.filterBtn} ${isAnyFilterActive ? styles.filterBtnActive : ''}`}
                  onClick={() => setIsFilterOpen(true)}
                  style={{ padding: '8px', width: '38px', height: '38px', justifyContent: 'center' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                </button>
              </div>
              <div className={styles.tableWrapper}>
                <table className={styles.compactTable}>
                  <thead>
                    <tr>
                      <th onClick={() => handleSort('full_name')} style={{ cursor: 'pointer' }}>Имя пользователя <SortIcon field="full_name" /></th>
                      <th onClick={() => handleSort('username')} style={{ cursor: 'pointer' }}>Никнейм <SortIcon field="username" /></th>
                      <th onClick={() => handleSort('role')} style={{ cursor: 'pointer' }}>Роль <SortIcon field="role" /></th>
                      <th onClick={() => handleSort('created_at')} style={{ cursor: 'pointer' }}>Дата регистрации <SortIcon field="created_at" /></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(u => (
                      <tr key={u.id} onClick={() => navigateDebug(`/admin/users/${u.id}`)} style={{ cursor: 'pointer' }}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', overflow: 'hidden', background: 'var(--bg-card)' }}>
                              <img src={u.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`} alt="" style={{ width: '100%', height: '100%' }} />
                            </div>
                            <span style={{ fontWeight: 700 }}>{u.full_name || u.login}</span>
                          </div>
                        </td>
                        <td><span style={{ opacity: 0.6, fontSize: '0.85rem' }}>@{u.username}</span></td>
                        <td><Badge variant={u.role === 'admin' ? 'orange' : u.role === 'moderator' ? 'purple' : 'fuchsia'}>{u.role}</Badge></td>
                        <td><span style={{ opacity: 0.5, fontSize: '0.8rem' }}>{new Date(u.created_at).toLocaleDateString()}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'personas' && !isPersonaDetail && (
            <div className={styles.sectionContainer}>
              <div className={styles.sectionHeader} style={{ marginBottom: '16px' }}>
                <div className={styles.searchWrapper}>
                  <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input 
                    type="text" 
                    placeholder="Поиск по персонам..." 
                    className={styles.searchBox}
                    value={personaSearch}
                    onChange={(e) => setPersonaSearch(e.target.value)}
                  />
                </div>
                <button 
                  className={`${styles.filterBtn} ${isAnyFilterActive ? styles.filterBtnActive : ''}`}
                  onClick={() => setIsFilterOpen(true)}
                  style={{ padding: '8px', width: '38px', height: '38px', justifyContent: 'center' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                </button>
              </div>
              <div className={styles.tableWrapper}>
                <table className={styles.compactTable}>
                  <thead>
                    <tr>
                      <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>Персона <SortIcon field="name" /></th>
                      <th onClick={() => handleSort('owner_id')} style={{ cursor: 'pointer' }}>Владелец <SortIcon field="owner_id" /></th>
                      <th onClick={() => handleSort('chat_count')} style={{ cursor: 'pointer' }}>Чаты <SortIcon field="chat_count" /></th>
                      <th onClick={() => handleSort('lorebook_count')} style={{ cursor: 'pointer' }}>Лорбуки <SortIcon field="lorebook_count" /></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPersonas.map(p => {
                      const owner = users.find(u => u.id === p.owner_id)
                      return (
                        <tr key={p.id} onClick={() => navigateDebug(`/admin/personas/${p.id}`)} style={{ cursor: 'pointer' }}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div className={styles.charAvatarWrapper} style={{ width: '28px', height: '28px', position: 'static', flexShrink: 0 }}>
                                <img src={p.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${p.name}`} className={styles.charAvatar} alt="" />
                              </div>
                              <span style={{ fontWeight: 700 }}>{p.name}</span>
                            </div>
                          </td>
                          <td>
                            <Badge variant="purple" style={{ opacity: 0.9 }}>
                              {owner ? `@${owner.username}` : p.owner_id}
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
          )}

          {isDetailView && (
            <CharacterProfileView 
              characterId={id!} 
              characters={characters}
              allLorebooks={lorebooks}
              onBack={() => navigateDebug('/admin/characters')}
              onUpdateCharacter={(updated) => setCharacters(prev => prev.map(c => c.id === updated.id ? updated : c))}
              onUpdateLorebooks={(updated) => setLorebooks(updated)}
            />
          )}

          {isUserDetail && (
            <UserProfileView 
              userId={id!}
              users={users}
              currentUser={currentUser!}
              onBack={() => navigateDebug('/admin/users')}
              onDelete={(uid) => {
                setUsers(prev => prev.filter(u => u.id !== uid))
                navigateDebug('/admin/users')
              }}
            />
          )}

          {isPersonaDetail && (
            <PersonaProfileView 
              personaId={id!}
              personas={personas}
              users={users}
              allLorebooks={lorebooks}
              onBack={() => navigateDebug('/admin/personas')}
            />
          )}
        </section>

        <AdminFilterModal 
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          tab={activeTab}
          onApply={(f) => setActiveFilters(f)}
          initialFilters={activeFilters}
          users={users}
          personas={personas}
          characters={characters}
          lorebooks={lorebooks}
        />
      </main>
    </div>
  )
}
