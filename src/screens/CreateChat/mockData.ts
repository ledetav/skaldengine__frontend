import type { Character } from '../../types/character'
import type { Scenario, Lorebook, UserPersona, GameModeType } from '../../types/chat'

export const mockCharacter: Character = {
  id: 'mock-1',
  name: 'Элара Лунный Шепот',
  description: 'Эльфийская чародейка, практикующая магию звездного света. Она спокойна, мудра, но хранит в себе тайну древнего пророчества.',
  fandom: 'Fantasy',
  creator_id: 'SkaldSystem',
  avatar_url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=ElaraAvatar',
  card_image_url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=FantasyForest',
  total_chats_count: 1250,
  monthly_chats_count: 450,
  scenarios_count: 12,
  scenario_chats_count: 890,
  nsfw_allowed: false,
  is_public: true,
  created_at: new Date().toISOString(),
  author: {
    name: 'Skald Master',
    username: '@SkaldMaster',
    avatar_url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=SystemAdmin',
    role: 'Администратор'
  }
}

export const mockScenarios: Scenario[] = [
  {
    id: 's-1',
    title: 'Встреча в таверне',
    description: 'Вы встречаете Элару в "Забытом Приюте". Она ищет спутника для опасного путешествия в Шепчущий Лес.'
  },
  {
    id: 's-2',
    title: 'Дуэль на Руинах',
    description: 'Магическая дуэль вышла из-под контроля. Вы оказались заперты в пространственной аномалии вместе с Эларой.'
  },
  {
    id: 's-3',
    title: 'Шепот Звезд',
    description: 'Тихая ночь под открытым небом. Элара решает доверить вам свои видения о грядущем.'
  },
  {
    id: 's-4',
    title: 'Ритуал Пробуждения',
    description: 'Древний храм. Вы должны помочь Эларе завершить ритуал, пока наемники Ордена не прорвались внутрь.'
  }
]

export const mockLorebooks: Lorebook[] = [
  { 
    id: 'l-1', 
    name: 'Хроники Лунных Эльфов', 
    description: 'Полная история народа Элары: от переселения до Звездной войны.', 
    entries_count: 124 
  },
  { 
    id: 'l-2', 
    name: 'Бестиарий Сильвании', 
    description: 'Описания существ, магической флоры и опасных зон Шепчущего Леса.', 
    entries_count: 48 
  }
]

export const gameModes: { id: GameModeType, title: string, description: string }[] = [
  {
    id: 'sandbox',
    title: 'Песочница',
    description: 'Свободная игра без заранее определенного сюжета. Вы сами направляете историю.'
  },
  {
    id: 'scenario',
    title: 'Сценарий',
    description: 'Увлекательное приключение с заданными целями и ключевыми моментами сюжета.'
  }
]

export const mockPersonas: UserPersona[] = [
  {
    id: 'p1',
    name: 'Алекс',
    age: 24,
    gender: 'Мужской',
    description: 'Опытный путешественник и мастер меча со шрамом на левом глазу.',
    avatar_url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Alex'
  },
  {
    id: 'p2',
    name: 'Элина',
    age: 21,
    gender: 'Женский',
    description: 'Начинающая волшебница, ищущая древние фолианты в библиотеках магов.',
    avatar_url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Elina'
  }
]
