// The line the element's own bot writes into the chat when the person presses «Перейти в чат» in a section (node step 840-4; the owner,
// Telegram 947, phrase 14 of 953). A pure function — the door `tg/api/context` sends it, the test reads it.
const LINE: Record<string, string> = {
  en: "📍 You came from the section: {path}. Write — I answer about it.",
  ru: "📍 Вы пришли из раздела: {path}. Пишите — отвечу про него.",
}

// 852-7: a quiz node sends its question with the path — the person answers it right there in the chat (Roma, Telegram 1299:
// «передаёт путь и предустановленные сообщения»).
export function chatLine(lang: string, path: string[], ask?: string | null): string {
  const line = (LINE[lang] ?? LINE.en).replace("{path}", path.join(" › "))
  return ask ? `${line}\n❓ ${ask}` : line
}
