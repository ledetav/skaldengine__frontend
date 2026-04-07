import React from 'react'
import { CharacterCard } from './CharacterCard'
import type { Character } from '../../types/character'
import { ErrorScreen } from '../Common/ErrorScreen'
import { LoadingScreen } from '../Common/LoadingScreen'
import styles from '../../styles/screens/Dashboard/DashboardScreen.module.css'

interface DashboardCharacterGridProps {
  characters: Character[]
  isLoading: boolean
  error: string | null
  viewMode: 'grid' | 'list'
  hotIds: string[]
}

export const DashboardCharacterGrid: React.FC<DashboardCharacterGridProps> = ({
  characters,
  isLoading,
  error,
  viewMode,
  hotIds
}) => {
  return (
    <div className={viewMode === 'grid' ? styles.characterGrid : styles.characterList}>
      {isLoading ? (
        <LoadingScreen minimal />
      ) : error ? (
        <ErrorScreen title="Ошибка загрузки" message={error} minimal />
      ) : (
        characters.map(char => (
          <CharacterCard 
            key={char.id} 
            character={char} 
            viewMode={viewMode}
            isHotOverride={hotIds.includes(char.id)}
          />
        ))
      )}
      {!isLoading && !error && characters.length === 0 && (
        <div className={styles.noResults}>
          <h3>Персонажи не найдены</h3>
          <p>Попробуйте изменить параметры поиска или фильтры</p>
        </div>
      )}
    </div>
  )
}
