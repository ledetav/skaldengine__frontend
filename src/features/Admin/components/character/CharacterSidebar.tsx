import React from 'react'
import { Badge } from '@/components/ui'
import { SearchableSelect } from '../SearchableSelect'
import styles from '../../Admin.module.css'
import type { Character } from '../../types'

interface CharacterSidebarProps {
  character: Character
  isEditing: boolean
  isCreate: boolean
  isOriginal: boolean
  availableFandoms: string[]
  handleChange: (field: keyof Character, value: any) => void
  onEditClick: () => void
}

export function CharacterSidebar({
  character,
  isEditing,
  isCreate,
  isOriginal,
  availableFandoms,
  handleChange,
  onEditClick
}: CharacterSidebarProps) {
  return (
    <aside className={styles.sidebarWrapper}>
      <div className={styles.charSidebarCard}>
        <div className={styles.charCover}>
          <div className={styles.imageEditWrapper} style={{ height: '100%' }}>
            <img 
              src={character.card_image_url || (character.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${character.name || 'new'}`)} 
              className={styles.charCoverImg} 
              alt="Cover" 
            />
            {isEditing && (
              <div className={styles.pencilOverlay} onClick={onEditClick}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </div>
            )}
          </div>
          <div className={styles.charAvatarWrapper}>
            <div className={styles.imageEditWrapper} style={{ width: '100%', height: '100%' }}>
              <img src={character.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${character.name || 'new'}`} className={styles.charAvatar} alt={character.name} />
              {isEditing && (
                <div className={styles.pencilOverlay}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.charBasicInfo}>
          {isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', width: '100%' }}>
              <input 
                className={styles.editInput}
                value={character.name}
                onChange={(e) => handleChange('name', e.target.value)}
                style={{ textAlign: 'center', fontSize: '1.2rem', fontWeight: 950 }}
              />

              <div className={styles.typeSelector}>
                <div 
                  className={`${styles.typeTab} ${character.type === 'fandom' ? styles.typeTabActive : ''} ${styles.typeTabFandom}`}
                  onClick={() => handleChange('type', 'fandom')}
                >
                  Фандомный
                </div>
                <div 
                  className={`${styles.typeTab} ${character.type === 'original' ? styles.typeTabActive : ''} ${styles.typeTabOriginal}`}
                  onClick={() => handleChange('type', 'original')}
                >
                  Оригинальный
                </div>
              </div>
              
              {character.type === 'fandom' && (
                <SearchableSelect 
                  options={availableFandoms.map((f: string) => ({ id: f, name: f }))}
                  value={character.fandom || ''}
                  onChange={(val: string) => handleChange('fandom', val)}
                  placeholder="Выберите фандом"
                  className={styles.fandomSelect}
                />
              )}

              <div style={{ display: 'flex', gap: '8px', width: '100%', marginTop: '8px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', marginLeft: '4px', display: 'block', marginBottom: '2px' }}>Пол</label>
                  <input 
                    className={styles.editInput}
                    value={character.gender || ''}
                    onChange={(e) => handleChange('gender', e.target.value)}
                    placeholder="Пол"
                    style={{ fontSize: '0.85rem' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', marginLeft: '4px', display: 'block', marginBottom: '2px' }}>Возраст</label>
                  <input 
                    className={styles.editInput}
                    value={character.age || ''}
                    onChange={(e) => handleChange('age', e.target.value)}
                    placeholder="Возраст"
                    style={{ fontSize: '0.85rem' }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <>
              <h1 className={styles.charProfileName}>{character.name}</h1>
              <div style={{ marginBottom: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <Badge variant={isOriginal ? "orange" : "blue"}>{isOriginal ? 'Оригинальный' : (character.fandom || 'Фандомный')}</Badge>
                {(character.gender || character.age) && (
                  <Badge variant="teal">
                    {character.gender}{character.gender && character.age ? ', ' : ''}{character.age}
                  </Badge>
                )}
              </div>
            </>
          )}
          
          <div style={{ marginTop: '20px' }}>
            {isEditing ? (
              <textarea 
                className={styles.editTextarea}
                value={character.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Краткое описание персонажа..."
                style={{ fontSize: '0.85rem', minHeight: '80px' }}
              />
            ) : (
              <p style={{ 
                fontSize: '0.9rem', 
                color: 'rgba(255,255,255,0.45)', 
                lineHeight: '1.6',
                margin: 0,
                fontWeight: 500
              }}>
                {character.description}
              </p>
            )}
          </div>
        </div>

        {!isCreate && (
          <div className={styles.charStatsGrid}>
            <div className={styles.charStatBox}>
              <span className={styles.statLabel}>Всего чатов</span>
              <span className={styles.statValue}>{character.total_chats_count.toLocaleString()}</span>
            </div>
            <div className={styles.charStatBox}>
              <span className={styles.statLabel}>За месяц</span>
              <span className={styles.statValue}>{character.monthly_chats_count.toLocaleString()}</span>
            </div>
            
            <div className={styles.charStatBox} style={{ gridColumn: 'span 2' }}>
              <span className={styles.statLabel}>Количество сценариев</span>
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                <span className={styles.statValue}>{character.scenarios_count || 0}</span>
              </div>
            </div>

            <div className={styles.charStatBox} style={{ gridColumn: 'span 2', paddingBottom: '20px' }}>
              <span className={styles.statLabel}>Настройки доступа</span>
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                <Badge variant={character.is_public ? 'green' : 'red'}>
                  {character.is_public ? 'Public' : 'Private'}
                </Badge>
                {character.nsfw_allowed && (
                  <Badge variant="red">NSFW</Badge>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
