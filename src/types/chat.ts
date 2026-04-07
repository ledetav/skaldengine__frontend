export type GameModeType = 'sandbox' | 'scenario'
export type NarrativeVoiceType = 'first' | 'second' | 'third'

export interface Scenario {
  id: string
  title: string
  description: string
  image_url?: string
}

export interface CreateChatRequest {
  character_id: string
  user_persona_id: string
  scenario_id?: string
  is_acquainted: boolean
  relationship_dynamic?: string
  language: string
  narrative_voice: NarrativeVoiceType
  persona_lorebook_id?: string
  checkpoints_count: number // 2-6
}

export interface Lorebook {
  id: string
  name: string
  description?: string
  entries_count?: number
}

export interface UserPersona {
  id: string
  name: string
  age?: number
  gender?: string
  description?: string
  avatar_url?: string
  appearance?: string
  personality?: string
}
