// СЛОВА ПОЛОСЫ БЫСТРОЙ НАВИГАЦИИ (шаг 706-3). Прежняя жёлтая вывеска («Вы просматриваете ваш стартовый шаблон…») говорила это КАЖДОМУ
// посетителю; полосу видит только владелец — на этой машине или вошедший архитектор на своём домене, — и она ведёт к трём делам.
export type QuickNavWords = {
  label: string
  lead: string
  design: string
  settings: string
  subscription: string
  hide: string
  skill: string
}

const EN: QuickNavWords = {
  label: 'Quick navigation',
  lead: 'Only you see this strip. Your element:',
  design: 'Design and brief',
  settings: 'Site settings',
  subscription: 'Claude Code subscription',
  hide: 'Hide until the next visit',
  skill: 'design skill',
}

const RU: QuickNavWords = {
  label: 'Быстрая навигация',
  lead: 'Эту полосу видите только вы. Ваш элемент:',
  design: 'Дизайн и бриф',
  settings: 'Настройки сайта',
  subscription: 'Подписка Claude Code',
  hide: 'Скрыть до следующего захода',
  skill: 'навык дизайна',
}

export function quickNavWords(lang: string): QuickNavWords {
  return lang === 'ru' ? RU : EN
}
