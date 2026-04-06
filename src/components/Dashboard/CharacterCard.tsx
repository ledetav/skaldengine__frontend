import React from 'react'
import type { Character } from '../../types/character'
import styles from '../../styles/screens/Dashboard/DashboardScreen.module.css'

interface CharacterCardProps {
  character: Character
}

export const CharacterCard: React.FC<CharacterCardProps> = ({ character }) => {
  const getIcon = () => {
    const fandom = character.fandom?.toLowerCase() || ''
    if (fandom.includes('cthulhu') || fandom.includes('horror')) return '👁️'
    if (fandom.includes('cyberpunk') || fandom.includes('sci-fi')) return '🤖'
    if (fandom.includes('fantasy')) return '⚔️'
    if (fandom.includes('steampunk')) return '⚙️'
    return '👤'
  }

  return (
    <div className={styles.characterCard}>
      {/* 1. Image Area (TOP) */}
      <div className={styles.cardImageArea}>
        <div className={styles.cardIconGlow} />
        <span className={styles.cardIcon}>{getIcon()}</span>
        
        {/* NSFW Badge */}
        {character.is_nsfw && (
          <div className={styles.nsfwBadge}>
            NSFW
          </div>
        )}

        {/* Hover Action */}
        <div className={styles.cardHoverOverlay}>
          <button className={styles.startChatBtn}>
            Начать чат
          </button>
        </div>
      </div>

      {/* 2. Creator Bar (MIDDLE) */}
      <div className={styles.cardCreatorBar}>
        <div className={styles.creatorAvatarMini}>
          {character.creator_id?.[1]?.toUpperCase() || 'S'}
        </div>
        <div className={styles.creatorInfoStack}>
          <span className={styles.creatorNameMini}>{character.creator_id || '@System'}</span>
          <div className={styles.cardStats}>
            <span className={styles.statItem} title="Чатов за месяц">
              <span className={styles.statIcon}>📅</span> 24
            </span>
            <span className={styles.statItem} title="Всего чатов">
              <span className={styles.statIcon}>💬</span> 1.2k
            </span>
          </div>
        </div>
      </div>

      {/* 3. Info Section (BOTTOM) */}
      <div className={styles.cardBody}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardName}>{character.name}</h3>
          {character.fandom && <span className={styles.cardFandom}>{character.fandom}</span>}
        </div>
        <p className={styles.cardDesc}>{character.description}</p>
      </div>
    </div>
  )
}
