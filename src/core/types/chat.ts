/**
 * @fileoverview Доменные типы и интерфейсы чатов, сообщений, сценариев и баз знаний.
 * Определяет структуры сессий диалога, параметров генерации, дерева реплик и потокового SSE.
 */

/**
 * Режим чата: 'sandbox' (свободная песочница) или 'scenario' (сюжетная игра).
 */
export type GameModeType = 'sandbox' | 'scenario'

/**
 * Лицо повествования: 'first' (от 1-го лица), 'second' (от 2-го лица), 'third' (от 3-го лица).
 */
export type NarrativeVoiceType = 'first' | 'second' | 'third'

/**
 * Сценарий ролевой игры с персонажем.
 */
export interface Scenario {
  id: string
  title: string
  description: string
  location?: string | null
  start_point?: string | null
  end_point?: string | null
  internal_description?: string | null
  character_id?: string | null
  chats_count?: number
  image_url?: string
}

/**
 * Сообщение в древовидной истории диалога.
 */
export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  chat_id?: string
  parent_id?: string
  hidden_thought?: string
  is_edited?: boolean
  created_at?: string
  
  // Дополнительные вычисляемые поля для отображения в UI
  author?: string
  siblings_count?: number
  current_sibling_index?: number
}

/**
 * Персона игрока для ролевой игры.
 */
export interface UserPersona {
  id: string
  name: string
  description?: string | null
  avatar_url?: string | null
  age?: string | null
  appearance?: string | null
  personality?: string | null
  gender?: string | null
  facts?: string | null
  owner_id: string
  lorebook_count: number
  chat_count: number
  created_at: string
}

/**
 * Сессия чата между пользователем и персонажем.
 */
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
  custom_location?: string
  custom_plot_hook?: string
  checkpoints_count: number
  mode: string
  active_leaf_id?: string
  created_at: string
  updated_at?: string
  
  // Обогащенные поля для витрины и карточек
  character_name?: string
  user_persona_name?: string
  last_message_preview?: string
}

/**
 * Схема обновления настроек или метаданных чата.
 */
export interface ChatUpdate {
  title?: string
  language?: string
  narrative_voice?: string
  is_acquainted?: boolean
  relationship_dynamic?: string
  persona_lorebook_id?: string
  active_leaf_id?: string
}

/**
 * Схема создания нового чата.
 */
export interface ChatCreate {
  character_id: string
  user_persona_id: string
  scenario_id?: string
  is_acquainted: boolean
  relationship_dynamic?: string
  language: string
  narrative_voice: NarrativeVoiceType
  persona_lorebook_id?: string
  custom_location?: string
  custom_plot_hook?: string
  checkpoints_count: number
}

/**
 * Схема отправки нового сообщения.
 */
export interface MessageCreate {
  content: string
  parent_id?: string
}

/**
 * Схема редактирования сообщения.
 */
export interface MessageEdit {
  content: string
  new_content?: string
}

/**
 * Запись в базе знаний (лорбуке).
 */
export interface LorebookEntry {
  id: string
  lorebook_id: string
  keywords: string[]
  content: string
  category?: string
  is_always_included?: boolean
  priority: number
  created_at: string
}

/**
 * Тип базы знаний: по фандому, персонажу или персоне игрока.
 */
export type LorebookType = 'fandom' | 'character' | 'persona'

/**
 * База знаний (лорбук).
 */
export interface Lorebook {
  id: string
  name: string
  type: LorebookType
  description?: string
  category: string
  fandom?: string | null
  character_id?: string | null
  character_name?: string
  user_persona_id?: string | null
  user_persona_name?: string
  entries?: LorebookEntry[]
  entries_count?: number
  tags?: string[]
  created_at: string
}

/**
 * Контрольная точка (чекпоинт) сценария.
 */
export interface Checkpoint {
  id: string
  order_num: number
  goal_description: string
  is_completed: boolean
}
