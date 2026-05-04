import styles from '../../styles'
import type { Character } from '../../types'

interface CharacterDetailsProps {
  character: Character
  isEditing: boolean
  handleChange: (field: keyof Character, value: any) => void
}

export function CharacterDetails({ character, isEditing, handleChange }: CharacterDetailsProps) {
  return (
    <>
      <div className={styles.detailGroup}>
        <div className={styles.detailTitle}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
          Внешность
        </div>
        {isEditing ? (
          <textarea 
            className={styles.editTextarea}
            value={character.appearance || ''}
            onChange={(e) => handleChange('appearance', e.target.value)}
            placeholder="Опишите внешность..."
          />
        ) : (
          <p className={styles.detailText}>{character.appearance || 'Описание внешности не задано.'}</p>
        )}
      </div>

      <div className={styles.detailGroup}>
        <div className={styles.detailTitle}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          Личность
        </div>
        {isEditing ? (
          <>
            <textarea 
              className={styles.editTextarea}
              value={character.personality || ''}
              onChange={(e) => handleChange('personality', e.target.value)}
              placeholder="Опишите личность..."
            />
            <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
              <div 
                className={`${styles.toggleRow} ${character.is_public ? styles.toggleActive : ''}`}
                onClick={() => handleChange('is_public', !character.is_public)}
              >
                <div className={styles.toggleSwitch} />
                <span className={styles.toggleLabel}>Публичный</span>
              </div>
              <div 
                className={`${styles.toggleRow} ${character.nsfw_allowed ? styles.toggleActive : ''}`}
                onClick={() => handleChange('nsfw_allowed', !character.nsfw_allowed)}
              >
                <div className={styles.toggleSwitch} />
                <span className={styles.toggleLabel}>Режим NSFW</span>
              </div>
            </div>
          </>
        ) : (
          <p className={styles.detailText}>{character.personality || 'Описание личности не задано.'}</p>
        )}
      </div>
    </>
  )
}
