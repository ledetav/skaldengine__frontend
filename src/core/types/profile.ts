
export interface UserStatistics {
  total_chats: number;
  total_personas: number;
  total_lorebooks: number;
  total_messages: number;
}

export interface UserProfile {
  id: string;
  email: string;
  login: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  role: string;
  created_at: string;
  birth_date: string;
  statistics: UserStatistics;
}

export interface ProfilePersona {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  age: number | null;
  gender: string | null;
  lorebook_count: number; // Missing in backend
  chat_count: number; // Missing in backend
  appearance: string | null;
  personality: string | null;
  facts: string | null;
}

export interface ProfileLorebook {
  id: string;
  name: string;
  description: string | null;
  character_name?: string;
  user_persona_id?: string;
  entries_count: number;
  fandom: string | null;
}
