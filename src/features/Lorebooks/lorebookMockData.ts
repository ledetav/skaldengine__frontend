/* ─── Lorebook Mock Data ─────────────────────────
   Matches backend API schema:
   POST /lorebooks/ · GET /lorebooks/
   POST /lorebooks/{id}/entries · GET /lorebooks/entries/{entry_id}
──────────────────────────────────────────────── */

export interface LorebookEntry {
  id: string
  lorebook_id: string
  keywords: string[]
  content: string
  priority: number
  created_at: string
}

export interface Lorebook {
  id: string
  name: string
  description: string | null
  fandom: string | null
  character_id: string | null
  character_name?: string
  user_persona_id: string | null
  user_persona_name?: string
  entries_count: number
  owner_id: string
  created_at: string
  entries?: LorebookEntry[]
}

/* ─── Mock Entries ─────────────────────────────── */
const lorebookEntries1: LorebookEntry[] = [
  {
    id: 'entry-1',
    lorebook_id: 'lb-1',
    keywords: ['лунная магия', 'звёздный свет', 'астральная сила'],
    content: 'Лунная магия черпает силу из отражённого света звёзд. Чародеи этой традиции заряжают свои заклинания в ночь полнолуния. Сила заклятий снижается в дни новолуния в три раза.',
    priority: 10,
    created_at: '2024-03-15T10:00:00Z',
  },
  {
    id: 'entry-2',
    lorebook_id: 'lb-1',
    keywords: ['Элара', 'Лунный Шёпот', 'эльфийская чародейка'],
    content: 'Элара Лунный Шёпот — эльфийская чародейка из рода хранителей созвездий. Её особенность: слышит голоса умерших через лунный свет. Хранит тайну древнего пророчества о "Звёздном Разломе".',
    priority: 9,
    created_at: '2024-03-16T12:00:00Z',
  },
  {
    id: 'entry-3',
    lorebook_id: 'lb-1',
    keywords: ['Забытый Приют', 'таверна', 'встреча'],
    content: '"Забытый Приют" — таверна на перекрёстке трёх королевств. Здесь скрываются контрабандисты, путешественники и шпионы. Хозяйка — Мара Серебряный Крюк, знает всё о местных тайнах.',
    priority: 7,
    created_at: '2024-03-17T09:00:00Z',
  },
  {
    id: 'entry-4',
    lorebook_id: 'lb-1',
    keywords: ['антимагия', 'магический барьер', 'проклятие'],
    content: 'Руины замка Фельдар окружены полем антимагии радиусом 200 метров. Заклинания выше 3-го круга не работают. Источник барьера — Камень Пустоты в тронном зале.',
    priority: 8,
    created_at: '2024-03-18T14:00:00Z',
  },
  {
    id: 'entry-5',
    lorebook_id: 'lb-1',
    keywords: ['эльфы', 'народ звёзд', 'история'],
    content: 'Народ звёзд (эльфы) переселился в этот мир 3000 лет назад через Звёздный Разлом. Их изначальная родина — Астральный план. Каждый эльф связан с определённым созвездием с рождения.',
    priority: 6,
    created_at: '2024-03-19T11:00:00Z',
  },
]

const lorebookEntries2: LorebookEntry[] = [
  {
    id: 'entry-6',
    lorebook_id: 'lb-2',
    keywords: ['серебряный лес', 'бестиарий', 'опасные существа'],
    content: 'Серебряный лес населён Сиянами — призрачными существами из чистой магии. Безобидны при дневном свете, агрессивны ночью. Отступают от огня и серебра.',
    priority: 10,
    created_at: '2024-03-20T10:00:00Z',
  },
  {
    id: 'entry-7',
    lorebook_id: 'lb-2',
    keywords: ['зачарованные грибы', 'flora', 'яды'],
    content: 'Лунные поганки светятся синим светом. Сок вызывает 6-часовой глубокий сон. В малых дозах — мощное болеутоляющее. Растут только рядом с источниками магии.',
    priority: 8,
    created_at: '2024-03-21T14:00:00Z',
  },
]

/* ─── Mock Lorebooks ───────────────────────────── */
export const mockLorebooks: Lorebook[] = [
  {
    id: 'lb-1',
    name: 'Хроники Лунных Земель',
    description: 'Полная история народа Элары: от переселения до Звёздной войны. Включает описание магических традиций.',
    fandom: 'Fantasy',
    character_id: 'char-1',
    character_name: 'Элара Лунный Шёпот',
    user_persona_id: null,
    entries_count: 5,
    owner_id: 'user-1',
    created_at: '2024-03-15T10:00:00Z',
    entries: lorebookEntries1,
  },
  {
    id: 'lb-2',
    name: 'Бестиарий Сильварии',
    description: 'Описания существ, магической флоры и опасных зон Серебряного леса.',
    fandom: 'Fantasy',
    character_id: 'char-1',
    character_name: 'Элара Лунный Шёпот',
    user_persona_id: null,
    entries_count: 2,
    owner_id: 'user-1',
    created_at: '2024-03-20T09:00:00Z',
    entries: lorebookEntries2,
  },
  {
    id: 'lb-3',
    name: 'Дневник Алекса',
    description: 'События из прошлого Алекса — для погружения в сессии с разными персонажами.',
    fandom: null,
    character_id: null,
    user_persona_id: 'persona-1',
    user_persona_name: 'Алекс',
    entries_count: 0,
    owner_id: 'user-1',
    created_at: '2024-04-01T09:00:00Z',
    entries: [],
  },
]
