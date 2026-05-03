import React from 'react'
import styles from '../../Admin.module.css'
import type { Character, Lorebook } from '../../types'

interface CharacterLorebooksProps {
  character: Character
  charLorebooks: Lorebook[]
  attachableLorebooks: Lorebook[]
  isEditing: boolean
  isOriginal: boolean
  isAddingLorebook: boolean
  setIsAddingLorebook: (v: boolean) => void
  toggleLorebook: (lbId: string) => void
}

export function CharacterLorebooks({
  character,
  charLorebooks,
  attachableLorebooks,
  isEditing,
  isOriginal,
  isAddingLorebook,
  setIsAddingLorebook,
  toggleLorebook
}: CharacterLorebooksProps) {
  return (
    <div className={styles.detailGroup}>
      <div className={styles.detailTitle}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
        Лорбуки персонажа
      </div>
      
      <div className={styles.lorebookList}>
        {isOriginal && (
          <div className={styles.infoNote}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px', color: 'var(--accent-orange)'}}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            Для оригинальных персонажей основной лорбук обязателен и не может быть удален.
          </div>
        )}
        {charLorebooks.length > 0 ? (
          charLorebooks.map((lb: Lorebook) => {
            const isActive = (character.lorebook_ids || []).includes(lb.id) || (isOriginal && lb.tags?.includes('main'))
            const isFandomMatch = character.fandom && lb.fandom === character.fandom && character.fandom !== ''
            
            return (
              <div 
                key={lb.id} 
                className={`
                  ${styles.lorebookMiniCard} 
                  ${isActive ? styles.lorebookMiniCardSelected : styles.lorebookMiniCardDeactivated}
                  ${isOriginal && lb.tags?.includes('main') ? styles.lorebookMainLocked : ''}
                `} 
                onClick={() => {
                  if (isOriginal && lb.tags?.includes('main')) return;
                  isEditing && toggleLorebook(lb.id);
                }}
                style={{ 
                  cursor: isEditing ? (isOriginal && lb.tags?.includes('main') ? 'not-allowed' : 'pointer') : 'default' 
                }}
              >
                <div className={styles.lorebookMiniInfo}>
                  <span className={styles.lorebookMiniName} style={{ opacity: isActive ? 1 : 0.6 }}>
                    {lb.name}
                    {isOriginal && lb.tags?.includes('main') && (
                      <span className={styles.mainLabel} title="Основной лорбук оригинального персонажа нельзя удалить">
                        (Основной)
                      </span>
                    )}
                  </span>
                  <span className={styles.lorebookMiniDesc} style={{ opacity: isActive ? 1 : 0.4 }}>
                    {lb.entries_count || lb.entries?.length || 0} записей {isFandomMatch ? '• Фандом' : '• Персональный'}
                  </span>
                  {isOriginal && lb.tags?.includes('main') && isEditing && (
                    <span className={styles.lockHint}>Обязательный для оригинального персонажа</span>
                  )}
                </div>
                {isActive && (
                  <div className={styles.checkMark}>
                    {isOriginal && lb.tags?.includes('main') ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    )}
                  </div>
                )}
              </div>
            )
          })
        ) : (
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.02)', 
            padding: '24px',
            borderRadius: '16px',
            color: 'rgba(255,255,255,0.3)',
            fontSize: '0.9rem',
            fontStyle: 'italic',
            textAlign: 'center',
            border: '1px solid rgba(255,255,255,0.03)'
          }}>
            Лорбуки не привязаны.
          </div>
        )}

        {isEditing && (
          <div style={{ marginTop: '12px', position: 'relative' }}>
            <button 
              className={styles.addLorebookBtn} 
              onClick={() => setIsAddingLorebook(!isAddingLorebook)}
            >
              {isAddingLorebook ? 'Закрыть список' : '+ Добавить лорбук'}
            </button>

            {isAddingLorebook && (
              <div className={styles.lorebookSelectionDropdown}>
                {attachableLorebooks.length > 0 ? (
                  attachableLorebooks
                    .map((lb: Lorebook) => (
                      <div 
                        key={lb.id} 
                        className={styles.lorebookOption} 
                        onClick={() => {
                          toggleLorebook(lb.id);
                          setIsAddingLorebook(false);
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span className={styles.lorebookOptionName}>
                            {lb.name}
                            {lb.character_id === character.id && (
                              <span style={{ fontSize: '0.65rem', color: 'var(--accent-orange)', marginLeft: '8px', opacity: 0.8 }}>
                                (Ваш лорбук)
                              </span>
                            )}
                          </span>
                          <span className={styles.lorebookOptionMeta}>{lb.entries?.length || 0} записей</span>
                        </div>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      </div>
                    ))
                ) : (
                  <div style={{ padding: '16px', color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', textAlign: 'center' }}>
                    Нет доступных лорбуков
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
