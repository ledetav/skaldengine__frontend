import React from 'react'
import type { Character } from '@/core/types/character'
import { Link, useLocation } from 'react-router-dom'
import styles from '@/theme/screens/Dashboard/DashboardScreen.module.css'

interface CharacterCardProps {
  character: Character
  viewMode?: 'grid' | 'list'
  isHotOverride?: boolean
}

/**
 * Карточка персонажа в каталоге витрины (Dashboard).
 * Отображает аватар/карточку, бейджи новизны, популярности и NSFW, автора,
 * счетчики диалогов и кнопку перехода к созданию чата.
 */
export const CharacterCard: React.FC<CharacterCardProps> = ({ character, viewMode = 'grid', isHotOverride }) => {
  const { pathname } = useLocation()
  const isDebug = pathname.includes('/debug')
  
  const getDebugHref = (baseHref: string) => {
    if (!isDebug) return baseHref;
    if (baseHref.endsWith('/debug')) return baseHref;
    return baseHref.replace(/\/?$/, '/debug');
  }
  const getIcon = () => {
    const fandom = character.fandom?.toLowerCase() || ''
    if (fandom.includes('cthulhu') || fandom.includes('horror')) return '👁️'
    if (fandom.includes('cyberpunk') || fandom.includes('sci-fi')) return '🤖'
    if (fandom.includes('fantasy')) return '⚔️'
    if (fandom.includes('steampunk')) return '⚙️'
    return '👤'
  }

  // Новинка: персонаж создан за последние 7 дней
  const isNew = character.created_at 
    ? (new Date().getTime() - new Date(character.created_at).getTime()) < 7 * 24 * 60 * 60 * 1000 
    : false
  
  // Популярное: передан флаг от родителя (входит в топ-5 по чатам за месяц)
  const isHot = isHotOverride

  const cardClass = `${styles.characterCard} ${viewMode === 'list' ? styles.isListView : ''}`

  return (
    <div className={cardClass}>
      {/* 1. Область изображения (верх) */}
      <div className={styles.cardImageArea}>
        {character.avatar_url || character.card_image_url ? (
          <img 
            src={character.avatar_url || character.card_image_url} 
            alt={character.name} 
            className={styles.cardAvatarLarge} 
          />
        ) : (
          <>
            <div className={styles.cardIconGlow} />
            <span className={styles.cardIcon}>{getIcon()}</span>
          </>
        )}
        
        {/* Верхние бейджи новизны и популярности */}
        <div className={styles.topBadgesRow}>
          {isNew && <div className={styles.newBadge}>NEW</div>}
          {isHot && <div className={styles.hotBadge}>HOT</div>}
        </div>

        {/* Бейдж контента для взрослых (NSFW) */}
        {character.nsfw_allowed && (
          <div className={styles.nsfwBadge}>
            NSFW
          </div>
        )}
      </div>

      {/* 2. Блок создателя персонажа (центр) */}
      <div className={styles.cardCreatorBar}>
        <div className={styles.creatorAvatarMini}>
          {character.author?.avatar_url ? (
            <img src={character.author.avatar_url} alt={character.author.username} className={styles.creatorAvatarImg} />
          ) : (
            character.author?.username?.[0]?.toUpperCase() || character.creator_id?.[0]?.toUpperCase() || 'S'
          )}
        </div>
        <div className={styles.creatorInfoStack}>
          <span className={styles.creatorNameMini}>
            {character.author?.username ? `@${character.author.username}` : (character.creator_id || 'System')}
          </span>
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

      {/* 3. Описание и характеристики (низ) */}
      <div className={styles.cardBody}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardName}>{character.name}</h3>
          <div className={styles.fandomBadge}>
            {character.type === 'original' ? 'Оригинальный' : (character.fandom || 'Общий')}
          </div>
        </div>
        <p className={styles.cardDesc}>{character.description}</p>
        
        {/* Кнопка быстрого запуска для мобильных экранов */}
        <Link to={getDebugHref(`/chat/create/${character.id}`)} className={styles.mobileStartChatBtn}>
          Начать чат
        </Link>
      </div>

      {/* Действие при наведении (на весь размер карточки) */}
      <div className={styles.cardHoverOverlay}>
        <Link to={getDebugHref(`/chat/create/${character.id}`)} className={styles.startChatBtn}>
          Начать чат
        </Link>
      </div>
    </div>
  )
}
