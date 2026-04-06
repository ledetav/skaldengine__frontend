export interface Character {
  id: string
  name: string
  description?: string
  fandom?: string
  avatar_url?: string
  card_image_url?: string
  appearance?: string
  personality?: string
  is_public: boolean
  is_nsfw?: boolean
  creator_id?: string
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
