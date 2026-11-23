// @local — this element's Claude Code subscription page: the core's kit widgets as they are (node step 836-2)
import { ClaudeOwnLogin } from "@/components/agent-kit/client/claude-own-login.client"
import { ClaudeSubscription } from "@/components/agent-kit/client/claude-subscription.client"
import { AgentNextLinks } from "@/components/agent-kit/agent-links"
import { agentLinksWords } from "@/components/agent-kit/words/agent-links.i18n"
import { claudeSubscriptionWords } from "@/components/agent-kit/words/claude-subscription.i18n"
import { ownId } from "@/lib/own-id"

// The same three numbered steps as the core's page of this element (the owner of the node, 2026-11-08: «элемент чья это подписка должен
// стоять первым сверху … двоечка войти в аккаунт Троечка открыть терминал или настроить Telegram»), here behind this element's own
// sign-in (836, the owner: «пере используй их как есть»). Every door goes through `/api/agent-kit/…` (`components/agent-kit/client/kit-place.ts`).
// ✗ 2026-11-23 (the owner, Telegram 1182, ryabusmarina.ru: «первый пункт пустой … либо пусть их будет вместо три два»): the choice of
// accounts draws nothing where the element may use only its own (a server's wall, an app of its own) — a step with nothing in it is
// hidden, and the numbers are a CSS counter, so the steps stay 1, 2 (a hidden item does not count).
export function Widget({ lang }: { lang: string }) {
  const id = ownId() ?? ""
  const words = claudeSubscriptionWords(lang)
  const steps = [
    <ClaudeOwnLogin key="own" service={id} lang={lang} words={words} />,
    <ClaudeSubscription key="sign-in" service={id} lang={lang} words={words} />,
    <AgentNextLinks key="next" links={{ terminal: `/${lang}/admin/agent/terminal`, telegram: `/${lang}/admin/agent/telegram` }} words={agentLinksWords(lang)} />,
  ]
  return (
    <ol data-block="ag8s1" className="my-6 flex flex-col gap-6 [counter-reset:step]">
      {steps.map((step, i) => (
        <li key={i} data-block="ag8s2" className="flex gap-4 [counter-increment:step] has-[>div:empty]:hidden">
          <span data-block="ag8s3" aria-hidden className="w-8 shrink-0 pt-3 text-center font-semibold text-[length:var(--fs-h2)] text-muted-foreground tabular-nums before:content-[counter(step)]" />
          <div data-block="ag8s4" className="min-w-0 flex-1 [&>*]:my-0">{step}</div>
        </li>
      ))}
    </ol>
  )
}
