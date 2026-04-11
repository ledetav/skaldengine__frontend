import { useState, useEffect } from 'react'
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

  const isCreateMode = pathname.includes('/create/')
  
  const NEW_CHARACTER: Character = {
    id: 'new-' + Date.now(),
    name: '',
    description: '',
    fandom: '',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=new',
    card_image_url: '',
    appearance: '',
    personality: '',
    total_chats_count: 0,
    monthly_chats_count: 0,
    nsfw_allowed: false,
    is_public: true,
    is_deleted: false
  }

  const [tempNewCharacter, setTempNewCharacter] = useState<Character | null>(null)

  // Initialize temp character for create mode
  useEffect(() => {
    if (isCreateMode && !tempNewCharacter) {
      setTempNewCharacter(NEW_CHARACTER)
    } else if (!isCreateMode) {
      setTempNewCharacter(null)
    }
  }, [isCreateMode])

  const handleUpdateCharacter = (updatedChar: Character) => {
    if (isCreateMode) {
      setTempNewCharacter(updatedChar)
    } else {
      setCharacters(prev => prev.map(c => c.id === updatedChar.id ? updatedChar : c))
    }
  }

  const handleSaveNewCharacter = () => {
    if (tempNewCharacter) {
      setCharacters(prev => [tempNewCharacter, ...prev])
      navigateDebug(`/admin/characters/${tempNewCharacter.id}`)
    }
  }

  const handleUpdateLorebooks = (updatedLorebooks: Lorebook[]) => {
    setLorebooks(updatedLorebooks)
  }

  // Auto-switch tab and detail state based on URL
  useEffect(() => {
    if (pathname.includes('/lorebooks/fandom/')) {
      setActiveTab('lorebooks_fandom')
    } else if (pathname.includes('/lorebooks/characters/')) {
      setActiveTab('lorebooks_character')
    } else if (pathname.includes('/lorebooks/personas/')) {
      setActiveTab('lorebooks_persona')
    } else if (pathname.includes('/lorebooks/') && id) {
      const lb = lorebooks.find(l => l.id === id)
      if (lb) {
        if (lb.fandom) setActiveTab('lorebooks_fandom')
        else if (lb.character_id) setActiveTab('lorebooks_character')
        else if (lb.user_persona_id) setActiveTab('lorebooks_persona')
      }
    } else if (pathname.includes('/characters/') || isCreateMode) {
      setActiveTab('characters')
    } else if (pathname.includes('/users/')) {
      setActiveTab('users')
    } else if (pathname.includes('/personas/')) {
      setActiveTab('personas')
    }
  }, [id, pathname, lorebooks, isCreateMode])

  // Get profile state for the badge and access control
  const isDebug = pathname.includes('/debug')
  const { user: profileUser, isLoading } = useProfile(undefined, isDebug)
  
  if (isLoading) return null

  if (!profileUser && !isDebug) {
    return <Navigate to="/" replace />
  }

  const currentUser = profileUser || {
    username: 'nordh',
    login: 'Nordh',
    role: 'admin',
    avatar_url: null
  }

  // Final check: only admin and moderator can access admin panel
  if (currentUser.role === 'user') {
    return <Navigate to={isDebug ? '/login/debug' : '/'} replace />
  }

  const isDetailView = (pathname.includes('/characters/') || isCreateMode) && (id || tempNewCharacter)
  const isLorebookDetail = pathname.includes('/lorebooks/') && id && !pathname.includes('/fandom/') && !pathname.includes('/characters/')

  return (
    <div className={styles.adminPage}>
      {/* Premium Background Elements */}
      <div className={styles.bgContainer}>
        <div className={styles.bgGrid} />
        <div className={styles.bgOverlay} />
        <div className={`${styles.orb} ${styles.orbPurple}`} />
        <div className={`${styles.orb} ${styles.orbPink}`} />
        <div className={`${styles.orb} ${styles.orbOrange}`} />
      </div>

      <AdminSidebar activeTab={activeTab} />
      
      <main className={styles.mainContainer}>
        <header className={styles.mainHeader}>
          <div className={styles.titleGroup}>
            <h1 className={styles.mainTitle}>
              {activeTab === 'users' && 'Управление Пользователями'}
              {activeTab === 'personas' && 'Персоны Пользователей'}
              {activeTab === 'characters' && 'Персонажи AI'}
              {activeTab === 'lorebooks_fandom' && 'Лорбуки Вселенных'}
              {activeTab === 'lorebooks_character' && 'Лорбуки Героев AI'}
              {activeTab === 'lorebooks_persona' && 'Лорбуки Персон'}
            </h1>
            <p className={styles.mainSubtitle}>Система мониторинга и редактирования контента</p>
          </div>
          
          <div className={styles.headerActions}>
            <div className={styles.userBadge}>
              <div className={styles.userBadgeInfo}>
                <span className={styles.userBadgeName}>
                  {currentUser.full_name || currentUser.login || currentUser.username || 'Admin'}
                </span>
                <span className={styles.userBadgeRole}>
                  {currentUser.role === 'admin' ? 'Master Admin' : 'Moderator'}
                </span>
              </div>
              <div className={styles.userBadgeAvatar}>
                {currentUser.avatar_url ? (
                  <img src={currentUser.avatar_url} alt="" />
                ) : (
                  (currentUser.login || currentUser.username || 'A').charAt(0).toUpperCase()
                )}
                <div className={styles.statusIndicator} />
              </div>
            </div>
          </div>
        </header>

        <section className={styles.contentArea}>
          {activeTab === 'characters' && !isDetailView && (
            <CharacterSection 
              characters={characters}
              onSelectCharacter={(cid) => navigateDebug(`/admin/characters/${cid}`)} 
            />
          )}

          {(activeTab === 'lorebooks_fandom' || activeTab === 'lorebooks_character' || activeTab === 'lorebooks_persona') && !isLorebookDetail && (
            <LorebookSection 
              type={activeTab === 'lorebooks_fandom' ? 'fandom' : activeTab === 'lorebooks_persona' ? 'persona' : 'character'} 
              lorebooks={lorebooks}
            />
          )}

          {activeTab === 'users' && (
            <div className={styles.tableWrapper}>
              <table className={styles.compactTable}>
                <thead>
                  <tr>
                    <th>Пользователь</th>
                    <th>Роль</th>
                    <th>Email</th>
                    <th>Дата регистрации</th>
                    <th>ID</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '24px', height: '24px', borderRadius: '50%', overflow: 'hidden', background: 'var(--bg-card)' }}>
                            {u.avatar_url && <img src={u.avatar_url} alt="" style={{ width: '100%', height: '100%' }} />}
                          </div>
                          <span style={{ fontWeight: 700 }}>{u.full_name || u.login || u.username}</span>
                        </div>
                      </td>
                      <td><Badge variant={u.role === 'admin' ? 'orange' : 'purple'}>{u.role}</Badge></td>
                      <td><span style={{ opacity: 0.7 }}>{u.email}</span></td>
                      <td><span style={{ opacity: 0.5, fontSize: '0.8rem' }}>{new Date(u.created_at).toLocaleDateString()}</span></td>
                      <td><code style={{ fontSize: '0.7rem', opacity: 0.3 }}>{u.id}</code></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'personas' && (
            <div className={styles.grid}>
              {personas.map(p => (
                <div key={p.id} className={styles.adminCard}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', background: 'var(--bg-card)' }}>
                      {p.avatar_url && <img src={p.avatar_url} alt="" style={{ width: '100%', height: '100%' }} />}
                    </div>
                    <div>
                      <h3 className={styles.cardName} style={{ margin: 0 }}>{p.name}</h3>
                      <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>Владелец: {p.owner_id}</span>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.85rem', opacity: 0.7, marginBottom: '12px', minHeight: '3em' }}>{p.description}</p>
                  <div className={styles.cardStats}>
                    <div className={styles.statItem}>
                      <span className={styles.statLabel}>Чаты</span>
                      <span className={styles.statValue}>{p.chat_count}</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statLabel}>Лоры</span>
                      <span className={styles.statValue}>{p.lorebook_count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {isDetailView && (
            <CharacterProfileView 
              characterId={isCreateMode ? tempNewCharacter!.id : id!} 
              characters={characters}
              allLorebooks={lorebooks}
              onBack={() => navigateDebug('/admin/characters')} 
              onUpdateCharacter={handleUpdateCharacter}
              onUpdateLorebooks={handleUpdateLorebooks}
              onSave={isCreateMode ? handleSaveNewCharacter : undefined}
            />
          )}
        </section>
      </main>
    </div>
  )
}
