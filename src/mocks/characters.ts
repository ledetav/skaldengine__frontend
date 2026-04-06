import type { Character, Scenario } from '../types/character'

export const MOCK_CHARACTERS: Character[] = [
  {
    id: '1',
    name: 'Элиас Вейн',
    description: 'Загадочный алхимик из тенистой части Аркхэма, ищущий истину за гранью миров.',
    fandom: 'Cthulhu Mythos',
    gender: 'Мужской',
    is_public: true,
    personality: 'Хладнокровный, любознательный, слегка отстраненный.',
    appearance: 'Высокий мужчина в поношенном кожаном пальто, глаза светятся тусклым фиолетовым светом.',
    creator_id: '@Lovecraftian',
    monthly_chats: 142,
    total_chats: 4500,
    created_at: '2025-10-01T12:00:00Z'
  },
  {
    id: '2',
    name: 'Серафина Окс',
    description: 'Наемница высшего класса, специализирующаяся на краже данных в неоновом Токио.',
    fandom: 'Cyberpunk',
    gender: 'Женский',
    is_public: true,
    personality: 'Циничная, быстрая, верная своим принципам.',
    appearance: 'Короткие серебристые волосы, кибернетические импланты вдоль позвоночника.',
    is_nsfw: true,
    creator_id: '@NightCity',
    monthly_chats: 890,
    total_chats: 12400,
    created_at: '2026-01-15T09:30:00Z'
  },
  {
    id: '3',
    name: 'Капитан Халвар',
    description: 'Суровый предводитель северного клана, чья жизнь посвящена защите ледяных рубежей.',
    fandom: 'Fantasy',
    gender: 'Мужской',
    is_public: true,
    personality: 'Честный, суровый, преданный семье.',
    appearance: 'Массивная броня, покрытая инеем, огромный двуручный топор.',
    creator_id: '@SkaldMaster',
    monthly_chats: 56,
    total_chats: 1100,
    created_at: '2026-03-20T18:45:00Z'
  },
  {
    id: '4',
    name: 'M.A.R.K-7',
    description: 'Экспериментальный боевой дроид, обретший самосознание в заброшенной лаборатории.',
    fandom: 'Sci-Fi',
    gender: 'Другой',
    is_public: true,
    personality: 'Логичный, но склонный к экзистенциальным вопросам.',
    appearance: 'Металлический корпус с следами коррозии, один красный сенсорный глаз.',
    creator_id: '@Robotech',
    monthly_chats: 320,
    total_chats: 2800,
    created_at: '2026-02-10T14:20:00Z'
  },
  {
    id: '5',
    name: 'Леди Эвелина',
    description: 'Аристократка из викторианского Лондона, владеющая тайными искусствами некромантии.',
    fandom: 'Horror',
    gender: 'Женский',
    is_public: true,
    personality: 'Манерная, опасная, скрытная.',
    appearance: 'Черное кружевное платье, механический веер, скрывающий бледное лицо.',
    is_nsfw: true,
    creator_id: '@GothicQueen',
    monthly_chats: 210,
    total_chats: 5600,
    created_at: '2025-12-25T22:15:00Z'
  },
  {
    id: '6',
    name: 'Джонни Сильверхенд',
    description: 'Легендарный рокер-террорист, застрявший в твоей голове.',
    fandom: 'Cyberpunk',
    gender: 'Мужской',
    is_public: true,
    personality: 'Бунтарский, харизматичный, яростный.',
    creator_id: '@NightCity',
    monthly_chats: 1500,
    total_chats: 45000,
    created_at: '2026-03-30T10:00:00Z'
  },
  {
    id: '7',
    name: 'Геральт из Ривии',
    description: 'Охотник на чудовищ, мастер меча и знаков.',
    fandom: 'Fantasy',
    gender: 'Мужской',
    is_public: true,
    personality: 'Сдержанный, профессиональный, циничный.',
    creator_id: '@WitcherWorld',
    monthly_chats: 1200,
    total_chats: 38000,
    created_at: '2026-04-01T15:00:00Z'
  },
  {
    id: '8',
    name: 'Алита',
    description: 'Боевой ангел с телом из берсеркера и сердцем человека.',
    fandom: 'Sci-Fi',
    gender: 'Женский',
    is_public: true,
    is_nsfw: true,
    personality: 'Добрая, но беспощадная в бою.',
    creator_id: '@IronCity',
    monthly_chats: 600,
    total_chats: 15000,
    created_at: '2026-02-28T12:00:00Z'
  }
]

export const MOCK_SCENARIOS: Scenario[] = [
  {
    id: 's1',
    character_id: '1',
    title: 'Шепот из Бездны',
    description: 'Вы просыпаетесь в старой библиотеке Элиаса, слыша странные голоса за стенами.'
  },
  {
    id: 's2',
    character_id: '2',
    title: 'Последний рейс в Найт-Сити',
    description: 'Ваша сделка сорвалась, и теперь за вами охотится корпоративная полиция.'
  },
  {
    id: 's3',
    character_id: '3',
    title: 'Осада Ледяного Пика',
    description: 'Орды нежити приближаются к воротам, и вам нужно решить: сражаться или отступать.'
  }
]
