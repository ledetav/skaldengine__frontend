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
  scenarios_count: number;
  scenario_chats_count: number;
  gender?: string;
  nsfw_allowed: boolean;
  is_public: boolean;
  is_deleted: boolean;
  lorebook_ids: string[];
}

export interface Lorebook {
  id: string;
  character_id?: string | null;
  character_name?: string;
  user_persona_id?: string | null;
  user_persona_name?: string;
  fandom?: string;
  type: 'fandom' | 'character' | 'persona';
  name: string;
  description?: string;
  tags?: string[];
  entries_count: number;
  owner_id?: string;
  created_at?: string;
  entries: LorebookEntry[];
}

export interface LorebookEntry {
  id: string;
  lorebook_id: string;
  keywords: string[];
  content: string;
  priority: number;
  created_at?: string;
}

export interface User {
  id: string;
  email: string;
  login: string;
  username: string;
  full_name: string | null;
  role: string;
  avatar_url: string | null;
  cover_url: string | null;
  about: string | null;
  created_at: string;
  birth_date: string;
}

export interface UserPersona {
  id: string;
  owner_id: string;
  name: string;
  description?: string;
  avatar_url?: string;
  age?: number;
  appearance?: string;
  personality?: string;
  gender?: string;
  facts?: string;
  lorebook_count: number;
  chat_count: number;
  created_at: string;
}
