import React from 'react'
import type { Character } from '@/core/types/character'
import type { UserProfile } from '@/core/types/profile'
import { Link } from 'react-router-dom'
import styles from './CharacterCard.module.css'

interface CharacterCardProps {
  character: Character
  scenariosCount: number
  currentUser?: UserProfile | null
  hasFullLorebook?: boolean
}

export const CharacterCard: React.FC<CharacterCardProps> = ({ 
  character, 
  scenariosCount, 
  currentUser,
  hasFullLorebook 
}) => {
  const isOwner = currentUser?.id === character.creator_id
  const isAdmin = currentUser?.role === 'admin'
  const isModerator = currentUser?.role === 'moderator'
  
  const canEdit = isAdmin || (isModerator && isOwner)

  return (
    <div className={styles.characterCard}>
      {/* Top Part: Cover */}
      <div className={styles.characterCoverContainer}>
        <img 
          src={character.card_image_url || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1000&auto=format&fit=crop'} 
          alt="Cover" 
          className={styles.characterCover}
        />
        <div className={styles.characterCoverGradient} />
      </div>

      {/* Content Part */}
      <div className={styles.characterDetails}>
        
        {/* Profile Header (Moved from Overlay) */}
        <div className={styles.profileHeader}>
          <div className={styles.avatarCircle}>
            <img src={character.avatar_url} alt={character.name} />
          </div>
          <div className={styles.characterMainInfo}>
            <h1>{character.name}</h1>
            <span className={styles.fandomOverlay}>{character.fandom || 'Оригинальный'}</span>
          </div>
        </div>

        <p className={styles.description}>
          {character.description}
        </p>

        <div className={styles.separator} />

        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>За месяц</span>
            <span className={styles.statValue}>{character.monthly_chats_count?.toLocaleString()}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>За всё время</span>
            <span className={styles.statValue}>{character.total_chats_count?.toLocaleString()}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Сценариев</span>
            <span className={styles.statValue}>{scenariosCount}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>По сценариям</span>
            <span className={styles.statValue}>{character.scenario_chats_count || 0}</span>
          </div>
        </div>

        {canEdit && (
          <div className={styles.adminActions}>
            <Link to={`/admin/characters/${character.id}/edit`} className={styles.editBtn}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Редактировать персонажа
            </Link>
          </div>
        )}

        <div className={styles.separator} />

        {!hasFullLorebook && (
          <div className={styles.lorebookWarning}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff6b00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p>
              У этого персонажа еще нет заполненного Лорбука. Из-за отсутствия базы знаний возможны фактологические искажения или галлюцинации в ответах.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
