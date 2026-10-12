import { ownSiteUrl } from "../../own-site"
import { personLang, sendToOwner } from "../telegram"

// СОБЫТИЕ «НАПОМИНАНИЕ О ПРОЕКТЕ» (шаг 465). Владелец 2026-10-12: «каждый день 10 утра отправлять … текст напоминаем что у вас
// есть проект расположенный по адресу бла-бла-бла»; канал — Telegram (его ответ «to telegram»). Свойства элемента в тексте —
// позже, по его слову.

const TEXT = {
  en: (url: string) => `Reminder: you have a project at ${url}`,
  ru: (url: string) => `Напоминаем, что у вас есть проект по адресу ${url}`,
}

export default async function dailyProjectReminder() {
  const url = ownSiteUrl() ?? process.env.NEXT_PUBLIC_APP_URL?.trim() ?? `http://localhost:${process.env.PORT ?? ""}`
  return sendToOwner(TEXT[personLang()](url))
}
