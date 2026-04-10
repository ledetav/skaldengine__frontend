import { useState } from 'react'

import styles from './Admin.module.css'
import { AdminSidebar, type AdminTab } from './components/AdminSidebar'
import { CharacterSection } from './components/CharacterSection'
import { LorebookSection } from './components/LorebookSection'
import { CharacterProfileView } from './components/CharacterProfileView'
import { mockCharacters, mockLorebooks } from './mockData'
import type { Character, Lorebook } from './types'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>('characters')
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null)
  
  // State lifted from children for real-time updates
  const [characters, setCharacters] = useState(mockCharacters)
  const [lorebooks, setLorebooks] = useState(mockLorebooks)

  const handleUpdateCharacter = (updatedChar: Character) => {
    setCharacters(prev => prev.map(c => c.id === updatedChar.id ? updatedChar : c))
  }

  const handleUpdateLorebooks = (updatedLorebooks: Lorebook[]) => {
    setLorebooks(updatedLorebooks)
  }
  
  // Mock current user for the badge
  const currentUser = {
    username: 'nordh',
    login: 'Nordh',
    role: 'admin',
    avatar_url: null
  }

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

      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className={styles.mainContainer}>
        <header className={styles.mainHeader}>
          <div className={styles.titleGroup}>
            <h1 className={styles.mainTitle}>
              {activeTab === 'characters' && 'Управление Персонажами'}
              {activeTab === 'lorebooks_fandom' && 'Лорбуки Миров'}
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
          {activeTab === 'characters' && !selectedCharacterId && (
            <CharacterSection 
              characters={characters}
              onSelectCharacter={setSelectedCharacterId} 
            />
          )}
          {(activeTab === 'lorebooks_fandom' || activeTab === 'lorebooks_character') && (
            <LorebookSection 
              type={activeTab === 'lorebooks_fandom' ? 'fandom' : 'character'} 
              lorebooks={lorebooks}
            />
          )}
          {selectedCharacterId && (
            <CharacterProfileView 
              characterId={selectedCharacterId} 
              characters={characters}
              allLorebooks={lorebooks}
              onBack={() => setSelectedCharacterId(null)} 
              onUpdateCharacter={handleUpdateCharacter}
              onUpdateLorebooks={handleUpdateLorebooks}
            />
          )}
        </section>
      </main>
    </div>
  )
}
