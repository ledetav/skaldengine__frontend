import type { Character, Scenario } from '../types/character'

export const MOCK_CHARACTERS: Character[] = [
  {
    id: '1',
    name: 'Элиас Вейн',
    description: 'Загадочный алхимик из тенистой части Аркхэма, ищущий истину за гранью миров.',
    fandom: 'Cthulhu Mythos',
    is_public: true,
    personality: 'Хладнокровный, любознательный, слегка отстраненный.',
    appearance: 'Высокий мужчина в поношенном кожаном пальто, глаза светятся тусклым фиолетовым светом.',
    creator_id: '@Lovecraftian'
  },
  {
    id: '2',
    name: 'Серафина Окс',
    description: 'Наемница высшего класса, специализирующаяся на краже данных в неоновом Токио.',
    fandom: 'Cyberpunk',
    is_public: true,
    personality: 'Циничная, быстрая, верная своим принципам.',
    appearance: 'Короткие серебристые волосы, кибернетические импланты вдоль позвоночника.',
    creator_id: '@NightCity'
  },
  {
    id: '3',
    name: 'Капитан Халвар',
    description: 'Суровый предводитель северного клана, чья жизнь посвящена защите ледяных рубежей.',
    fandom: 'High Fantasy',
    is_public: true,
    personality: 'Честный, суровый, преданный семье.',
    appearance: 'Массивная броня, покрытая инеем, огромный двуручный топор.',
    creator_id: '@SkaldMaster'
  },
  {
    id: '4',
    name: 'M.A.R.K-7',
    description: 'Экспериментальный боевой дроид, обретший самосознание в заброшенной лаборатории.',
    fandom: 'Sci-Fi',
    is_public: true,
    personality: 'Логичный, но склонный к экзистенциальным вопросам.',
    appearance: 'Металлический корпус с следами коррозии, один красный сенсорный глаз.',
    creator_id: '@Robotech'
  },
  {
    id: '5',
    name: 'Леди Эвелина',
    description: 'Аристократка из викторианского Лондона, владеющая тайными искусствами некромантии.',
    fandom: 'Steampunk / Gothic',
    is_public: true,
    personality: 'Манерная, опасная, скрытная.',
    appearance: 'Черное кружевное платье, механический веер, скрывающий бледное лицо.',
    creator_id: '@GothicQueen'
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
