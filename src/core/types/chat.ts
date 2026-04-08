export type GameModeType = 'sandbox' | 'scenario'
export type NarrativeVoiceType = 'first' | 'second' | 'third'

export interface Scenario {
  id: string
  title: string
  description: string
  image_url?: string
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  chat_id?: string
  parent_id?: string
  hidden_thought?: string
  is_edited?: boolean
  created_at?: string
  
  // UI-specific additions (mapped in frontend)
  author?: string
  siblings_count?: number
  current_sibling_index?: number
}

export interface UserPersona {
  id: string
  name: string
  description?: string | null
  avatar_url?: string | null
  age?: number | null
  appearance?: string | null
  personality?: string | null
  gender?: string | null
  facts?: string | null
  created_at: string
}

export interface Chat {
  id: string
  user_id: string
  character_id: string
  user_persona_id: string
  scenario_id?: string
  title?: string
  is_acquainted: boolean
  relationship_dynamic?: string
  language: string
  narrative_voice: NarrativeVoiceType
  persona_lorebook_id?: string
  checkpoints_count: number
  mode: string
  active_leaf_id?: string
  created_at: string
  updated_at?: string
}

export interface ChatUpdate {
  title?: string
  language?: string
  narrative_voice?: string
  is_acquainted?: boolean
  relationship_dynamic?: string
  persona_lorebook_id?: string
  active_leaf_id?: string
}

export interface ChatCreate {
  character_id: string
  user_persona_id: string
  scenario_id?: string
  is_acquainted: boolean
  relationship_dynamic?: string
  language: string
  narrative_voice: NarrativeVoiceType
  persona_lorebook_id?: string
  checkpoints_count: number
}

export interface MessageCreate {
  content: string
  parent_id?: string
}

export interface MessageEdit {
  new_content: string
}

export interface Lorebook {
  id: string
  name: string
  description?: string
  entries_count?: number
}
