import React, { useState } from 'react'
import type { UserPersona, GameModeType } from '../../types/chat'
import styles from './PersonaSelector.module.css'

interface PersonaSelectorProps {
  personas: UserPersona[]
  selectedPersonaId: string
  gameMode: GameModeType
  onSelect: (id: string) => void
  onCreateClick?: () => void
}

export const PersonaSelector: React.FC<PersonaSelectorProps> = ({ 
  personas, 
  selectedPersonaId, 
  gameMode,
  onSelect,
  onCreateClick
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const selectedPersona = personas.find(p => p.id === selectedPersonaId)

  return (
    <div className={styles.formGroup}>
      <label className={styles.groupLabel}>Ваш персонаж (Персона)</label>
      
      {isOpen && (
        <div className={styles.personaBackdrop} onClick={() => setIsOpen(false)} />
      )}

      <div className={`
        ${styles.personaSelector} 
        ${isOpen ? styles.isSelectorOpen : ''} 
        ${gameMode === 'sandbox' ? styles.modeSandbox : styles.modeScenario}
      `}>
        <div 
          className={`${styles.personaActiveCard} ${isOpen ? styles.isOpen : ''}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          {selectedPersona ? (
            <>
              <div className={styles.personaAvatarSquare}>
                <img src={selectedPersona.avatar_url} alt="Avatar" />
              </div>
              <div className={styles.personaContent}>
                <div className={styles.personaHeader}>
                  <span className={styles.personaName}>{selectedPersona.name}</span>
                  <span className={styles.personaMeta}>
                    {selectedPersona.age} лет, {selectedPersona.gender}
                  </span>
                </div>
                <p className={styles.personaDesc}>
                  {selectedPersona.description || selectedPersona.appearance}
                </p>
              </div>
            </>
          ) : (
            <span className={styles.placeholder}>Выберите персону</span>
          )}
          <div className={styles.dropdownArrow}>
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </div>
        </div>

        {isOpen && (
          <div className={styles.personaDropdown}>
            <div className={styles.personaOptionCreate} onClick={onCreateClick}>
              <div className={styles.createAvatarDash}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </div>
              <div className={styles.personaContent}>
                <span className={styles.createLabel}>Создать новую персону</span>
              </div>
            </div>
            
            {personas.map(persona => (
              <div 
                key={persona.id}
                className={`${styles.personaOptionCard} ${selectedPersonaId === persona.id ? styles.selected : ''}`}
                onClick={() => {
                  onSelect(persona.id)
                  setIsOpen(false)
                }}
              >
                <div className={styles.personaAvatarSquare}>
                  <img src={persona.avatar_url} alt={persona.name} />
                </div>
                <div className={styles.personaContent}>
                  <div className={styles.personaHeader}>
                    <span className={styles.personaName}>{persona.name}</span>
                    <span className={styles.personaMeta}>{persona.age} лет, {persona.gender}</span>
                  </div>
                  <p className={styles.personaDesc}>{persona.description || persona.appearance}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
