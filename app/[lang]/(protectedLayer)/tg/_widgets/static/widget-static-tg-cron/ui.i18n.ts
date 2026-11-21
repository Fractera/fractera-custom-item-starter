// Words of the Mini App's «Cron» — the element's one calendar for every project (node step 821). `en` base, `ru` translation.
export type CronUi = {
  title: string; line: string; today: string; all: string; none: string; noneToday: string; off: string; how: string
  repeat: Record<"once" | "daily" | "weekdays" | "weekly" | "monthly" | "yearly", string>
}

const en: CronUi = {
  title: "Cron", line: "The element's calendar — one for every project", today: "Today", all: "Every task",
  none: "The calendar is empty.", noneToday: "Nothing planned for today.", off: "off",
  how: "Tell the agent in the chat what to do and when — it writes the task here and can tie it to a project.",
  repeat: { once: "once, {date}", daily: "every day", weekdays: "on weekdays", weekly: "every week", monthly: "every month", yearly: "every year" },
}

const ru: CronUi = {
  title: "Cron", line: "Календарь элемента — общий для всех проектов", today: "Сегодня", all: "Все задачи",
  none: "Календарь пуст.", noneToday: "На сегодня ничего не запланировано.", off: "выкл.",
  how: "Скажите агенту в чате, что и когда сделать, — он запишет задачу сюда и может привязать её к проекту.",
  repeat: { once: "один раз, {date}", daily: "каждый день", weekdays: "по будням", weekly: "каждую неделю", monthly: "каждый месяц", yearly: "каждый год" },
}

const ALL: Record<string, CronUi> = { en, ru }
export const cronUi = (lang: string): CronUi => ALL[lang] ?? en
