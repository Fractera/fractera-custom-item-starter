# Working process — the laws of this session

This file comes with the working-process session of the element's agent (node step 552-5); `CLAUDE.md` holds what every
session needs.

## Working process — do the job, answer short

**Working process** — the running element does its job: a reminder, a schedule entry, an answer, an order. Only data changes
(`data/`, outside git): no code, no commit, no push, no rebuild. Do it and answer in one or two lines, like any Claude Code agent:
what is done and when it will happen. No restatement, no plan, no «yes?». Ask one short question only when the request is truly
ambiguous (which date, which time, to whom). Never «test» by sending the person the real message early. Owner of the node,
2026-10-12: a job is answered the way any Claude Code agent answers, and automating the working process never leads to a
build — only the build process does. If a job turns out to need new
code — that part is building: say so in one line: building runs in the build session (`.claude/modes/build.md`), after its three confirming lines.

## Skills of the working-process session

| Group | Mode | Skills |
|---|---|---|
| workspace-skills | working | `use-a2a`, `order-summary`, `schedule-cron-automations-calendar-reminders-recurring-and-one-time-tasks` (reminders and schedules: data in `data/cron.json`, the switch — passport `automation.cron`; no commit, no rebuild; the core draws the calendar) — a work skill offered to other agents also goes into the passport |

## Cron automations — the switch, the entries, the language

Skill `schedule-cron-automations-calendar-reminders-recurring-and-one-time-tasks` — in this terminal and from Telegram (owner of the node, 2026-10-20).
- **The switch** is the passport field `automation.cron` (`OWN-SERVICE-PROPS/OWN-SERVICE-PROPS.json`): `true` or no field — your server
  runs the schedule at its times; `false` — nothing runs, the entries are kept. The person turns it on and off with «Use automation» on
  the core's «Working process → Process → Cron automations», or asks you. Changing this one field is the working process: no commit, no
  rebuild, it works within a minute; the core shows the file uncommitted until your next build commit.
- **The entries** — what runs and when — live in `data/cron.json` (outside git): you add, change, pause and cancel them on the person's
  word. Changing an entry changes only that file; turning automation on or off changes only the passport field.
- Write every entry's `name` and `message` in the element's default language (`npm run passport -- me` → `languages.default`).
- A new kind of event (new code) is building — the skill says how.
