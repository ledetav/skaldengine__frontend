export interface Character {
  id: string;
  creator_id?: string;
  name: string;
  description?: string;
  fandom?: string;
  avatar_url?: string;
  card_image_url?: string;
  appearance?: string;
  personality?: string;
  total_chats_count: number;
  monthly_chats_count: number;
  gender?: string;
  nsfw_allowed: boolean;
  is_public: boolean;
  is_deleted: boolean;
}

export interface Lorebook {
  id: string;
  character_id?: string;
  user_persona_id?: string;
  fandom?: string;
  name: string;
  entries: LorebookEntry[];
}

export interface LorebookEntry {
  id: string;
  lorebook_id: string;
  keywords: string[];
  content: string;
  priority: number;
}
