import React, { useState } from 'react'
import styles from '@/theme/screens/Dashboard/DashboardScreen.module.css'

interface FandomInfo {
  name: string
  count: number
}

interface FandomFilterProps {
  availableFandoms: FandomInfo[]
  selectedFandoms: string[]
  onChange: (selected: string[]) => void
}

/**
 * Компонент фильтрации по фандомам с поиском и возможностью множественного выбора.
 */
export const FandomFilter: React.FC<FandomFilterProps> = ({
  availableFandoms,
  selectedFandoms,
  onChange
}) => {
  const [search, setSearch] = useState('')

  const toggleFandom = (name: string) => {
    if (selectedFandoms.includes(name)) {
      onChange(selectedFandoms.filter(f => f !== name))
    } else {
      onChange([...selectedFandoms, name])
    }
  }

  const removeFandom = (name: string) => {
    onChange(selectedFandoms.filter(f => f !== name))
  }

  const filteredFandoms = availableFandoms.filter(f => 
    f.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className={styles.fandomFilterContainer}>
      {/* 1. Выбранные теги (чипсы) */}
      {selectedFandoms.length > 0 && (
        <div className={styles.selectedChips}>
          {selectedFandoms.map(name => (
            <div key={name} className={styles.chip}>
              <span>{name}</span>
              <span 
                className={styles.chipRemove} 
                onClick={() => removeFandom(name)}
              >
                ×
              </span>
            </div>
          ))}
        </div>
      )}

      {/* 2. Поле поиска фандома */}
      <input 
        type="text" 
        className={styles.fandomSearchInput}
        placeholder="Поиск фандома..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* 3. Список доступных фандомов с чекбоксами */}
      <div className={styles.fandomList}>
        {filteredFandoms.map(f => (
          <div 
            key={f.name} 
            className={`${styles.fandomOption} ${selectedFandoms.includes(f.name) ? styles.selected : ''}`}
            onClick={() => toggleFandom(f.name)}
          >
            <div className={styles.checkbox}>
              <div className={styles.checkboxInner}>✓</div>
            </div>
            <span className={styles.fandomName}>{f.name}</span>
            <span className={styles.fandomCount}>{f.count}</span>
          </div>
        ))}
        {filteredFandoms.length === 0 && (
          <div className={styles.fandomCount} style={{ padding: '10px 8px' }}>
            Ничего не найдено
          </div>
        )}
      </div>
    </div>
  )
}
