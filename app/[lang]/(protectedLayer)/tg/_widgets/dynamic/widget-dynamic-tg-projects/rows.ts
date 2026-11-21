// The row of one direction (group) in the Mini App's projects lists (node step 821): its icon, title and the line «what lives here»;
// in a sorted list the line gives way to its numbers (pages on the site · tasks in Cron).
import type { TgRowProps } from "../../../_components/tg-list"
import type { ProjectGroup } from "../../../_libs/projects"
import { plural } from "../../../_libs/words"
import type { ProjectsUi } from "./ui.i18n"

export function groupRow(g: ProjectGroup, ui: ProjectsUi, lang: string, numbers = false): TgRowProps {
  const facts = [g.pages ? plural(ui.pages, g.pages, lang) : null, g.active ? plural(ui.tasks, g.active, lang) : null].filter(Boolean).join(" · ")
  return { icon: g.icon, title: g.title, hint: numbers ? facts : g.line, href: g.href, aside: !numbers && g.pages ? String(g.pages) : null }
}
