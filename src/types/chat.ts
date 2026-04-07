export type GameModeType = 'sandbox' | 'scenario'

export interface Scenario {
  id: string
  title: string
  description: string
  image_url?: string
}

export interface CreateChatRequest {
  persona_id: string
  game_mode: GameModeType
  scenario_id?: string
  checkpoints_count: number // 2-6
  lorebook_id?: string
}

export interface Lorebook {
  id: string
  name: string
  description: string
  entries_count?: number
}

export interface UserPersona {
  id: string
  name: string
  age?: number
  gender?: string
  description?: string
  avatar_url?: string
}
