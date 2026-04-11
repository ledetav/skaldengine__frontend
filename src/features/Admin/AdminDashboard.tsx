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

  const { profile: currentUser, isLoading } = useProfile()
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'moderator' || pathname.includes('/debug')

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

  // --- Filtering Logic ---
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      if (activeFilters.roles?.length && !activeFilters.roles.includes(u.role)) return false
      if (activeFilters.regDateStart && new Date(u.created_at) < new Date(activeFilters.regDateStart)) return false
      if (activeFilters.regDateEnd && new Date(u.created_at) > new Date(activeFilters.regDateEnd)) return false
      return true
    })
  }, [users, activeFilters])

  const filteredPersonas = useMemo(() => {
    return personas.filter(p => {
      if (activeFilters.userIds?.length && !activeFilters.userIds.includes(p.owner_id)) return false
      if (activeFilters.chatCountMin !== undefined && (p.chat_count || 0) < activeFilters.chatCountMin) return false
      if (activeFilters.chatCountMax !== undefined && (p.chat_count || 0) > activeFilters.chatCountMax) return false
      if (activeFilters.lorebookCountMin !== undefined && (p.lorebook_count || 0) < activeFilters.lorebookCountMin) return false
      if (activeFilters.lorebookCountMax !== undefined && (p.lorebook_count || 0) > activeFilters.lorebookCountMax) return false
      return true
    })
  }, [personas, activeFilters])

  const filteredCharacters = useMemo(() => {
    return characters.filter(c => {
      if (activeFilters.fandoms?.length && !activeFilters.fandoms.includes(c.fandom || '')) return false
      if (activeFilters.isPublic === 'public' && !c.is_public) return false
      if (activeFilters.isPublic === 'private' && c.is_public) return false
      if (activeFilters.isNSFW === 'safe' && c.is_nsfw) return false
      if (activeFilters.isNSFW === 'nsfw' && !c.is_nsfw) return false
      return true
    })
  }, [characters, activeFilters])

  const filteredLorebooks = useMemo(() => {
    return lorebooks.filter(lb => {
      if (activeTab === 'lorebooks_fandom' && activeFilters.fandoms?.length && !activeFilters.fandoms.includes(lb.fandom || '')) return false
      if (activeTab === 'lorebooks_character' && activeFilters.characterIds?.length && !activeFilters.characterIds.includes(lb.character_id || '')) return false
      if (activeTab === 'lorebooks_persona' && activeFilters.characterIds?.length && !activeFilters.characterIds.includes(lb.user_persona_id || '')) return false
      
      const count = lb.entries?.length || lb.entries_count || 0
      if (activeFilters.entriesCountMin !== undefined && count < activeFilters.entriesCountMin) return false
      if (activeFilters.entriesCountMax !== undefined && count > activeFilters.entriesCountMax) return false
      return true
    })
  }, [lorebooks, activeFilters, activeTab])

  if (isLoading) return <div className={styles.adminPage}><div style={{ padding: '40px', color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>Загрузка...</div></div>
  if (!isAdmin) return <Navigate to="/dashboard" replace />
  if (!currentUser && !pathname.includes('/debug')) return <Navigate to="/auth" replace />

  const isAnyFilterActive = Object.keys(activeFilters).length > 0

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
            <button 
              className={`${styles.filterBtn} ${isAnyFilterActive ? styles.filterBtnActive : ''}`}
              onClick={() => setIsFilterOpen(true)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
              </svg>
              Фильтры
              {isAnyFilterActive && <span className={styles.statusDot} style={{ position: 'static', marginLeft: '4px' }} />}
            </button>

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
          </div>
        </header>

        <section className={styles.contentArea}>
          {activeTab === 'characters' && !isDetailView && (
            <CharacterSection 
              characters={filteredCharacters}
              onSelectCharacter={(cid) => navigateDebug(`/admin/characters/${cid}`)} 
            />
          )}

          {(activeTab === 'lorebooks_fandom' || activeTab === 'lorebooks_character' || activeTab === 'lorebooks_persona') && (
            <LorebookSection 
              type={activeTab === 'lorebooks_fandom' ? 'fandom' : activeTab === 'lorebooks_persona' ? 'persona' : 'character'} 
              lorebooks={filteredLorebooks}
              characters={characters}
              users={users}
              personas={personas}
            />
          )}

          {activeTab === 'users' && !isUserDetail && (
            <div className={styles.tableWrapper}>
              <table className={styles.compactTable}>
                <thead>
                  <tr>
                    <th>Имя пользователя</th>
                    <th>Никнейм</th>
                    <th>Роль</th>
                    <th>Дата регистрации</th>
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
          )}

          {activeTab === 'personas' && !isPersonaDetail && (
            <div className={styles.tableWrapper}>
              <table className={styles.compactTable}>
                <thead>
                  <tr>
                    <th>Разворот</th>
                    <th>Персона</th>
                    <th>Владелец</th>
                    <th>Чаты</th>
                    <th>Лорбуки</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPersonas.map(p => {
                    const owner = users.find(u => u.id === p.owner_id)
                    return (
                      <tr key={p.id} onClick={() => navigateDebug(`/admin/personas/${p.id}`)} style={{ cursor: 'pointer' }}>
                        <td style={{ width: '40px' }}><div className={styles.charAvatarWrapper} style={{ width: '32px', height: '32px', position: 'static' }}><img src={p.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${p.name}`} className={styles.charAvatar} alt="" /></div></td>
                        <td><span style={{ fontWeight: 700 }}>{p.name}</span></td>
                        <td><span style={{ opacity: 0.6, fontSize: '0.85rem' }}>{owner ? `@${owner.username}` : p.owner_id}</span></td>
                        <td><span style={{ fontWeight: 600 }}>{p.chat_count}</span></td>
                        <td><Badge variant="teal">{p.lorebook_count}</Badge></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
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
