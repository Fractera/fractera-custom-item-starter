// Слова мессенджеров H2H и H2A (шаг узла 459). Названия — одинаковые на всех языках (решение шага: имя продукта, не перевод).
export type MessengerKind = 'h2h' | 'h2a'

export type MessengerUi = {
  title: string
  lead: string
  empty: string
  emptyNote: string
  conversation: string
  noMessages: string
  noMessagesNote: string
}

const TITLE: Record<MessengerKind, string> = { h2h: 'H2H Messenger', h2a: 'H2A Messenger' }

const UI: Record<string, Record<MessengerKind, Omit<MessengerUi, 'title'>>> = {
  en: {
    h2h: { lead: 'Conversations between people, found through the network.', empty: 'No conversations yet', emptyNote: 'Sending and storing messages is not built yet.', conversation: 'Conversation', noMessages: 'No messages yet', noMessagesNote: 'This conversation has no messages.' },
    h2a: { lead: 'Your conversations with your own agent.', empty: 'No conversations yet', emptyNote: 'Sending and storing messages is not built yet.', conversation: 'Conversation', noMessages: 'No messages yet', noMessagesNote: 'This conversation has no messages.' },
  },
  ru: {
    h2h: { lead: 'Беседы между людьми, найденными через сеть.', empty: 'Бесед пока нет', emptyNote: 'Отправка и хранение сообщений ещё не построены.', conversation: 'Беседа', noMessages: 'Сообщений пока нет', noMessagesNote: 'В этой беседе нет сообщений.' },
    h2a: { lead: 'Ваши беседы с вашим агентом.', empty: 'Бесед пока нет', emptyNote: 'Отправка и хранение сообщений ещё не построены.', conversation: 'Беседа', noMessages: 'Сообщений пока нет', noMessagesNote: 'В этой беседе нет сообщений.' },
  },
}

export function messengerUi(lang: string, kind: MessengerKind): MessengerUi {
  return { title: TITLE[kind], ...(UI[lang] ?? UI.en)[kind] }
}
