import React from 'react'
import styles from './DurationSelector.module.css'

type DurationType = 'short' | 'medium' | 'long'

interface DurationOption {
  id: DurationType
  title: string
  desc: string
}

interface DurationSelectorProps {
  selectedDuration: DurationType
  onChange: (val: DurationType) => void
}

const DURATION_OPTIONS: DurationOption[] = [
  { id: 'short', title: 'Короткий', desc: 'Блиц-история. Идеально для быстрого старта.' },
  { id: 'medium', title: 'Средний', desc: 'Сбалансированная кампания. Глубокое погружение.' },
  { id: 'long', title: 'Длинный', desc: 'Эпический сюжет. Максимальная детализация мира.' }
]

export const DurationSelector: React.FC<DurationSelectorProps> = ({ 
  selectedDuration, 
  onChange 
}) => {
  return (
    <div className={styles.formGroup}>
      <label className={styles.groupLabel}>Длительность кампании</label>
      <div className={styles.durationGrid}>
        {DURATION_OPTIONS.map(d => (
          <div 
            key={d.id}
            className={`${styles.durationCard} ${selectedDuration === d.id ? styles.isDurationActive : ''}`}
            onClick={() => onChange(d.id)}
          >
            <span className={styles.durationTitle}>{d.title}</span>
            <p className={styles.durationDesc}>{d.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
