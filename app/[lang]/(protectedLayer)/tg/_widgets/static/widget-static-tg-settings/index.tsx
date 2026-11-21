// @local — «Настройки» of this element's Telegram Mini App (node step 821; the owner, Telegram 412: «собственная инструкция элемента,
// о владельце, о проекте, навыки, подписки с датами окончания, MCP коннекторы»): read views of what the element already has in its
// folder. Editing waits for the owner's next file; until then every part changes by words to the agent.

import { TgHead } from "../../../_components/tg-head.client"
import { TgGroup, TgNote, TgRows } from "../../../_components/tg-list"
import { elementFacts, settingsFilled } from "../../../_libs/element-facts"
import { fill, plural } from "../../../_libs/words"
import { settingsUi } from "./ui.i18n"

export function Widget({ lang }: { lang: string }) {
  const ui = settingsUi(lang)
  const f = elementFacts()
  const subs = f.subscriptions.length
    ? f.subscriptions.map((s) => (s.until ? `${s.name} ${fill(ui.until, { date: s.until })}` : s.name)).join(", ")
    : f.example ? fill(ui.example, { names: f.example }) : ui.noSubscriptions
  return (
    <div className="flex flex-col gap-5 pb-10" data-block="tg-settings" data-app-column="">
      <TgHead line={fill(ui.line, { n: settingsFilled(f) })} title={ui.title} />
      <div className="flex flex-col gap-6 px-3" data-block="tg-settings-body">
        <TgGroup>
          <TgRows
            rows={[
              { icon: "scroll-text", title: ui.instruction, hint: f.instruction ?? ui.instructionEmpty },
              { icon: "user-round", title: ui.owner, hint: ui.ownerHint, soon: ui.soon },
              { icon: "briefcase", title: ui.project, hint: f.project ?? ui.empty },
              { icon: "sparkles", title: ui.skills, hint: plural(ui.skillsN, f.skills, lang) },
              { icon: "credit-card", title: ui.subscriptions, hint: subs },
              { icon: "plug", title: ui.mcp, hint: f.mcp.length ? f.mcp.join(", ") : ui.noMcp },
            ]}
          />
        </TgGroup>
        <TgNote>{ui.how}</TgNote>
      </div>
    </div>
  )
}
