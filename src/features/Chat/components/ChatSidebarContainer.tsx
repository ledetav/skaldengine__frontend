import type { Character } from '@/core/types/character'
import type { UserPersona, Scenario, Chat as ChatType, Lorebook, Checkpoint } from '@/core/types/chat'

import { Sidebar } from './Sidebar'
import { ProfileSection, ScenarioSection } from './sections/CommonSections'
import { CharacterSection } from './sections/CharacterSection'
import { PersonaSection } from './sections/PersonaSection'
import { SettingsSection } from './sections/SettingsSection'
import { LorebookSection } from './sections/LorebookSection'
import { ApiKeyModal } from './common/ApiKeyModal'

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
  apiKey: string
  isApiKeyModalOpen: boolean
  onPerspectiveChange: (val: string) => void
  onLanguageChange: (val: string) => void
  onFontSizeChange: (val: any) => void
  onAutoScrollToggle: () => void
  onShowThoughtsToggle: () => void
  onOpenApiKeyModal: () => void
  onCloseApiKeyModal: () => void
  onSaveApiKey: (key: string) => void
}

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
  apiKey,
  isApiKeyModalOpen,
  onPerspectiveChange,
  onLanguageChange,
  onFontSizeChange,
  onAutoScrollToggle,
  onShowThoughtsToggle,
  onOpenApiKeyModal,
  onCloseApiKeyModal,
  onSaveApiKey,
}: ChatSidebarContainerProps) {
  return (
    <>
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
          apiKey={apiKey}
          onPerspectiveChange={onPerspectiveChange}
          onLanguageChange={onLanguageChange}
          onFontSizeChange={onFontSizeChange}
          onAutoScrollToggle={onAutoScrollToggle}
          onShowThoughtsToggle={onShowThoughtsToggle}
          onOpenApiKeyModal={onOpenApiKeyModal}
        />

        <LorebookSection lorebooks={lorebooks} />
      </Sidebar>

      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={onCloseApiKeyModal}
        initialValue={apiKey}
        onSave={onSaveApiKey}
      />
    </>
  )
}
