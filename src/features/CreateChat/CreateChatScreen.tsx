import { logger } from "@/core/utils/logger";
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { GameModeType, UserPersona, Scenario, Lorebook, NarrativeVoiceType } from '@/core/types/chat'
import { charactersApi } from '@/core/api/characters'
import { personasApi } from '@/core/api/personas'
import { scenariosApi } from '@/core/api/scenarios'
import { lorebooksApi } from '@/core/api/lorebooks'
import { authApi } from '@/core/api/auth'
import { chatsApi } from '@/core/api/chats'
import type { Character } from '@/core/types/character'
import type { UserProfile } from '@/core/types/profile'
import { ErrorScreen } from '@/components/ui/ErrorScreen'
import { LoadingScreen } from '@/components/ui/LoadingScreen'

// Дочерние компоненты конструктора
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

/**
 * Конструктор новой сессии чата с AI-персонажем.
 * Позволяет настроить режим игры (песочница / сценарий), лицо повествования,
 * выбрать персону игрока, динамику отношений и прикрепить базы знаний.
 */
const CreateChatScreen: React.FC = () => {
  const { characterId } = useParams<{ characterId: string }>()
  const navigate = useNavigate()
  
  // Данные сущностей (персонаж, персоны, сценарии, лорбуки)
  const [character, setCharacter] = useState<Character | null>(null)
  const [personas, setPersonas] = useState<UserPersona[]>([])
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [lorebooks, setLorebooks] = useState<Lorebook[]>([])
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Состояние формы параметров чата
  const [gameMode, setGameMode] = useState<GameModeType>('scenario')
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>('')
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('')
  const [campaignDuration, setCampaignDuration] = useState<'short' | 'medium' | 'long'>('medium')
  const [narrativeVoice, setNarrativeVoice] = useState<NarrativeVoiceType>('third')
  const [selectedLorebookId, setSelectedLorebookId] = useState<string>('')
  
  // Специфичные настройки режима песочницы
  const [areAcquainted, setAreAcquainted] = useState(false)
  const [relationshipDesc, setRelationshipDesc] = useState('')
  const [customLocation, setCustomLocation] = useState('')
  const [customPlotHook, setCustomPlotHook] = useState('')

  useEffect(() => {
    /**
     * Загружает данные персонажа, список персон пользователя, сценарии, лорбуки и профиль пользователя.
     */
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [charData, personasData, scenariosData, lorebooksData, userData] = await Promise.all([
          characterId ? charactersApi.getCharacter(characterId) : Promise.reject('No character ID'),
          personasApi.getPersonas(),
          scenariosApi.getScenarios(characterId),
          lorebooksApi.getLorebooks(),
          authApi.getMe()
        ])

        setCharacter(charData)
        setPersonas(personasData || [])
        setScenarios(scenariosData || [])
        setLorebooks(lorebooksData || [])
        setCurrentUser(userData)
        
        if (personasData && personasData.length > 0) setSelectedPersonaId(personasData[0].id)
        if (scenariosData && scenariosData.length > 0) setSelectedScenarioId(scenariosData[0].id)
      } catch (err: unknown) {
        logger.error('Error fetching creation data:', err)
        setError(err instanceof Error ? err.message : 'Ошибка при загрузке данных')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [characterId])

  /**
   * Преобразует выбранную длительность кампании в целевое количество чекпоинтов (этапов сюжета).
   * 
   * @param duration - Длительность ('short' - 2, 'medium' - 4, 'long' - 6)
   */
  const mapDurationToCheckpoints = (duration: string): number => {
    switch (duration) {
      case 'short': return 2
      case 'medium': return 4
      case 'long': return 6
      default: return 4
    }
  }

  /**
   * Создает новую сессию чата с выбранными параметрами (режим, персона, сценарий, лорбуки)
   * и выполняет переход на экран активного диалога.
   */
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
        custom_location: gameMode === 'sandbox' ? customLocation : undefined,
        custom_plot_hook: gameMode === 'sandbox' ? customPlotHook : undefined,
        language: 'ru', // Язык по умолчанию
        narrative_voice: narrativeVoice,
        persona_lorebook_id: selectedLorebookId || undefined,
        checkpoints_count: mapDurationToCheckpoints(campaignDuration)
      }

      const newChat = await chatsApi.createChat(chatData)
      navigate(`/chat/${newChat.id}`)
    } catch (err: unknown) {
      alert(`Ошибка при создании чата: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`)
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

    const hasFullLorebook = lorebooks.some(lb => (lb.entries_count || 0) > 10)

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
        {/* Левая колонка: Карточка персонажа */}
        <section className={styles.characterSection}>
          <CharacterCard 
            character={character} 
            scenariosCount={scenarios.length} 
            currentUser={currentUser}
            hasFullLorebook={hasFullLorebook}
          />
        </section>

        {/* Правая колонка: Форма параметров чата */}
        <section className={styles.formSection}>
          
          {/* 0. Выбор режима игры */}
          <GameModeSelector 
            modes={gameModes}
            selectedMode={gameMode}
            onModeChange={setGameMode}
          />

          <div className={styles.separator} />

          {/* 1. Выбор лица повествования */}
          <VoiceSelector 
            selectedVoice={narrativeVoice}
            onVoiceChange={setNarrativeVoice}
          />

          <div className={styles.separator} />

          {/* 2. Выбор персоны игрока и динамики отношений (режим песочницы) */}
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
                customLocation={customLocation}
                customPlotHook={customPlotHook}
                onLocationChange={setCustomLocation}
                onPlotHookChange={setCustomPlotHook}
                lorebooks={lorebooks}
                selectedLorebookId={selectedLorebookId}
                onLorebookSelect={setSelectedLorebookId}
                onCreateLorebook={() => navigate('/lorebooks/create')}
                currentUser={currentUser}
                currentCharacter={character}
              />
            </div>
          )}

          {/* 3. Выбор сценария и длительности (режим сценария) */}
          {gameMode === 'scenario' && (
            <div className={`${styles.scenarioSectionFull} ${styles.modeScenario}`}>
              <ScenarioSelector 
                scenarios={scenarios}
                selectedScenarioId={selectedScenarioId}
                onSelect={setSelectedScenarioId}
                onCreateClick={(currentUser?.role === 'admin' || currentUser?.role === 'moderator') ? () => navigate('/admin/scenarios/create') : undefined}
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
                customLocation={customLocation}
                customPlotHook={customPlotHook}
                onLocationChange={setCustomLocation}
                onPlotHookChange={setCustomPlotHook}
                lorebooks={lorebooks}
                selectedLorebookId={selectedLorebookId}
                onLorebookSelect={setSelectedLorebookId}
                onCreateLorebook={() => navigate('/lorebooks/create')}
                currentUser={currentUser}
                currentCharacter={character}
              />
            </div>
          )}

          {/* Кнопка запуска игры */}
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
