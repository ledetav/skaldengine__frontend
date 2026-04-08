export interface Character {
  id: string
  name: string
  description?: string
  fandom?: string
  gender?: 'Мужской' | 'Женский' | 'Другой'
  avatar?: string
  avatar_url?: string
  cover_image?: string
  card_image_url?: string
  has_lorebook?: boolean
  appearance?: string
  personality?: string
  is_public: boolean
  nsfw_allowed: boolean
  creator_id?: string
  monthly_chats_count?: number
  total_chats_count?: number
  created_at?: string
  scenarios_count?: number
  scenario_chats_count?: number
  author?: {
    name: string
    username: string
    avatar_url?: string
    role?: 'Администратор' | 'Модератор' | 'Пользователь'
  }
}

export interface Scenario {
  id: string
  character_id?: string
  title: string
  location?: string
  description: string
  start_point?: string
  end_point?: string
}
