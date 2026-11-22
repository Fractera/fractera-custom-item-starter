// @local — the agent group's own page: where the subscription, the terminal and the bot are (node step 836-2)
import { AgentNextLinks } from "@/components/agent-kit/agent-links"
import { agentLinksWords } from "@/components/agent-kit/words/agent-links.i18n"

// The group page `/<lang>/admin/agent` — the kit's own links to the terminal and the bot; the subscription is the first child page.
export function Widget({ lang }: { lang: string }) {
  return <AgentNextLinks links={{ terminal: `/${lang}/admin/agent/terminal`, telegram: `/${lang}/admin/agent/telegram` }} words={agentLinksWords(lang)} />
}
