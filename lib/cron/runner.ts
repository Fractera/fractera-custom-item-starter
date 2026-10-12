import { appendFileSync, mkdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { TELEGRAM_MESSAGE, dueAt, elementDir, hm, readPlan, seedSchedule, ymd, type CronSchedule } from "./due"
import dailyProjectReminder from "./events/daily-project-reminder"
import { sendToOwner } from "./telegram"
import { ownSiteUrl } from "../own-site"

// ИСПОЛНИТЕЛЬ РАСПИСАНИЯ ЭЛЕМЕНТА (шаг 465). Владелец 2026-10-12 подтвердил: «сервер элемента РАЗ В МИНУТУ сверяется с часами и
// запускает событие, чьё время пришло … Новых процессов не будет … Если компьютер выключен, запуск пропускается и потом не
// выполняется». 🔒 Это единственный таймер элемента, и служит он только CRON.json: без повторов при ошибке, без опроса чужого.
// Журнал — `data/cron-runs.jsonl` папки элемента (строка на запуск, `slot` = «YYYY-MM-DDTHH:MM» по местным часам); календарь
// ядра читает его, чтобы показать «выполнено / ошибка / пропущено».
// Расписание человека — `data/cron.json` (вне git, рабочий процесс); каталог событий — `OWN-SERVICE-PROPS/CRON.json` (git). 465-4:
// встроенное событие `telegram-message` шлёт текст `message` самой записи — новое напоминание не требует кода и сборки.
// Новое УМЕНИЕ (не текст) = строительный процесс: файл `lib/cron/events/<id>.ts` + строка в EVENTS + запись в `events` каталога
// (навык schedule-cron-automations-calendar-reminders-recurring-and-one-time-tasks).

type Result = { ok: boolean; detail?: string }
const EVENTS: Record<string, (s: CronSchedule) => Promise<Result>> = {
  // `{address}` в тексте — главный адрес элемента (465-5: «…от вашего календаря расположенного в проекте бла-бла-бла»).
  [TELEGRAM_MESSAGE]: async (s) => (s.message?.trim()
    ? sendToOwner(s.message.trim().replaceAll("{address}", ownSiteUrl() ?? `http://localhost:${process.env.PORT ?? ""}`))
    : { ok: false, detail: "no message text" }),
  "daily-project-reminder": dailyProjectReminder,
}

const MINUTE = 60_000
const CATCH_UP = 5 // минут: столько таймер может «проспать» под нагрузкой; запуск после выключения компьютера не догоняется

const logFile = () => join(elementDir(), "data", "cron-runs.jsonl")

function ranSlots(): Set<string> {
  try {
    return new Set(readFileSync(logFile(), "utf8").split(/\r?\n/).slice(-500).flatMap((l) => {
      try { const r = JSON.parse(l) as { schedule: string; slot: string }; return [`${r.schedule}@${r.slot}`] } catch { return [] }
    }))
  } catch {
    return new Set()
  }
}

function log(rec: Record<string, unknown>) {
  try {
    mkdirSync(join(elementDir(), "data"), { recursive: true })
    appendFileSync(logFile(), JSON.stringify(rec) + "\n")
  } catch (e) {
    console.warn(`[cron] журнал не записан: ${(e as Error).message}`)
  }
}

async function checkMinute(minute: Date) {
  const plan = readPlan()
  if (!plan) return
  const ran = ranSlots()
  for (const s of dueAt(plan, minute)) {
    const slot = `${ymd(minute)}T${hm(minute)}`
    if (ran.has(`${s.id}@${slot}`)) continue // перезапуск сервера в ту же минуту — второго запуска нет
    const handler = EVENTS[s.event]
    let r: Result
    try {
      r = handler ? await handler(s) : { ok: false, detail: `no handler for event ${s.event}` }
    } catch (e) {
      r = { ok: false, detail: (e as Error).message }
    }
    log({ slot, at: new Date().toISOString(), schedule: s.id, event: s.event, ok: r.ok, detail: r.detail })
    console.log(`[cron] ${slot} ${s.id} → ${r.ok ? "ok" : "ошибка"}${r.detail ? ` (${r.detail})` : ""}`)
  }
}

let started = false

export function startCron() {
  if (started) return
  started = true
  try { seedSchedule() } catch (e) { console.warn(`[cron] пример расписания не создан: ${(e as Error).message}`) }
  const floor = (t: number) => t - (t % MINUTE)
  let last = floor(Date.now()) - MINUTE // текущая минута проверяется на первом тике
  const tick = async () => {
    const now = floor(Date.now())
    const from = Math.max(last + MINUTE, now - (CATCH_UP - 1) * MINUTE)
    last = now
    for (let t = from; t <= now; t += MINUTE) await checkMinute(new Date(t))
  }
  const first = setTimeout(() => {
    void tick()
    setInterval(() => void tick(), MINUTE).unref()
  }, MINUTE - (Date.now() % MINUTE) + 1_000)
  first.unref()
  void tick()
  console.log("[cron] расписание data/cron.json: проверка раз в минуту")
}
