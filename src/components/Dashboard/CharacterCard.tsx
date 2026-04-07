import React from 'react'
import type { Character } from '../../types/character'
import styles from '../../styles/screens/Dashboard/DashboardScreen.module.css'

interface CharacterCardProps {
  character: Character
  viewMode?: 'grid' | 'list'
  isHotOverride?: boolean
}

export const CharacterCard: React.FC<CharacterCardProps> = ({ character, viewMode = 'grid', isHotOverride }) => {
  const getIcon = () => {
    const fandom = character.fandom?.toLowerCase() || ''
    if (fandom.includes('cthulhu') || fandom.includes('horror')) return '👁️'
    if (fandom.includes('cyberpunk') || fandom.includes('sci-fi')) return '🤖'
    if (fandom.includes('fantasy')) return '⚔️'
    if (fandom.includes('steampunk')) return '⚙️'
    return '👤'
  }

  // New: created within last 7 days
  const isNew = character.created_at 
    ? (new Date().getTime() - new Date(character.created_at).getTime()) < 7 * 24 * 60 * 60 * 1000 
    : false
  
  // Hot: if passed from parent (top 5 by monthly chats)
  const isHot = isHotOverride

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
        {character.nsfw_allowed && (
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
              <span className={styles.statIcon}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </span> {character.monthly_chats_count?.toLocaleString() || 0}
            </span>
            <span className={styles.statItem} title="Всего чатов">
              <span className={styles.statIcon}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </span> {character.total_chats_count?.toLocaleString() || 0}
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
