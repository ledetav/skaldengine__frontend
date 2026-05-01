/** Категории записей лорбука */
export const ENTRY_CATEGORIES = [
  { id: 'fact', name: 'Факт / Общее' },
  { id: 'appearance', name: 'Внешность' },
  { id: 'mindset', name: 'Мировоззрение / Мысли' },
  { id: 'speech', name: 'Стиль речи' },
  { id: 'history', name: 'История / Биография' },
  { id: 'inventory', name: 'Инвентарь / Предметы' },
  { id: 'geography', name: 'География / Места' },
  { id: 'nature', name: 'Природа / Флора и Фауна' },
  { id: 'world', name: 'Законы мира / Магия' },
  { id: 'secret', name: 'Секрет / Скрытый факт' },
]

export const CATEGORY_MAP: Record<string, string> = {
  fact: 'Факт',
  appearance: 'Внешность',
  mindset: 'Мысли',
  speech: 'Речь',
  history: 'История',
  inventory: 'Предметы',
  geography: 'Места',
  nature: 'Природа',
  world: 'Мир',
  secret: 'Секрет'
}

export const LB_CATEGORY_MAP: Record<string, string> = {
  general: 'Общая',
  nature: 'Природа',
  geography: 'География',
  history: 'История',
  world: 'Мир / Законы',
  characters: 'Персонажи',
  items: 'Предметы',
  beings: 'Существа'
}

export const LB_CATEGORY_OPTIONS = [
  { id: 'general', name: 'Общая' },
  { id: 'nature', name: 'Природа' },
  { id: 'geography', name: 'География' },
  { id: 'history', name: 'История' },
  { id: 'world', name: 'Мир / Законы' },
  { id: 'characters', name: 'Персонажи' },
  { id: 'items', name: 'Предметы' },
  { id: 'beings', name: 'Существа' },
]
