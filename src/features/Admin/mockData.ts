import type { Character, Lorebook, User, UserPersona } from './types'

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
    scenarios_count: 5,
    scenario_chats_count: 120,
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
    scenarios_count: 3,
    scenario_chats_count: 45,
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
    scenarios_count: 2,
    scenario_chats_count: 10,
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
    scenarios_count: 8,
    scenario_chats_count: 310,
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
    description: 'Древние свитки о становлении ордена и его борьбе с тьмой.',
    entries_count: 1,
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
    description: 'Секретные данные о происхождении наемника.',
    entries_count: 1,
    entries: [
      {
        id: 'entry-2',
        lorebook_id: 'lore-2',
        keywords: ['детство', 'трущобы'],
        content: 'Талрос вырос в приюте Святой Марии, который сгорел при загадочных обстоятельствах.',
        priority: 5
      }
    ]
  },
  {
    id: 'lore-3',
    user_persona_id: 'persona-1',
    user_persona_name: 'Алекс',
    name: 'Дневник странника',
    description: 'Записки Алекса о его путешествиях по забытым землям.',
    entries_count: 1,
    entries: [
      {
        id: 'entry-3',
        lorebook_id: 'lore-3',
        keywords: ['странствие', 'пустыня'],
        content: 'В пустыне Гоби я нашел артефакт, который изменил мою жизнь навсегда.',
        priority: 8
      }
    ]
  }
]

export const mockUsers: any[] = [
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

export const mockUsersList: User[] = [
  {
    id: 'user-1',
    email: 'admin@skald.io',
    login: 'admin',
    username: '@master_admin',
    full_name: 'Skald Admin',
    role: 'admin',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    cover_url: null,
    about: 'Главный администратор системы.',
    created_at: '2024-01-01T12:00:00Z',
    birth_date: '1990-05-15'
  },
  {
    id: 'user-2',
    email: 'mod@skald.io',
    login: 'moderator',
    username: '@mod_user',
    full_name: 'Lore Moderator',
    role: 'moderator',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mod',
    cover_url: null,
    about: 'Отвечаю за порядок в лорбуках.',
    created_at: '2024-02-10T09:30:00Z',
    birth_date: '1995-11-20'
  },
  {
    id: 'user-3',
    email: 'player@skald.io',
    login: 'user',
    username: '@active_player',
    full_name: 'Regular Player',
    role: 'user',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player',
    cover_url: null,
    about: 'Люблю ролевые игры и глубокий лор.',
    created_at: '2024-03-20T15:45:00Z',
    birth_date: '2000-08-05'
  }
]

export const mockPersonas: UserPersona[] = [
  {
    id: 'persona-1',
    owner_id: 'user-3',
    name: 'Алекс',
    description: 'Опытный путешественник и мастер меча.',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
    age: 24,
    appearance: 'Высокий, со шрамом на левом глазу.',
    personality: 'Молчаливый и храбрый.',
    gender: 'Мужской',
    facts: 'Знает язык эльфов.',
    lorebook_count: 1,
    chat_count: 14,
    created_at: '2024-03-21T10:00:00Z'
  },
  {
    id: 'persona-2',
    owner_id: 'user-3',
    name: 'Лира',
    description: 'Волшебница, изучающая тайны звезд.',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lyra',
    age: 19,
    appearance: 'Хрупкая, с синеватыми волосами.',
    personality: 'Любопытная и умная.',
    gender: 'Женский',
    facts: 'Видит будущее в снах.',
    lorebook_count: 0,
    chat_count: 3,
    created_at: '2024-03-25T14:30:00Z'
  }
]
