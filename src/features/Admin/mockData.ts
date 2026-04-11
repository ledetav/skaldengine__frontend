import type { Character, Lorebook } from './types'

export const mockCharacters: Character[] = [
  {
    id: 'char-1',
    name: 'Элиара Светлая',
    description: 'Верховная жрица ордена Солнца.',
    fandom: 'Святилище Света',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    card_image_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800',
    appearance: 'Высокая эльфийка с золотыми волосами и глазами цвета янтаря. Носит белые одежды с золотой вышивкой.',
    personality: 'Мудрая, спокойная, но строгая в вопросах веры. Обладает глубоким состраданием.',
    total_chats_count: 1250,
    monthly_chats_count: 340,
    gender: 'женский',
    nsfw_allowed: false,
    is_public: true,
    is_deleted: false
  },
  {
    id: 'char-2',
    name: 'Талрос Тень',
    description: 'Наемник и мастер скрытности из трущоб Нижнего города.',
    fandom: 'Киберпанк: Неон',
    avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
    card_image_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=800',
    appearance: 'Среднего роста, атлетичного телосложения. Лицо часто скрыто маской. Множественные кибер-импланты.',
    personality: 'Циничный, расчетливый, говорит только по делу. Предан тем, кто платит.',
    total_chats_count: 890,
    monthly_chats_count: 120,
    gender: 'мужской',
    nsfw_allowed: true,
    is_public: true,
    is_deleted: false
  },
  {
    id: 'char-3',
    name: 'Мастер Ли',
    description: 'Учитель боевых искусств из затерянного храма.',
    fandom: 'Уся / Боевые искусства',
    avatar_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=200',
    card_image_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=800',
    total_chats_count: 500,
    monthly_chats_count: 50,
    gender: 'мужской',
    nsfw_allowed: false,
    is_public: true,
    is_deleted: false
  },
  {
    id: 'char-4',
    name: 'Командор Кросс',
    description: 'Опытный стратег звездного флота.',
    fandom: 'Космическая опера',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    card_image_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800',
    total_chats_count: 2100,
    monthly_chats_count: 450,
    gender: 'мужской',
    nsfw_allowed: false,
    is_public: true,
    is_deleted: false
  }
]

export const mockLorebooks: Lorebook[] = [
  {
    id: 'lore-1',
    fandom: 'Святилище Света',
    name: 'История Ордена Солнца',
    entries: [
      {
        id: 'entry-1',
        lorebook_id: 'lore-1',
        keywords: ['орден', 'солнце', 'вера'],
        content: 'Орден был основан за триста лет до начала событий. Его цель — защита мира от Тьмы.',
        priority: 10
      }
    ]
  },
  {
    id: 'lore-2',
    character_id: 'char-2',
    name: 'Прошлое Талроса',
    entries: [
      {
        id: 'entry-2',
        lorebook_id: 'lore-2',
        keywords: ['детство', 'трущобы'],
        content: 'Талрос вырос в приюте Святой Марии, который сгорел при загадочных обстоятельствах.',
        priority: 5
      }
    ]
  }
]

export const mockUsers = [
  {
    login: 'admin',
    password: 'admin',
    role: 'admin',
    username: 'master_admin',
    fullName: 'Skald Admin'
  },
  {
    login: 'moderator',
    password: 'moderator',
    role: 'moderator',
    username: 'mod_user',
    fullName: 'Lore Moderator'
  },
  {
    login: 'user',
    password: 'user',
    role: 'user',
    username: 'active_player',
    fullName: 'Regular Player'
  }
]
