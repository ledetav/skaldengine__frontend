export interface Character {
  id: string
  name: string
  description?: string
  fandom?: string
  gender?: 'Мужской' | 'Женский' | 'Другой'
  avatar_url?: string
  card_image_url?: string
  appearance?: string
  personality?: string
  is_public: boolean
  nsfw_allowed: boolean
  creator_id?: string
  monthly_chats_count?: number
  total_chats_count?: number
  created_at?: string
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
