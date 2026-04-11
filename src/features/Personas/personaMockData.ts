import type { UserPersona } from '@/core/types/chat'

/* ─── Mock Personas ────────────────────────────── */
export const mockPersonas: UserPersona[] = [
  {
    id: 'persona-1',
    name: 'Алекс',
    description: 'Опытный путешественник и мастер меча со шрамом на левом глазу.',
    appearance: 'Высокий, темные волосы, шрам на левом глазу, кожаный плащ с капюшоном.',
    personality: 'Stoic and brave. Keeps secrets, trusts few.',
    facts: 'Знает несколько языков. Бывший наёмник.',
    gender: 'Мужской',
    age: 24,
    owner_id: 'user-1',
    lorebook_count: 2,
    chat_count: 14,
    created_at: '2024-03-15T10:00:00Z',
  },
  {
    id: 'persona-2',
    name: 'Лира Синяя Ночь',
    description: 'Молодая волшебница, изучающая тайны звёздной магии в далёкой академии.',
    appearance: 'Хрупкая девушка с синеватыми волосами и светящимися глазами.',
    personality: 'Любопытная, умная, иногда наивная. Верит в лучшее в людях.',
    facts: 'Говорит с призраками. Ненавидит пауков.',
    gender: 'Женский',
    age: 19,
    owner_id: 'user-1',
    lorebook_count: 0,
    chat_count: 3,
    created_at: '2024-03-22T14:30:00Z',
  },
  {
    id: 'persona-3',
    name: 'Граф Теодор',
    description: 'Аристократ из альтернативной Викторианской Британии, владеющий паровыми технологиями будущего.',
    appearance: 'Пожилой джентльмен в цилиндре и пальто с механическим монокулем.',
    personality: 'Высокомерный на первый взгляд, но с горячим сердцем патриота.',
    facts: null,
    gender: 'Мужской',
    age: 58,
    owner_id: 'user-1',
    lorebook_count: 1,
    chat_count: 0,
    created_at: '2024-04-01T09:00:00Z',
  },
]

/* ─── Mock Stats ───────────────────────────────── */
export const mockPersonaStats = {
  total_chats: 17,
  total_personas: 3,
  total_lorebooks: 5,
}
