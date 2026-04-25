import { useState, useEffect, useMemo } from 'react'
import { useParams, useLocation, useNavigate, Navigate } from 'react-router-dom'

import styles from './Admin.module.css'
import { AdminSidebar, type AdminTab } from './components/AdminSidebar'
import { CharacterSection } from './components/CharacterSection'
import { LorebookSection } from './components/LorebookSection'
import { CharacterProfileView } from './components/CharacterProfileView'
import type { Character, Lorebook, User, UserPersona } from './types'
import type { Scenario } from '@/core/types/chat'
import { useProfile } from '@/core/hooks/useProfile'
import { Badge, useToast } from '@/components/ui'
import { UserProfileView } from './components/UserProfileView'
import { PersonaProfileView } from './components/PersonaProfileView'
import { ScenarioSection } from './components/ScenarioSection'
import { ScenarioProfileView } from './components/ScenarioProfileView'
import { AdminFilterModal, type FilterState } from './components/AdminFilterModal'
import { ApiClient } from '@/core/api/client'
import { scenariosApi } from '@/core/api/scenarios'

const PAGE_SIZE = 20

export default function AdminDashboard() {
  const { id } = useParams<{ id: string }>()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { success } = useToast()
  
  const [activeTab, setActiveTab] = useState<AdminTab>('characters')

  const isDebug = pathname.includes('/debug')
  const { profile: currentUser, isLoading } = useProfile(undefined)
  // Determine admin status: use real role from currentUser, or fallback to localStorage in debug mode
  const roleFromStorage = localStorage.getItem('user_role')
  const effectiveRole = currentUser?.role || (isDebug ? roleFromStorage : null)
  const isAdmin = effectiveRole === 'admin' || effectiveRole === 'moderator'

  // Real implementation arrays
  const [characters, setCharacters] = useState<Character[]>([])
  const [lorebooksFandom, setLorebooksFandom] = useState<Lorebook[]>([])
  const [lorebooksCharacter, setLorebooksCharacter] = useState<Lorebook[]>([])
  const [lorebooksPersona, setLorebooksPersona] = useState<Lorebook[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [personas, setPersonas] = useState<UserPersona[]>([])
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [allLorebooks, setAllLorebooks] = useState<Lorebook[]>([])
  const [isDataLoading, setIsDataLoading] = useState(false)

  const [currentPage, setCurrentPage] = useState<Record<string, number>>({
    characters: 1,
    lorebooks_fandom: 1,
    lorebooks_character: 1,
    lorebooks_persona: 1,
    users: 1,
    personas: 1,
    scenarios: 1
  })
  const [hasMore, setHasMore] = useState<Record<string, boolean>>({
    characters: true,
    lorebooks_fandom: true,
    lorebooks_character: true,
    lorebooks_persona: true,
    users: true,
    personas: true,
    scenarios: true
  })

  const fetchTab = async (tab: string, page: number, isInitial = false) => {
    if (!isInitial && !hasMore[tab]) return
    
    setIsDataLoading(true)
    const skip = (page - 1) * PAGE_SIZE
    try {
      if (tab === 'characters') {
        const res = await ApiClient.get<any>('core', `/characters/?skip=${skip}&limit=${PAGE_SIZE}`)
        if (res && res.items) {
          setCharacters(prev => isInitial ? res.items : [...prev, ...res.items])
          setHasMore(prev => ({ ...prev, characters: (res.items.length === PAGE_SIZE) }))
        }
      } else if (tab.startsWith('lorebooks_')) {
        const type = tab.split('_')[1]
        const res = await ApiClient.get<any>('core', `/lorebooks/?skip=${skip}&limit=${PAGE_SIZE}&type=${type}`)
        const items = res.items || []
        if (type === 'fandom') setLorebooksFandom(prev => isInitial ? items : [...prev, ...items])
        else if (type === 'character') setLorebooksCharacter(prev => isInitial ? items : [...prev, ...items])
        else if (type === 'persona') setLorebooksPersona(prev => isInitial ? items : [...prev, ...items])
        setHasMore(prev => ({ ...prev, [tab]: (items.length === PAGE_SIZE) }))
      } else if (tab === 'users') {
        const res = await ApiClient.get<any>('auth', `/users/?skip=${skip}&limit=${PAGE_SIZE}`)
        if (res && res.items) {
          setUsers(prev => isInitial ? res.items : [...prev, ...res.items])
          setHasMore(prev => ({ ...prev, users: (res.items.length === PAGE_SIZE) }))
        }
      } else if (tab === 'personas') {
        const res = await ApiClient.get<any>('core', `/personas/admin/all?skip=${skip}&limit=${PAGE_SIZE}`)
        if (res && res.items) {
          setPersonas(prev => isInitial ? res.items : [...prev, ...res.items])
          setHasMore(prev => ({ ...prev, personas: (res.items.length === PAGE_SIZE) }))
        }
      } else if (tab === 'scenarios') {
        const res = await ApiClient.get<any>('core', `/scenarios/?skip=${skip}&limit=${PAGE_SIZE}`)
        if (res && res.items) {
          setScenarios(prev => isInitial ? res.items : [...prev, ...res.items])
          setHasMore(prev => ({ ...prev, scenarios: (res.items.length === PAGE_SIZE) }))
        }
      }
    } catch (e) {
      console.error(`[Admin] Failed to load ${tab}`, e)
    } finally {
      setIsDataLoading(false)
    }
  }

  useEffect(() => {
    if (!isAdmin) return

    const currentTab = activeTab
    const pageToFetch = currentPage[currentTab] || 1
    
    // If it's page 1, we treat it as initial (replacement), otherwise as append
    fetchTab(currentTab, pageToFetch, pageToFetch === 1)

  }, [activeTab, isAdmin, currentPage[activeTab]])

  // Initial load effect
  useEffect(() => {
    if (!isAdmin) return
    // fetchAll removed in favor of fetchTab controlled by pagination

    // WebSocket setup for real-time updates
    const wsUrl = import.meta.env.VITE_CORE_API_URL?.replace('http', 'ws') || 'ws://localhost:8002/api/v1'
    const socket = new WebSocket(`${wsUrl}/ws/updates`)

    socket.onmessage = async (event) => {
      try {
        const payload = JSON.parse(event.data)
        
        // Handle Lorebook updates
        if (payload.type === 'NEW_LOREBOOK') {
          const type = payload.data.type || (payload.data.user_persona_id ? 'persona' : 'character')
          if (type === 'fandom') setLorebooksFandom(prev => prev.some(l => l.id === payload.data.id) ? prev : [payload.data, ...prev])
          else if (type === 'character') setLorebooksCharacter(prev => prev.some(l => l.id === payload.data.id) ? prev : [payload.data, ...prev])
          else if (type === 'persona') setLorebooksPersona(prev => prev.some(l => l.id === payload.data.id) ? prev : [payload.data, ...prev])
        } else if (payload.type === 'UPDATE_LOREBOOK') {
          setLorebooksFandom(prev => prev.map(l => l.id === payload.data.id ? { ...l, ...payload.data } : l))
          setLorebooksCharacter(prev => prev.map(l => l.id === payload.data.id ? { ...l, ...payload.data } : l))
          setLorebooksPersona(prev => prev.map(l => l.id === payload.data.id ? { ...l, ...payload.data } : l))
        } else if (payload.type === 'DELETE_LOREBOOK') {
          // Note: we don't know the type here easily, so we try to find which list it was in to decrement total
          setLorebooksFandom(prev => {
            if (prev.some(l => l.id === payload.data.id)) {
              return prev.filter(l => l.id !== payload.data.id)
            }
            return prev
          })
          setLorebooksCharacter(prev => {
            if (prev.some(l => l.id === payload.data.id)) {
              return prev.filter(l => l.id !== payload.data.id)
            }
            return prev
          })
          setLorebooksPersona(prev => {
            if (prev.some(l => l.id === payload.data.id)) {
              return prev.filter(l => l.id !== payload.data.id)
            }
            return prev
          })
        } else if (payload.type === 'REFRESH_LOREBOOK_ENTRIES') {
          const { lorebook_id } = payload.data
          ApiClient.get<Lorebook>('core', `/lorebooks/${lorebook_id}`).then(updatedLb => {
             setLorebooksFandom(prev => prev.map(l => l.id === lorebook_id ? updatedLb : l))
             setLorebooksCharacter(prev => prev.map(l => l.id === lorebook_id ? updatedLb : l))
             setLorebooksPersona(prev => prev.map(l => l.id === lorebook_id ? updatedLb : l))
          })
        }
        
        // Handle Character updates (optional, but good for consistency)
        else if (payload.type === 'NEW_CHARACTER') {
          setCharacters((prev: Character[]) => {
            if (prev.some(c => c.id === payload.data.id)) return prev
            return [payload.data, ...prev]
          })
        } else if (payload.type === 'UPDATE_CHARACTER') {
          setCharacters((prev: Character[]) => prev.map(c => c.id === payload.data.id ? { ...c, ...payload.data } : c))
        } else if (payload.type === 'DELETE_CHARACTER') {
          setCharacters((prev: Character[]) => {
            if (prev.some(c => c.id === payload.data.id)) {
              return prev.filter(c => c.id !== payload.data.id)
            }
            return prev
          })
        }

        // Handle Scenario updates
        else if (payload.type === 'NEW_SCENARIO') {
          setScenarios((prev: Scenario[]) => {
            if (prev.some(s => s.id === payload.data.id)) return prev
            return [payload.data, ...prev]
          })
        } else if (payload.type === 'UPDATE_SCENARIO') {
          setScenarios((prev: Scenario[]) => prev.map(s => s.id === payload.data.id ? { ...s, ...payload.data } : s))
        } else if (payload.type === 'DELETE_SCENARIO') {
          setScenarios((prev: Scenario[]) => {
            if (prev.some(s => s.id === payload.data.id)) {
              return prev.filter(s => s.id !== payload.data.id)
            }
            return prev
          })
        }
      } catch (err) {
        console.error('[Admin] WS parsing error:', err)
      }
    }

    return () => {
      socket.close()
    }
  }, [isAdmin])

  // Fetch all lorebooks for detail views (to populate dropdowns/filters)
  useEffect(() => {
    if (!isAdmin) return
    const fetchAllLbs = async () => {
      try {
        const res = await ApiClient.get<any>('core', '/lorebooks/?skip=0&limit=500')
        setAllLorebooks(res.items || [])
      } catch (e) {
        console.error('[Admin] Failed to fetch all lorebooks', e)
      }
    }
    // Only fetch if a detail view is open or if we are on a tab that might need them
    if (pathname.includes('/characters/') || pathname.includes('/personas/') || pathname.includes('/scenarios/')) {
      fetchAllLbs()
    }
  }, [isAdmin, pathname])

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

  useEffect(() => {
    let newTab: AdminTab | null = null
    if (pathname.includes('/admin/users')) newTab = 'users'
    else if (pathname.includes('/admin/personas')) newTab = 'personas'
    else if (pathname.includes('/admin/characters')) newTab = 'characters'
    else if (pathname.includes('/admin/scenarios')) newTab = 'scenarios'
    else if (pathname.includes('/admin/lorebooks/fandom')) newTab = 'lorebooks_fandom'
    else if (pathname.includes('/admin/lorebooks/characters')) newTab = 'lorebooks_character'
    else if (pathname.includes('/admin/lorebooks/personas')) newTab = 'lorebooks_persona'
    else if (pathname.includes('/admin/lorebooks/')) {
      const lbId = pathname.split('/admin/lorebooks/')[1]?.split('/')[0]
      if (lbId && lbId !== 'create') {
        const lb = [...lorebooksFandom, ...lorebooksCharacter, ...lorebooksPersona].find(l => l.id === lbId)
        if (lb) {
          if (lb.type === 'fandom') newTab = 'lorebooks_fandom'
          else if (lb.type === 'persona' || lb.user_persona_id) newTab = 'lorebooks_persona'
          else newTab = 'lorebooks_character'
        }
      }
    }

    if (newTab && newTab !== activeTab) {
      setActiveTab(newTab)
      setCurrentPage(prev => ({ ...prev, [newTab as string]: 1 }))
    }
  }, [pathname, activeTab, lorebooksFandom, lorebooksCharacter, lorebooksPersona])

  const isCreateRoute = pathname.includes('/create')
  const detailId = id || (isCreateRoute ? 'create' : undefined)
  const isCharacterDetail = detailId && pathname.includes('/characters/') && !pathname.includes('/lorebooks/')
  const isUserDetail = pathname.includes('/users/') && detailId
  const isPersonaDetail = pathname.includes('/personas/') && detailId
  const isLorebookDetail = pathname.includes('/admin/lorebooks/') && detailId
  const isScenarioDetail = pathname.includes('/admin/scenarios/') && detailId
  
  const isDetailView = isCharacterDetail || isUserDetail || isPersonaDetail || isLorebookDetail || isScenarioDetail

  // --- Filtering & Sorting Logic ---
  const applySort = (data: any[]) => {
    if (!sortField) return data
    return [...data].sort((a, b) => {
      const valA = a[sortField] !== undefined ? a[sortField] : ''
      const valB = b[sortField] !== undefined ? b[sortField] : ''
      
      if (typeof valA === 'string' && typeof valB === 'string') {
        const comp = valA.localeCompare(valB)
        return sortDir === 'asc' ? comp : -comp
      }
      
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
      if (activeFilters.isNSFW === 'safe' && c.nsfw_allowed) return false
      if (activeFilters.isNSFW === 'nsfw' && !c.nsfw_allowed) return false
      return true
    })
    return applySort(list)
  }, [characters, activeFilters, sortField, sortDir])

  const filteredLorebooks = useMemo(() => {
    const list = (activeTab === 'lorebooks_fandom' ? lorebooksFandom : 
                  activeTab === 'lorebooks_character' ? lorebooksCharacter : 
                  lorebooksPersona)
    return applySort(list.filter(lb => {
      const count = lb.entries?.length || lb.entries_count || 0
      if (activeFilters.entriesCountMin !== undefined && count < activeFilters.entriesCountMin) return false
      if (activeFilters.entriesCountMax !== undefined && count > activeFilters.entriesCountMax) return false
      return true
    }))
  }, [lorebooksFandom, lorebooksCharacter, lorebooksPersona, activeFilters, activeTab, sortField, sortDir])

  if (isLoading) return <div className={styles.adminPage}><div style={{ padding: '40px', color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>Загрузка...</div></div>
  if (!isAdmin) return <Navigate to="/dashboard" replace />
  if (!currentUser && !pathname.includes('/debug')) return <Navigate to="/auth" replace />


  const moderatorBlocked: AdminTab[] = ['users', 'lorebooks_fandom', 'lorebooks_persona']
  if (effectiveRole === 'moderator' && moderatorBlocked.includes(activeTab)) {
    return <Navigate to="/admin/characters" replace />
  }

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

  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    const target = e.currentTarget
    const threshold = 150
    const isAtBottom = target.scrollHeight - target.scrollTop - target.clientHeight < threshold

    if (isAtBottom && !isDataLoading && hasMore[activeTab]) {
      setCurrentPage(prev => ({
        ...prev,
        [activeTab]: (prev[activeTab] || 1) + 1
      }))
    }
  }

  return (
    <div className={styles.adminPage}>
      <div className={styles.backgroundEffects}>
        <div className={`${styles.orb} ${styles.orbPurple}`} />
        <div className={`${styles.orb} ${styles.orbPink}`} />
        <div className={`${styles.orb} ${styles.orbOrange}`} />
      </div>

      <AdminSidebar activeTab={activeTab} role={effectiveRole} />
      
      <main className={styles.mainContainer} onScroll={handleScroll}>
        <header className={styles.mainHeader}>
          <div className={styles.titleGroup}>
            <h1 className={styles.mainTitle}>
              {activeTab === 'users' && 'Управление пользователями'}
              {activeTab === 'personas' && 'Персоны пользователей'}
              {activeTab === 'characters' && 'Персонажи'}
              {activeTab === 'lorebooks_fandom' && 'Лорбуки фандомов'}
              {activeTab === 'lorebooks_character' && 'Лорбуки персонажей'}
              {activeTab === 'lorebooks_persona' && 'Лорбуки персон'}
              {activeTab === 'scenarios' && 'Сценарии'}
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
              
              <button className={styles.logoutBtn} style={{ marginLeft: '12px', opacity: 0.5 }} onClick={() => {
                localStorage.removeItem('token')
                localStorage.removeItem('user_role')
                window.dispatchEvent(new Event('auth-change'))
                navigate('/login')
              }} title="Выйти">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              </button>
            </div>
          </div>
        </header>

        <section className={styles.contentArea}>
          {isDataLoading && (
            <div className={styles.topProgress}>
              <div className={styles.topProgressBar} />
            </div>
          )}
          
          {activeTab === 'characters' && !isDetailView && (
            <div className={styles.sectionWrapper}>
              <CharacterSection 
                characters={filteredCharacters}
                onSelectCharacter={(cid) => navigate(`/admin/characters/${cid}`)}
                onToggleFilter={() => setIsFilterOpen(true)}
                isFilterActive={isAnyFilterActive}
                onSort={handleSort}
                renderSortIcon={(f) => <SortIcon field={f} />}
              />
            </div>
          )}

          {(activeTab.startsWith('lorebooks_') || isLorebookDetail) && (
            <div className={styles.sectionWrapper}>
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
            </div>
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
                      <tr key={u.id} onClick={() => navigate(`/admin/users/${u.id}`)} style={{ cursor: 'pointer' }}>
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
                        <tr key={p.id} onClick={() => navigate(`/admin/personas/${p.id}`)} style={{ cursor: 'pointer' }}>
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
          )}

          {isCharacterDetail && (
            <CharacterProfileView 
              characterId={detailId!} 
              characters={characters}
              allLorebooks={allLorebooks}
              onBack={() => navigate('/admin/characters')}
              onUpdateCharacter={(updated) => {
                if (detailId !== 'create') {
                  setCharacters((prev: Character[]) => prev.map((c: Character) => c.id === updated.id ? updated : c))
                }
              }}
              onDelete={(deletedId) => {
                setCharacters(prev => prev.filter(c => c.id !== deletedId))
              }}
              onSave={async (char) => {
                // ... (rest of the save logic)
                try {
                  const { charactersApi } = await import('@/core/api/characters')
                  
                  let savedChar: Character
                  if (detailId === 'create') {
                    savedChar = await charactersApi.createAdminCharacter(char)
                    setCharacters(prev => prev.some(c => c.id === savedChar.id) 
                      ? prev.map(c => c.id === savedChar.id ? savedChar : c) 
                      : [savedChar, ...prev]
                    )
                  } else {
                    savedChar = await charactersApi.updateAdminCharacter(char.id, char)
                    setCharacters(prev => prev.map(c => c.id === savedChar.id ? savedChar : c))
                  }


                  // Trigger re-fetch for current active lorebook tab to ensure proper pagination and state
                  if (activeTab.startsWith('lorebooks_')) {
                    const page = currentPage[activeTab] || 1
                    const type = activeTab.split('_')[1]
                    const skip = (page - 1) * PAGE_SIZE
                    const res = await ApiClient.get<any>('core', `/lorebooks/?skip=${skip}&limit=${PAGE_SIZE}&type=${type}`)
                    const items = res.items || []
                    if (type === 'fandom') setLorebooksFandom(items)
                    else if (type === 'character') setLorebooksCharacter(items)
                    else if (type === 'persona') setLorebooksPersona(items)
                    fetchTab(activeTab, currentPage[activeTab] || 1, true)
                  }

                  navigate(`/admin/characters/${savedChar.id}`)
                } catch (e: any) {
                  console.error('Save failed', e)
                  alert('Ошибка при сохранении персонажа')
                }
              }}
            />

          )}

          {isUserDetail && (
            <UserProfileView 
              userId={id!}
              users={users}
              currentUser={currentUser!}
              onBack={() => navigate('/admin/users')}
              onDelete={async (uid) => {
                try {
                  await ApiClient.delete('auth', `/users/${uid}`)
                  setUsers(prev => prev.filter(u => u.id !== uid))
                  navigate('/admin/users')
                } catch (e: any) {
                  console.error('Failed to delete user:', e)
                  alert(e.message || 'Ошибка удаления пользователя')
                }
              }}
              onChangeRole={async (uid, role) => {
                try {
                  const res = await ApiClient.patch<User>('auth', `/users/${uid}/role`, { role })
                  setUsers(prev => prev.map(u => u.id === uid ? res : u))
                } catch (e: any) {
                  console.error('Failed to update user role:', e)
                  alert(e.message || 'Ошибка изменения роли')
                }
              }}
            />
          )}

          {isPersonaDetail && (
            <PersonaProfileView 
              personaId={id!}
              personas={personas}
              users={users}
              allLorebooks={allLorebooks}
              onBack={() => navigate('/admin/personas')}
              onDeletePersona={(uid) => {
                setPersonas(prev => prev.filter(p => p.id !== uid))
                navigate('/admin/personas')
              }}
            />
          )}

          {activeTab === 'scenarios' && !isScenarioDetail && (
            <div className={styles.sectionWrapper}>
              <ScenarioSection 
                scenarios={scenarios}
                characters={characters}
                onSelectScenario={(sid) => navigate(`/admin/scenarios/${sid}`)}
                onToggleFilter={() => setIsFilterOpen(true)}
                isFilterActive={isAnyFilterActive}
                onSort={handleSort}
                renderSortIcon={(f) => <SortIcon field={f} />}
              />
            </div>
          )}

          {isScenarioDetail && (
            <ScenarioProfileView 
              scenarioId={detailId!}
              scenarios={scenarios}
              characters={characters}
              onBack={() => navigate('/admin/scenarios')}
              onDelete={(id) => {
                setScenarios(prev => prev.filter(s => s.id !== id))
              }}
              onSave={async (scenario) => {
                try {
                  if (detailId === 'create') {
                    const saved = await scenariosApi.createScenario(scenario)
                    setScenarios(prev => [saved, ...prev])
                    navigate(`/admin/scenarios/${saved.id}`)
                  } else {
                    const saved = await scenariosApi.updateScenario(detailId!, scenario)
                    setScenarios(prev => prev.map(s => s.id === saved.id ? saved : s))
                  }
                  success('Сценарий сохранен')
                } catch (e) {
                  console.error(e)
                  alert('Ошибка сохранения')
                }
              }}
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
          lorebooks={[...lorebooksFandom, ...lorebooksCharacter, ...lorebooksPersona]}
        />
      </main>
    </div>
  )
}
