import type { Character } from '@/core/types/character'
import type { UserPersona, Scenario, Chat as ChatType, Lorebook, Checkpoint } from '@/core/types/chat'

import { Sidebar } from './Sidebar'
import { ProfileSection, ScenarioSection } from './sections/CommonSections'
import { CharacterSection } from './sections/CharacterSection'
import { PersonaSection } from './sections/PersonaSection'
import { SettingsSection } from './sections/SettingsSection'
import { LorebookSection } from './sections/LorebookSection'

interface ChatSidebarContainerProps {
  isOpen: boolean
  onClose: () => void
  chat: ChatType | null
  character: Character | null
  persona: UserPersona | null
  scenario: Scenario | null
  checkpoints: Checkpoint[]
  lorebooks: Lorebook[]

  perspective: ChatType['narrative_voice']
  language: 'RU' | 'EN'
  fontSize: 'small' | 'medium' | 'large'
  autoScrollEnabled: boolean
  showThoughtsGlobal: boolean
  onPerspectiveChange: (val: string) => void
  onLanguageChange: (val: string) => void
  onFontSizeChange: (val: any) => void
  onAutoScrollToggle: () => void
  onShowThoughtsToggle: () => void
}

/**
 * Контейнер боковой панели параметров чата (персонаж, персона пользователя, лорбуки, контрольные точки и настройки).
 */
export function ChatSidebarContainer({
  isOpen,
  onClose,
  chat,
  character,
  persona,
  scenario,
  checkpoints,
  lorebooks,

  perspective,
  language,
  fontSize,
  autoScrollEnabled,
  showThoughtsGlobal,
  onPerspectiveChange,
  onLanguageChange,
  onFontSizeChange,
  onAutoScrollToggle,
  onShowThoughtsToggle,
}: ChatSidebarContainerProps) {
  return (
    <Sidebar isOpen={isOpen} onClose={onClose}>
      <ProfileSection />

      {chat?.mode === 'scenario' && scenario && (
        <ScenarioSection scenario={scenario} checkpoints={checkpoints} />
      )}

      <CharacterSection character={character} chat={chat} />
      <PersonaSection persona={persona} />

      <SettingsSection
        perspective={perspective}
        language={language}
        fontSize={fontSize}
        autoScrollEnabled={autoScrollEnabled}
        showThoughtsGlobal={showThoughtsGlobal}
        onPerspectiveChange={onPerspectiveChange}
        onLanguageChange={onLanguageChange}
        onFontSizeChange={onFontSizeChange}
        onAutoScrollToggle={onAutoScrollToggle}
        onShowThoughtsToggle={onShowThoughtsToggle}
      />

      <LorebookSection lorebooks={lorebooks} />
    </Sidebar>
  )
}
