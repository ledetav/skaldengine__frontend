import React from 'react'
import type { Character } from '../../types/character'
import styles from '../../styles/screens/Dashboard/DashboardScreen.module.css'

interface CharacterCardProps {
  character: Character
  viewMode?: 'grid' | 'list'
}

export const CharacterCard: React.FC<CharacterCardProps> = ({ character, viewMode = 'grid' }) => {
  const getIcon = () => {
    const fandom = character.fandom?.toLowerCase() || ''
    if (fandom.includes('cthulhu') || fandom.includes('horror')) return '👁️'
    if (fandom.includes('cyberpunk') || fandom.includes('sci-fi')) return '🤖'
    if (fandom.includes('fantasy')) return '⚔️'
    if (fandom.includes('steampunk')) return '⚙️'
    return '👤'
  }

  const isNew = character.created_at ? (new Date().getTime() - new Date(character.created_at).getTime()) < 30 * 24 * 60 * 60 * 1000 : false
  const isHot = (character.total_chats || 0) > 10000 || (character.monthly_chats || 0) > 500

  const cardClass = `${styles.characterCard} ${viewMode === 'list' ? styles.isListView : ''}`

  return (
    <div className={cardClass}>
      {/* 1. Image Area (TOP) */}
      <div className={styles.cardImageArea}>
        <div className={styles.cardIconGlow} />
        <span className={styles.cardIcon}>{getIcon()}</span>
        
        {/* Top Badges */}
        <div className={styles.topBadgesRow}>
          {isNew && <div className={styles.newBadge}>NEW</div>}
          {isHot && <div className={styles.hotBadge}>HOT</div>}
        </div>

        {/* NSFW Badge */}
        {character.is_nsfw && (
          <div className={styles.nsfwBadge}>
            NSFW
          </div>
        )}
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
              <span className={styles.statIcon}>📅</span> {character.monthly_chats?.toLocaleString() || 0}
            </span>
            <span className={styles.statItem} title="Всего чатов">
              <span className={styles.statIcon}>💬</span> {character.total_chats?.toLocaleString() || 0}
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
        
        {/* Mobile-only visible button */}
        <button className={styles.mobileStartChatBtn}>
          Начать чат
        </button>
      </div>

      {/* Hover Action (Covers the whole card) */}
      <div className={styles.cardHoverOverlay}>
        <button className={styles.startChatBtn}>
          Начать чат
        </button>
      </div>
    </div>
  )
}
