import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { GameModeType, UserPersona, Scenario, Lorebook, NarrativeVoiceType } from '@/core/types/chat'
import { charactersApi } from '@/core/api/characters'
import { personasApi } from '@/core/api/personas'
import { scenariosApi } from '@/core/api/scenarios'
import { lorebooksApi } from '@/core/api/lorebooks'
import { chatsApi } from '@/core/api/chats'
import type { Character } from '@/core/types/character'
import { ErrorScreen } from '@/components/ui/ErrorScreen'
import { LoadingScreen } from '@/components/ui/LoadingScreen'

// Subcomponents
import { CharacterCard } from './components/CharacterCard'
import { GameModeSelector } from './components/GameModeSelector'
import { VoiceSelector } from './components/VoiceSelector'
import { PersonaSelector } from './components/PersonaSelector'
import { ScenarioSelector } from './components/ScenarioSelector'
import { DurationSelector } from './components/DurationSelector'
import { AcquaintanceSection } from './components/AcquaintanceSection'

import styles from '@/theme/screens/CreateChat/CreateChatScreen.module.css'

const gameModes: { id: GameModeType, title: string, description: string }[] = [
  {
    id: 'sandbox',
    title: 'Песочница',
    description: 'Свободная игра без заранее определенного сюжета. Вы сами направляете историю.'
  },
  {
    id: 'scenario',
    title: 'Сценарий',
    description: 'Увлекательное приключение с заданными целями и ключевыми моментами сюжета.'
  }
]

const CreateChatScreen: React.FC = () => {
  const { characterId } = useParams<{ characterId: string }>()
  const navigate = useNavigate()
  
  // Data State
  const [character, setCharacter] = useState<Character | null>(null)
  const [personas, setPersonas] = useState<UserPersona[]>([])
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [lorebooks, setLorebooks] = useState<Lorebook[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form State
  const [gameMode, setGameMode] = useState<GameModeType>('scenario')
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>('')
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('')
  const [campaignDuration, setCampaignDuration] = useState<'short' | 'medium' | 'long'>('medium')
  const [narrativeVoice, setNarrativeVoice] = useState<NarrativeVoiceType>('third')
  const [selectedLorebookId, setSelectedLorebookId] = useState<string>('')
  
  // Sandbox specific
  const [areAcquainted, setAreAcquainted] = useState(false)
  const [relationshipDesc, setRelationshipDesc] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [charData, personasData, scenariosData, lorebooksData] = await Promise.all([
          characterId ? charactersApi.getCharacter(characterId) : Promise.reject('No character ID'),
          personasApi.getPersonas(),
          scenariosApi.getScenarios(characterId),
          lorebooksApi.getLorebooks()
        ])

        setCharacter(charData)
        setPersonas(personasData)
        setScenarios(scenariosData)
        setLorebooks(lorebooksData)
        
        if (personasData.length > 0) setSelectedPersonaId(personasData[0].id)
        if (scenariosData.length > 0) setSelectedScenarioId(scenariosData[0].id)
      } catch (err: unknown) {
        console.error('Error fetching creation data:', err)
        setError(err instanceof Error ? err.message : 'Ошибка при загрузке данных')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [characterId])

  const mapDurationToCheckpoints = (duration: string): number => {
    switch (duration) {
      case 'short': return 2
      case 'medium': return 4
      case 'long': return 6
      default: return 4
    }
  }

  const handleStartChat = async () => {
    if (!character || !selectedPersonaId) return

    try {
      setIsSubmitting(true)
      const chatData = {
        character_id: character.id,
        user_persona_id: selectedPersonaId,
        scenario_id: gameMode === 'scenario' ? selectedScenarioId : undefined,
        is_acquainted: areAcquainted,
        relationship_dynamic: areAcquainted ? relationshipDesc : undefined,
        language: 'ru', // Default for now
        narrative_voice: narrativeVoice,
        persona_lorebook_id: selectedLorebookId || undefined,
        checkpoints_count: mapDurationToCheckpoints(campaignDuration)
      }

      const newChat = await chatsApi.createChat(chatData)
      navigate(`/chat/${newChat.id}`)
    } catch (err: unknown) {
      alert(`Ошибка при создании чата: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <LoadingScreen />
  }

  if (error || !character) {
    return (
      <ErrorScreen 
        message={error || 'Персонаж не найден'} 
        onRetry={() => window.location.reload()} 
      />
    )
  }

  return (
    <div className={styles.screen}>
      <div className={styles.background} />

      <div className={styles.topActions}>
        <button className={styles.backBtn} onClick={() => navigate('/dashboard')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Назад к персонажам
        </button>
      </div>

      <main className={styles.container}>
        {/* LEFT: Character Info */}
        <section className={styles.characterSection}>
          <CharacterCard 
            character={character} 
            scenariosCount={scenarios.length} 
          />
        </section>

        {/* RIGHT: Creation Form */}
        <section className={styles.formSection}>
          
          {/* 0. Game Mode Selection */}
          <GameModeSelector 
            modes={gameModes}
            selectedMode={gameMode}
            onModeChange={setGameMode}
          />

          <div className={styles.separator} />

          {/* 1. Voice Selector */}
          <VoiceSelector 
            selectedVoice={narrativeVoice}
            onVoiceChange={setNarrativeVoice}
          />

          <div className={styles.separator} />

          {/* 2. Persona Selection & Acquaintance (Sandbox mode) */}
          {gameMode === 'sandbox' && (
            <div className={`${styles.sandboxSection} ${styles.modeSandbox}`}>
              <PersonaSelector 
                personas={personas}
                selectedPersonaId={selectedPersonaId}
                gameMode={gameMode}
                onSelect={setSelectedPersonaId}
                onCreateClick={() => navigate('/personas/create')}
              />
              <AcquaintanceSection 
                areAcquainted={areAcquainted}
                relationshipDesc={relationshipDesc}
                gameMode={gameMode}
                onToggle={setAreAcquainted}
                onDescChange={setRelationshipDesc}
                lorebooks={lorebooks}
                selectedLorebookId={selectedLorebookId}
                onLorebookSelect={setSelectedLorebookId}
              />
            </div>
          )}

          {/* 3. Scenario Section (if Scenario mode) */}
          {gameMode === 'scenario' && (
            <div className={`${styles.scenarioSectionFull} ${styles.modeScenario}`}>
              <ScenarioSelector 
                scenarios={scenarios}
                selectedScenarioId={selectedScenarioId}
                onSelect={setSelectedScenarioId}
              />
              <DurationSelector 
                selectedDuration={campaignDuration}
                onChange={setCampaignDuration}
              />
              <PersonaSelector 
                personas={personas}
                selectedPersonaId={selectedPersonaId}
                gameMode={gameMode}
                onSelect={setSelectedPersonaId}
                onCreateClick={() => navigate('/personas/create')}
              />
              <AcquaintanceSection 
                areAcquainted={areAcquainted}
                relationshipDesc={relationshipDesc}
                gameMode={gameMode}
                onToggle={setAreAcquainted}
                onDescChange={setRelationshipDesc}
                lorebooks={lorebooks}
                selectedLorebookId={selectedLorebookId}
                onLorebookSelect={setSelectedLorebookId}
              />
            </div>
          )}

          {/* Start Action */}
          <div className={styles.footer}>
            <button 
              className={styles.startBtn} 
              onClick={handleStartChat}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Создание истории...' : 'Начать историю'}
              <svg className={styles.btnArrow} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}

export default CreateChatScreen
