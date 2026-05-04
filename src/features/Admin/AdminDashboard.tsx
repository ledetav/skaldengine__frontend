import { useState } from 'react'
import { useParams, useLocation, useNavigate, Navigate } from 'react-router-dom'

import styles from './styles'
import { AdminSidebar, type AdminTab } from './components/AdminSidebar'
import { CharacterSection } from './components/CharacterSection'
import { LorebookSection } from './components/LorebookSection'
import { CharacterProfileView } from './components/CharacterProfileView'
import { UserProfileView } from './components/UserProfileView'
import { PersonaProfileView } from './components/PersonaProfileView'
import { ScenarioSection } from './components/ScenarioSection'
import { ScenarioProfileView } from './components/ScenarioProfileView'
import { AdminFilterModal } from './components/AdminFilterModal'
import { UsersSection } from './components/UsersSection'
import { PersonasSection } from './components/PersonasSection'

import { useProfile } from '@/core/hooks/useProfile'
import { useToast } from '@/components/ui'
import { ApiClient } from '@/core/api/client'
import { scenariosApi } from '@/core/api/scenarios'

import { useAdminData } from './hooks/useAdminData'
import { useAdminFilters, type FilterState } from './hooks/useAdminFilters'
import { useAdminNavigation } from './hooks/useAdminNavigation'

import type { Character } from './types'

