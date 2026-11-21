import "server-only"
import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { type CronSchedule, isOff, occursOn, readPlan } from "@/lib/cron/due"
import { elementRoot } from "@/lib/page-tree"

// What this element knows about itself from its own folder, for the Mini App's home, «Cron» and «Настройки» (node step 821; the
// owner, Telegram 412: «собственная инструкция элемента, о владельце, о проекте, навыки, подписки с датами окончания, MCP коннекторы»).
// Read by code at render, nothing kept. What only the core knows (the owner of an app, the agent's session, the fuel) is not here.

const text = (file: string) => {
  try { return readFileSync(join(elementRoot(), file), "utf8") } catch { return null }
}
const json = (file: string): Record<string, unknown> | null => {
  try { return JSON.parse(text(file) ?? "") } catch { return null }
}

export type Subscription = { name: string; until: string | null }
export type ElementFacts = {
  /** the first line of the instruction's section 11, or null while it is the template's placeholder */
  instruction: string | null
  /** the passport's short description */
  project: string | null
  skills: number
  subscriptions: Subscription[]
  /** the template's example service while there is no real one */
  example: string | null
  mcp: string[]
  /** the step the agent builds now — «Active step» of development-docs/current-step.md; null while there is none */
  step: string | null
}

function ownSkills(): number {
  let n = 0
  const walk = (dir: string, depth: number) => {
    let names: string[] = []
    try { names = readdirSync(dir) } catch { return }
    if (names.includes("SKILL.md")) { n += 1; return }
    if (depth < 3) for (const name of names) if (!name.startsWith(".")) walk(join(dir, name), depth + 1)
  }
  walk(join(elementRoot(), ".claude", "skills"), 0)
  return n
}

export function elementFacts(): ElementFacts {
  const own = text("CLAUDE.md")?.split(/^## 11\. This element\s*$/m)[1]?.split(/^## 12\./m)[0] ?? ""
  const firstLine = own.split("\n").map((l) => l.replace(/^[#>*\-\s]+/, "").trim()).find(Boolean) ?? null
  const passport = json("OWN-SERVICE-PROPS/OWN-SERVICE-PROPS.json")
  const subs = json("OWN-SERVICE-PROPS/SUBSCRIPTIONS.json")
  const services = (Array.isArray(subs?.services) ? subs.services : []) as Array<{ name?: string; until?: string; paidUntil?: string }>
  const mcp = json(".mcp.json")?.mcpServers
  // «**Active step:** 3 — the order form.» of development-docs/current-step.md; «none» — no step yet
  const active = text("development-docs/current-step.md")?.match(/\*\*Active step:\*\*\s*(.+)/)?.[1]?.replace(/\.$/, "").trim() ?? null
  const step = active && !/^none\b/i.test(active) ? active : null
  return {
    instruction: firstLine && !firstLine.startsWith("(Nothing yet") ? firstLine : null,
    project: typeof passport?.shortDescription === "string" && passport.shortDescription ? passport.shortDescription : null,
    skills: ownSkills(),
    subscriptions: subs?.example === true ? [] : services.map((s) => ({ name: s.name ?? "?", until: s.until ?? s.paidUntil ?? null })),
    example: subs?.example === true ? services.map((s) => s.name).filter(Boolean).join(", ") || null : null,
    mcp: mcp && typeof mcp === "object" ? Object.keys(mcp) : [],
    step,
  }
}

/** The six parts of «Настройки» and how many say something; the owner of the app is the core's (counted when its door exists). */
export function settingsFilled(f: ElementFacts): number {
  return [f.instruction, f.project, f.skills > 0, f.subscriptions.length > 0, f.mcp.length > 0].filter(Boolean).length
}

export type CalendarEntry = CronSchedule & { on: boolean; today: boolean }

/** The element's calendar (data/cron.json): every entry with whether it is on and runs today; the nearest of today after now. */
export function calendarFacts(): { entries: CalendarEntry[]; next: CalendarEntry | null } {
  const plan = readPlan()
  if (!plan) return { entries: [], next: null }
  const now = new Date()
  const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
  const entries = plan.schedules
    .map((s) => ({ ...s, on: !isOff(plan, s), today: !isOff(plan, s) && occursOn(s, now) }))
    .sort((a, b) => a.time.localeCompare(b.time))
  return { entries, next: entries.find((e) => e.today && e.time >= hhmm) ?? null }
}
