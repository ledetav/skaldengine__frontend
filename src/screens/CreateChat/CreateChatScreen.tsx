import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { gameModes } from './mockData'
import type { GameModeType, UserPersona, Scenario, Lorebook, NarrativeVoiceType } from '../../types/chat'
import { charactersApi } from '../../api/characters'
import { personasApi } from '../../api/personas'
import { scenariosApi } from '../../api/scenarios'
import { lorebooksApi } from '../../api/lorebooks'
import { chatsApi } from '../../api/chats'
import type { Character } from '../../types/character'
import { ErrorScreen } from '../../components/Common/ErrorScreen'
import { LoadingScreen } from '../../components/Common/LoadingScreen'
import styles from '../../styles/screens/CreateChat/CreateChatScreen.module.css'

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
  const [isPersonaOpen, setIsPersonaOpen] = useState(false)
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
        setPersonas(personasData as any)
        setScenarios(scenariosData)
        setLorebooks(lorebooksData as any)
        
        if (personasData.length > 0) setSelectedPersonaId(personasData[0].id)
        if (scenariosData.length > 0) setSelectedScenarioId(scenariosData[0].id)
      } catch (err: any) {
        console.error('Error fetching creation data:', err)
        setError(err.message || 'Ошибка при загрузке данных')
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

      const newChat = await chatsApi.createChat(chatData as any)
      navigate(`/chat/${newChat.id}`)
    } catch (err: any) {
      alert(`Ошибка при создании чата: ${err.message}`)
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

  const renderPersonaSelector = () => (
    <div className={styles.formGroup}>
      <label className={styles.groupLabel}>Ваш персонаж (Персона)</label>
      <div className={`${styles.personaSelector} ${isPersonaOpen ? styles.isSelectorOpen : ''} ${gameMode === 'sandbox' ? styles.modeSandbox : styles.modeScenario}`}>
        <div 
          className={`${styles.personaActiveCard} ${isPersonaOpen ? styles.isOpen : ''}`}
          onClick={() => setIsPersonaOpen(!isPersonaOpen)}
        >
          {personas.find(p => p.id === selectedPersonaId) ? (
            <>
              <div className={styles.personaAvatarSquare}>
                <img src={personas.find(p => p.id === selectedPersonaId)?.avatar_url} alt="Avatar" />
              </div>
              <div className={styles.personaContent}>
                <div className={styles.personaHeader}>
                  <span className={styles.personaName}>{personas.find(p => p.id === selectedPersonaId)?.name}</span>
                  <span className={styles.personaMeta}>
                    {personas.find(p => p.id === selectedPersonaId)?.age} лет, {personas.find(p => p.id === selectedPersonaId)?.gender}
                  </span>
                </div>
                <p className={styles.personaDesc}>
                  {personas.find(p => p.id === selectedPersonaId)?.description || 
                   personas.find(p => p.id === selectedPersonaId)?.appearance}
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

        {isPersonaOpen && (
          <div className={styles.personaDropdown}>
            <div className={styles.personaOptionCreate} onClick={() => navigate('/personas/create')}>
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
                  setSelectedPersonaId(persona.id)
                  setIsPersonaOpen(false)
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

  const renderLorebookSelector = () => (
    <div className={styles.formGroup}>
      <label className={styles.groupLabel}>Локальная база знаний (Lorebook)</label>
      <div className={styles.lorebookGrid}>
        {/* Create Button */}
        <div className={styles.lorebookCardCreate}>
          <div className={styles.lorebookCreateIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </div>
          <span className={styles.lorebookCreateLabel}>Создать новый</span>
        </div>

        {/* Real Lorebooks */}
        {lorebooks.map(lib => (
          <div 
            key={lib.id} 
            className={`${styles.lorebookCard} ${selectedLorebookId === lib.id ? styles.isSelected : ''}`}
            onClick={() => setSelectedLorebookId(lib.id === selectedLorebookId ? '' : lib.id)}
          >
            <div className={styles.lorebookHeader}>
              <span className={styles.lorebookName}>{lib.name}</span>
              <span className={styles.lorebookCount}>{lib.entries_count || 0} зап.</span>
            </div>
            <p className={styles.lorebookDesc}>{lib.description || 'База знаний для погружения в мир.'}</p>
          </div>
        ))}
        {lorebooks.length === 0 && (
          <p className={styles.emptyHint}>У вас пока нет созданных лорбуков.</p>
        )}
      </div>
    </div>
  )

  const renderAcquaintanceSection = () => (
    <div className={styles.acquaintanceSection}>
      <div 
        className={`${styles.toggleCard} ${areAcquainted ? styles.isActive : ''} ${gameMode === 'scenario' ? styles.isScenarioMode : ''}`}
        onClick={() => setAreAcquainted(!areAcquainted)}
      >
        <div className={styles.toggleText}>
          <h4>Персонажи знакомы?</h4>
          <p>Включите, если герои уже встречались ранее или имеют общую историю.</p>
        </div>
        <div className={styles.toggleSwitch}>
          <div className={styles.toggleThumb} />
        </div>
      </div>

      {areAcquainted && (
        <div className={styles.acquaintedFields}>
          <div className={styles.formGroup}>
            <label className={styles.groupLabel}>Отношения персонажей</label>
            <textarea 
              className={`${styles.textarea} ${gameMode === 'scenario' ? styles.focusScenario : ''}`}
              placeholder="Опишите кратко: старые друзья, заклятые враги или может быть... случайные попутчики?"
              value={relationshipDesc}
              onChange={(e) => setRelationshipDesc(e.target.value)}
            />
          </div>
          {renderLorebookSelector()}
        </div>
      )}
    </div>
  )

  const renderScenarioSelector = () => (
    <div className={styles.formGroup}>
      <label className={styles.groupLabel}>Выберите сюжет (Сценарий)</label>
      <div className={styles.lorebookGrid}>
        {/* Create Button */}
        <div className={`${styles.lorebookCardCreate} ${styles.isScenarioCreate}`}>
          <div className={styles.lorebookCreateIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L4 2l3.5 12.5L11 16l1 1"/><path d="M2 22l5-5"/><path d="M8 14l-4 4"/></svg>
          </div>
          <span className={styles.lorebookCreateLabel}>Создать сюжет</span>
        </div>

        {/* Real Scenarios */}
        {scenarios.map(scen => (
          <div 
            key={scen.id} 
            className={`${styles.lorebookCard} ${styles.isScenarioCard} ${selectedScenarioId === scen.id ? styles.isSelectedScenario : ''}`}
            onClick={() => setSelectedScenarioId(scen.id)}
          >
            <div className={styles.lorebookHeader}>
              <span className={styles.lorebookName}>{scen.title}</span>
            </div>
            <p className={styles.lorebookDesc}>{scen.description}</p>
          </div>
        ))}
        {scenarios.length === 0 && (
          <p className={styles.emptyHint}>Для этого персонажа пока нет сценариев.</p>
        )}
      </div>
    </div>
  )

  const renderDurationSelector = () => (
    <div className={styles.formGroup}>
      <label className={styles.groupLabel}>Длительность кампании</label>
      <div className={styles.durationGrid}>
        {[
          { id: 'short', title: 'Короткий', desc: 'Блиц-история. Идеально для быстрого старта.' },
          { id: 'medium', title: 'Средний', desc: 'Сбалансированная кампания. Глубокое погружение.' },
          { id: 'long', title: 'Длинный', desc: 'Эпический сюжет. Максимальная детализация мира.' }
        ].map(d => (
          <div 
            key={d.id}
            className={`${styles.durationCard} ${campaignDuration === d.id ? styles.isDurationActive : ''}`}
            onClick={() => setCampaignDuration(d.id as any)}
          >
            <span className={styles.durationTitle}>{d.title}</span>
            <p className={styles.durationDesc}>{d.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )

  const renderVoiceSelector = () => (
    <div className={styles.formGroup}>
      <label className={styles.groupLabel}>Лицо повествования (POV)</label>
      <div className={styles.voiceGrid}>
        {[
          { id: 'first', title: '1-е лицо', desc: '«Я посмотрел на неё...»' },
          { id: 'second', title: '2-е лицо', desc: '«Вы входите в комнату...»' },
          { id: 'third', title: '3-е лицо', desc: '«Он медленно обернулся...»' }
        ].map(v => (
          <div 
            key={v.id}
            className={`${styles.voiceCard} ${narrativeVoice === v.id ? styles.isVoiceActive : ''}`}
            onClick={() => setNarrativeVoice(v.id as any)}
          >
            <span className={styles.voiceTitle}>{v.title}</span>
            <p className={styles.voiceDesc}>{v.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )

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
          <div className={styles.characterCard}>
            {/* Top Part: Cover & Overlay */}
            <div className={styles.characterCoverContainer}>
              <img 
                src={character.card_image_url || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1000&auto=format&fit=crop'} 
                alt="Cover" 
                className={styles.characterCover}
              />
              <div className={styles.characterCoverGradient} />
              
              <div className={styles.characterOverlay}>
                <div className={styles.avatarCircle}>
                  <img src={character.avatar_url} alt={character.name} />
                </div>
                <div className={styles.characterMainInfo}>
                  <h1>{character.name}</h1>
                  <span className={styles.fandomOverlay}>{character.fandom}</span>
                </div>
              </div>
            </div>

            {/* Content Part */}
            <div className={styles.characterDetails}>
              <p className={styles.description}>
                {character.description}
              </p>

              <div className={styles.separator} />

              <div className={styles.statsGrid}>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>За месяц</span>
                  <span className={styles.statValue}>{character.monthly_chats_count?.toLocaleString()}</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>За всё время</span>
                  <span className={styles.statValue}>{character.total_chats_count?.toLocaleString()}</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Сценариев</span>
                  <span className={styles.statValue}>{scenarios.length}</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>По сценариям</span>
                  <span className={styles.statValue}>{character.total_chats_count || 0}</span>
                </div>
              </div>

              <div className={styles.separator} />

              <div className={styles.lorebookWarning}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff6b00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p>
                  У этого персонажа еще нет заполненного Лорбука. Из-за отсутствия базы знаний возможны фактологические искажения или галлюцинации в ответах.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT: Creation Form */}
        <section className={styles.formSection}>
          {/* Backdrop for Persona Selection */}
          {isPersonaOpen && (
            <div className={styles.personaBackdrop} onClick={() => setIsPersonaOpen(false)} />
          )}

          {/* 0. Game Mode Selection */}
          <div className={styles.formGroup}>
            <label className={styles.groupLabel}>Режим</label>
            <div className={styles.gameModeGrid}>
              {gameModes.map(mode => (
                <div 
                  key={mode.id}
                  className={`
                    ${styles.gameModeCard} 
                    ${mode.id === 'sandbox' ? styles.isSandboxCard : styles.isScenarioCard}
                    ${gameMode === mode.id ? (mode.id === 'sandbox' ? styles.isSandboxSelected : styles.isScenarioSelected) : ''}
                  `}
                  onClick={() => setGameMode(mode.id)}
                >
                  <h3>
                    {mode.id === 'sandbox' ? (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 12c-2-2.67-4-4-6-4a4 4 0 0 0 0 8c2 0 4-1.33 6-4zm0 0c2 2.67 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.33-6 4z"/></svg>
                    ) : (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                    )}
                    {mode.title}
                  </h3>
                  <p>{mode.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.separator} />

          {/* 1. Voice Selector */}
          {renderVoiceSelector()}

          <div className={styles.separator} />

          {/* 2. Persona Selection */}
          {gameMode === 'sandbox' && (
            <div className={`${styles.sandboxSection} ${styles.modeSandbox}`}>
              {renderPersonaSelector()}
              {renderAcquaintanceSection()}
            </div>
          )}

          {/* 3. Scenario Section (if Scenario mode) */}
          {gameMode === 'scenario' && (
            <div className={`${styles.scenarioSectionFull} ${styles.modeScenario}`}>
              {renderScenarioSelector()}
              {renderDurationSelector()}
              {renderPersonaSelector()}
              {renderAcquaintanceSection()}
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
