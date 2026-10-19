---
name: schedule-cron-automations-calendar-reminders-recurring-and-one-time-tasks
description: >
  Work skill. Schedules, reminders and cron automations of this element: put something on the calendar, remind the person at a
  time, repeat it every day, on weekdays, every week or every month, do it once on a date, pause one reminder, turn off all
  repeating reminders, turn them back on, say what is scheduled for a day. Load it whenever the person — in this terminal or from
  Telegram — asks to remind, notify, schedule, repeat, «every morning», «at 10», «on Fridays», «stop the reminders», «what do I have
  tomorrow», and whenever you touch `data/cron.json`, `OWN-SERVICE-PROPS/CRON.json` or `lib/cron/`. The thing you cannot guess: a
  reminder is DATA — one entry in `data/cron.json` (outside git) with its own text; no code, no commit, no push, no rebuild, and a
  one-line answer. The core draws it as the calendar under «Working process → Process → Cron automations»; the element's server reads it once a minute.
  Russian phrasings of the person: «напомни», «напоминай каждый день», «по будням», «раз в неделю», «каждый месяц», «поставь на
  паузу», «выключи все напоминания», «включи напоминания», «что у меня по расписанию», «крон», «расписание», «календарь».
---

<!-- PROOF · NOT PROVEN · written 2026-10-12, rewritten in node step 465-4; proven only when the agent of this element has done it on the person's word -->

# schedule-cron-automations-calendar-reminders-recurring-and-one-time-tasks

> A hint, not a law. If you know a better way for the case in front of you, do it and say so.

**Process: working** — the running element does its job; only data changes. Owner of the node, 2026-10-12: «автоматизация рабочего
процесса не должна приводить к сборке проекта … Только строительный процесс должен приводить к сборке»; «в рабочих процессах пусть
существует стандартный процесс ответа Claude Code Agent». ✗ Paid for: on «remind me about a birthday» an agent wrote an event
in code, committed it, asked for a rebuild, and «tested» it by sending the real «tomorrow is the birthday» a month early.

## Two files, two processes

| File | In git? | What | Who changes it |
|---|---|---|---|
| `data/cron.json` | **no** | the person's schedule: `schedules`, `repeatsPaused` | **you, in the working process** — this is all a reminder needs |
| `OWN-SERVICE-PROPS/CRON.json` | yes | the catalog of events (what the element CAN run) and `seed` (the example a new element starts with) | only the build process |
| `lib/cron/` | yes | the clock (once a minute) and the event handlers | only the build process |

The server reads `data/cron.json` every minute — a change is live within a minute. Times are the **local time of the computer**.
While the computer is off or the element is stopped, a run is skipped and **not made up later** (the calendar shows «skipped»).

## A reminder = one entry

```json
{
  "id": "call-mum-2026-10-13",
  "event": "telegram-message",
  "name": "Call mum",
  "message": "Позвонить маме.",
  "time": "09:00",
  "repeat": "once",
  "start": "2026-10-13",
  "enabled": true
}
```

- `event: "telegram-message"` — the built-in event: sends `message` as written to this element's Telegram bot (every allowed chat).
  Write `message` in the person's language, as the reminder itself («Завтра день рождения друга.»).
- `time` — `HH:MM`, 24 hours. `repeat` — `once` (on `start` only) · `daily` · `weekdays` (Mon–Fri) · `weekly` (the weekday of
  `start`) · `monthly` (the day of month of `start`). `start` — `YYYY-MM-DD`; `until` — optional last day.
- `enabled: false` — paused. `repeatsPaused: true` (top of the file) — **all repeating** entries off, `once` ones still run.
- `id` — short, unique, never reused: the run log points at it. No yearly repeat yet — for «every year» put the dates you can.

## What the person says → what you do → what you answer

| The person | You (edit `data/cron.json`) | Your answer — one or two lines |
|---|---|---|
| «remind me tomorrow at 9 to call mum» | one `once` entry | «Готово: завтра, 13 октября, в 9:00 напомню позвонить маме.» |
| «on weekdays at 9:30 …» | `repeat: weekdays` | «Готово: по будням в 9:30 — …» |
| «every Monday at 9:30» | `repeat: weekly`, `start` = next Monday | «Готово: по понедельникам в 9:30, начиная с 19 октября.» |
| «pause the Monday reminder» | `enabled: false` | «Поставил на паузу.» |
| «turn off all repeating reminders» / «back on» | `repeatsPaused: true` / `false` | «Все повторяющиеся выключены; разовые сработают.» |
| «delete it» | remove the entry | «Удалил.» |
| «what do I have on Friday?» | read, do not edit | the times and texts, nothing else |

No restatement, no plan, no «yes?», no commit, no push, no rebuild, no «check the calendar» lecture. Ask one short question only
when the request is truly ambiguous — which date («on the 10th» of which month?), which time («in the morning» → offer 9:00).
In Telegram — plain text. Mention the computer-off risk once, only for something that must not be missed (a birthday, a payment).

## Checking without sending

Do **not** run a handler or send a test message to «prove» a reminder: the person reads it as the real one. Check the data instead:
the file parses, the entry has the right `start`/`time`/`repeat`. The built-in `telegram-message` is proven once for the element;
a test send happens only when the person asks for it, and its text starts with «Проверка напоминания: …».

## When it is not a reminder — the build process

A new **ability** (call an outside service, build a report, post somewhere other than Telegram) is code: a handler in
`lib/cron/events/<id>.ts`, a line in `EVENTS` of `lib/cron/runner.ts`, an entry in `events` of `OWN-SERVICE-PROPS/CRON.json`, then
a rebuild (`deploy-element`). That is building: say so in one line and switch to the three confirming lines of `CLAUDE.md`. A new
**text** is never building.

## What it cannot do

Make up runs missed while the computer was off · run anything while the element's server is stopped · repeat yearly · let the
person edit the calendar with the mouse — only through you.

## Proof of a run

`data/cron-runs.jsonl` — one line per run: `slot` (`YYYY-MM-DDTHH:MM`, local), `at`, `schedule`, `event`, `ok`, `detail`.
