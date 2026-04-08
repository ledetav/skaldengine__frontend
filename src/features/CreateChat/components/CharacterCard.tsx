import React from 'react'
import type { Character } from '@/core/types/character'
import styles from './CharacterCard.module.css'

interface CharacterCardProps {
  character: Character
  scenariosCount: number
}

export const CharacterCard: React.FC<CharacterCardProps> = ({ character, scenariosCount }) => {
  return (
    <div className={styles.characterCard}>
      {/* Top Part: Cover & Overlay */}
      <div className={styles.characterCoverContainer}>
        <img 
          src={character.card_image_url || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1000&auto=format&fit=crop'} 
          alt="Cover" 
          className={styles.characterCover}
        />
        <div className={styles.characterCoverGradient} />
        
        <div className={styles.characterOverlay}>
          <div className={styles.avatarCircle}>
            <img src={character.avatar_url} alt={character.name} />
          </div>
          <div className={styles.characterMainInfo}>
            <h1>{character.name}</h1>
            <span className={styles.fandomOverlay}>{character.fandom}</span>
          </div>
        </div>
      </div>

      {/* Content Part */}
      <div className={styles.characterDetails}>
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
            <span className={styles.statValue}>{character.total_chats_count || 0}</span>
          </div>
        </div>

        <div className={styles.separator} />

        <div className={styles.lorebookWarning}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff6b00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p>
            У этого персонажа еще нет заполненного Лорбука. Из-за отсутствия базы знаний возможны фактологические искажения или галлюцинации в ответах.
          </p>
        </div>
      </div>
    </div>
  )
}
