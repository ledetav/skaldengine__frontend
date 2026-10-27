/**
 * @fileoverview Определение типов данных профиля пользователя.
 * Включает модели учетных записей, агрегированной статистики активности,
 * а также облегченные проекции персон и лорбуков для вкладок личного кабинета.
 */

/**
 * Агрегированная статистика активности пользователя.
 */
export interface UserStatistics {
  total_chats: number;
  total_personas: number;
  total_lorebooks: number;
  total_messages: number;
}

/**
 * Профиль пользователя с учетными данными и статистикой.
 */
export interface UserProfile {
  id: string;
  email: string;
  login: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  about: string | null;
  role: string;
  created_at: string;
  birth_date: string;
  statistics: UserStatistics;
}

/**
 * Краткая информация о персоне в профиле пользователя.
 */
export interface ProfilePersona {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  age: number | null;
  gender: string | null;
  lorebook_count: number;
  chat_count: number;
  appearance: string | null;
  personality: string | null;
  facts: string | null;
}

/**
 * Краткая информация о лорбуке в профиле пользователя.
 */
export interface ProfileLorebook {
  id: string;
  name: string;
  description: string | null;
  character_name?: string;
  user_persona_id?: string;
  entries_count: number;
  fandom: string | null;
}