export default function AdminDashboard() {
  const { id } = useParams<{ id: string }>()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { success } = useToast()

  const [activeTab, setActiveTab] = useState<AdminTab>('characters')
  const [currentPage, setCurrentPage] = useState<Record<string, number>>({
    characters: 1, lorebooks_fandom: 1, lorebooks_character: 1,
    lorebooks_persona: 1, users: 1, personas: 1, scenarios: 1,
  })

  const isDebug = pathname.includes('/debug')
  const { profile: currentUser, isLoading } = useProfile(undefined)
  const roleFromStorage = localStorage.getItem('user_role')
  const effectiveRole = currentUser?.role || (isDebug ? roleFromStorage : null)
  const isAdmin = effectiveRole === 'admin' || effectiveRole === 'moderator'

  // Data hook — загрузка, WS, пагинация
  const {
    characters, lorebooksFandom, lorebooksCharacter, lorebooksPersona,
    users, personas, scenarios, allLorebooks, isDataLoading,
    setCharacters,
    setUsers, setPersonas, setScenarios,
  } = useAdminData(isAdmin, activeTab, pathname, currentPage)

  // Sorting state
  const [sortField, setSortField] = useState('')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const handleSort = (field: string) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }
  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <span style={{ opacity: 0.2, marginLeft: '4px' }}>⇅</span>
    return sortDir === 'asc'
      ? <span style={{ color: 'var(--accent-purple)', marginLeft: '4px' }}>↑</span>
      : <span style={{ color: 'var(--accent-purple)', marginLeft: '4px' }}>↓</span>
  }

  // Filter state
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [activeFilters, setActiveFilters] = useState<FilterState>({})
  const [userSearch, setUserSearch] = useState('')
  const [personaSearch, setPersonaSearch] = useState('')

  // Filters hook — filtered lists
  const { filteredUsers, filteredPersonas, filteredCharacters, filteredLorebooks, isFilterActiveForTab } = useAdminFilters({
    characters, users, personas, lorebooksFandom, lorebooksCharacter, lorebooksPersona,
    activeTab, activeFilters, sortField, sortDir, userSearch, personaSearch,
  })

  // Navigation hook — sync tab with URL
  useAdminNavigation({
    pathname, activeTab, lorebooksFandom, lorebooksCharacter, lorebooksPersona,
    onTabChange: (tab) => setActiveTab(tab),
    onPageReset: (tab) => setCurrentPage(prev => ({ ...prev, [tab]: 1 })),
  })

  // Route detection
  const isCreateRoute = pathname.includes('/create')
  const detailId = id || (isCreateRoute ? 'create' : undefined)
  const isCharacterDetail = detailId && pathname.includes('/characters/') && !pathname.includes('/lorebooks/')
  const isUserDetail = pathname.includes('/users/') && detailId
  const isPersonaDetail = pathname.includes('/personas/') && detailId
  const isLorebookDetail = pathname.includes('/admin/lorebooks/') && detailId
  const isScenarioDetail = pathname.includes('/admin/scenarios/') && detailId
  const isDetailView = isCharacterDetail || isUserDetail || isPersonaDetail || isLorebookDetail || isScenarioDetail

  const isAnyFilterActive = isFilterActiveForTab(activeFilters, activeTab)

  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    const t = e.currentTarget
    if (t.scrollHeight - t.scrollTop - t.clientHeight < 150 && !isDataLoading) {
      setCurrentPage(prev => ({ ...prev, [activeTab]: (prev[activeTab] || 1) + 1 }))
    }
  }

  if (isLoading) return (
    <div className={styles.adminPage}>
      <div style={{ padding: '40px', color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>Загрузка...</div>
    </div>
  )
  if (!isAdmin) return <Navigate to="/dashboard" replace />
  if (!currentUser && !pathname.includes('/debug')) return <Navigate to="/auth" replace />

  const moderatorBlocked: AdminTab[] = ['users', 'lorebooks_fandom', 'lorebooks_persona']
  if (effectiveRole === 'moderator' && moderatorBlocked.includes(activeTab)) {
    return <Navigate to="/admin/characters" replace />
  }

  const tabTitle: Record<AdminTab, string> = {
    users: 'Управление пользователями',
    personas: 'Персоны пользователей',
    characters: 'Персонажи',
    lorebooks_fandom: 'Лорбуки фандомов',
    lorebooks_character: 'Лорбуки персонажей',
    lorebooks_persona: 'Лорбуки персон',
    scenarios: 'Сценарии',
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
            <h1 className={styles.mainTitle}>{tabTitle[activeTab]}</h1>
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
                {currentUser?.avatar_url
                  ? <img src={currentUser.avatar_url} alt="" />
                  : (currentUser?.login || currentUser?.username || 'A').charAt(0).toUpperCase()
                }
                <div className={styles.statusIndicator} />
              </div>
              <button className={styles.logoutBtn} style={{ marginLeft: '12px', opacity: 0.5 }} onClick={() => {
                localStorage.removeItem('token')
                localStorage.removeItem('user_role')
                window.dispatchEvent(new Event('auth-change'))
                navigate('/login')
              }} title="Выйти">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
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
            <UsersSection
              users={filteredUsers}
              onSelectUser={(uid) => navigate(`/admin/users/${uid}`)}
              onToggleFilter={() => setIsFilterOpen(true)}
              isFilterActive={isAnyFilterActive}
              onSort={handleSort}
              renderSortIcon={(f) => <SortIcon field={f} />}
              search={userSearch}
              onSearchChange={setUserSearch}
            />
          )}

          {activeTab === 'personas' && !isPersonaDetail && (
            <PersonasSection
              personas={filteredPersonas}
              users={users}
              onSelectPersona={(pid) => navigate(`/admin/personas/${pid}`)}
              onToggleFilter={() => setIsFilterOpen(true)}
              isFilterActive={isAnyFilterActive}
              onSort={handleSort}
              renderSortIcon={(f) => <SortIcon field={f} />}
              search={personaSearch}
              onSearchChange={setPersonaSearch}
            />
          )}

          {isCharacterDetail && (
            <CharacterProfileView
              characterId={detailId!}
              characters={characters}
              allLorebooks={allLorebooks}
              onBack={() => navigate('/admin/characters')}
              onUpdateCharacter={(updated) => {
                if (detailId !== 'create') {
                  setCharacters(prev => prev.map(c => c.id === updated.id ? updated : c))
                }
              }}
              onDelete={(deletedId) => {
                setCharacters(prev => prev.filter(c => c.id !== deletedId))
              }}
              onSave={async (char) => {
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
                  const res = await ApiClient.patch<any>('auth', `/users/${uid}/role`, { role })
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
