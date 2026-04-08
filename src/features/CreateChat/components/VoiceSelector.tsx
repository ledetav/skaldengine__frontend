import React from 'react'
import type { NarrativeVoiceType } from '@/core/types/chat'
import styles from './VoiceSelector.module.css'

interface VoiceOption {
  id: NarrativeVoiceType
  title: string
  desc: string
}

interface VoiceSelectorProps {
  selectedVoice: NarrativeVoiceType
  onVoiceChange: (voice: NarrativeVoiceType) => void
}

const VOICE_OPTIONS: VoiceOption[] = [
  { id: 'first', title: '1-е лицо', desc: '«Я посмотрел на неё...»' },
  { id: 'second', title: '2-е лицо', desc: '«Вы входите в комнату...»' },
  { id: 'third', title: '3-е лицо', desc: '«Он медленно обернулся...»' }
]

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({ 
  selectedVoice, 
  onVoiceChange 
}) => {
  return (
    <div className={styles.formGroup}>
      <label className={styles.groupLabel}>Лицо повествования (POV)</label>
      <div className={styles.voiceGrid}>
        {VOICE_OPTIONS.map(v => (
          <div 
            key={v.id}
            className={`${styles.voiceCard} ${selectedVoice === v.id ? styles.isVoiceActive : ''}`}
            onClick={() => onVoiceChange(v.id)}
          >
            <span className={styles.voiceTitle}>{v.title}</span>
            <p className={styles.voiceDesc}>{v.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
