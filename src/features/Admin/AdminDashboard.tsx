import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'

import styles from './Admin.module.css'
import { AdminSidebar, type AdminTab } from './components/AdminSidebar'
import { CharacterSection } from './components/CharacterSection'
import { LorebookSection } from './components/LorebookSection'
import { CharacterProfileView } from './components/CharacterProfileView'
import { mockCharacters, mockLorebooks } from './mockData'
import type { Character, Lorebook } from './types'

export default function AdminDashboard() {
  const { id } = useParams<{ id: string }>()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  
  const [activeTab, setActiveTab] = useState<AdminTab>('characters')
  
  // State lifted from children for real-time updates
  const [characters, setCharacters] = useState(mockCharacters)
  const [lorebooks, setLorebooks] = useState(mockLorebooks)

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
      navigate(`/admin/characters/${tempNewCharacter.id}/debug`)
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
    } else if (pathname.includes('/lorebooks/') && id) {
      const lb = lorebooks.find(l => l.id === id)
      if (lb) {
        setActiveTab(lb.fandom ? 'lorebooks_fandom' : 'lorebooks_character')
      }
    } else if (pathname.includes('/characters/') || isCreateMode) {
      setActiveTab('characters')
    }
  }, [id, pathname, lorebooks, isCreateMode])

  // Mock current user for the badge
  const currentUser = {
    username: 'nordh',
    login: 'Nordh',
    role: 'admin',
    avatar_url: null
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
              {activeTab === 'characters' && 'Управление Персонажами'}
              {activeTab === 'lorebooks_fandom' && 'Лорбуки Фандомов'}
              {activeTab === 'lorebooks_character' && 'Лорбуки Героев'}
            </h1>
            <p className={styles.mainSubtitle}>Система мониторинга и редактирования контента</p>
          </div>
          
          <div className={styles.headerActions}>
            <div className={styles.userBadge}>
              <div className={styles.userBadgeInfo}>
                <span className={styles.userBadgeName}>{currentUser.login}</span>
                <span className={styles.userBadgeRole}>
                  {currentUser.role === 'admin' ? 'Master Admin' : 'Moderator'}
                </span>
              </div>
              <div className={styles.userBadgeAvatar}>
                {currentUser.avatar_url ? (
                  <img src={currentUser.avatar_url} alt="" />
                ) : (
                  currentUser.username.charAt(0).toUpperCase()
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
              onSelectCharacter={(cid) => navigate(`/admin/characters/${cid}/debug`)} 
            />
          )}

          {(activeTab === 'lorebooks_fandom' || activeTab === 'lorebooks_character') && !isLorebookDetail && (
            <LorebookSection 
              type={activeTab === 'lorebooks_fandom' ? 'fandom' : 'character'} 
              lorebooks={lorebooks}
            />
          )}

          {isDetailView && (
            <CharacterProfileView 
              characterId={isCreateMode ? tempNewCharacter!.id : id!} 
              characters={characters}
              allLorebooks={lorebooks}
              onBack={() => navigate('/admin/characters/debug')} 
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
