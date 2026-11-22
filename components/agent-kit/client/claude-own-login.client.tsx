"use client"

import { kitApi } from "./kit-place"
import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import type { ClaudeSubscriptionWords } from "../words/claude-subscription.i18n"

// ЧЬЯ ПОДПИСКА У ЭЛЕМЕНТА (689, владелец 2026-11-08: «if user need personal claude subscribtion , then can add to own element»).
// Островок под входом в подписку: «Подписка узла» или «Своя подписка человека этого элемента». Своя — у элемента появляется своя папка
// Claude Code (`data/services/<id>/claude/`, дверь `agent-api/claude-auth` POST), и кнопка входа выше входит уже в неё, а вход узла не
// меняется. У агента узла и главного агента своей подписки не бывает — дверь отвечает `canOwn: false`, и островок не рисуется.
// 🔒 Переключить можно только при выключенном агенте элемента (дверь отвечает 409 `agent-running`). После переключения островок входа
// проверяет состояние заново по событию `claude-own-changed` — без таймера.


type State = { canOwn: boolean; own: boolean } | null

export function ClaudeOwnLogin({ service, lang, words }: { service: string; lang: string; words: ClaudeSubscriptionWords }) {
  const api = `${kitApi(lang, service)}/claude-auth`
  const [state, setState] = useState<State>(null)
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const res = await fetch(api, { cache: "no-store" })
      const d = res.ok ? ((await res.json()) as { canOwn?: boolean; own?: boolean }) : null
      setState(d ? { canOwn: d.canOwn === true, own: d.own === true } : null)
    } catch {
      setState(null)
    }
  }, [api])

  useEffect(() => {
    load()
  }, [load])

  const choose = useCallback(
    async (own: boolean) => {
      if (busy || !state || state.own === own) return
      setBusy(true)
      setNote(null)
      try {
        const res = await fetch(api, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ own }) })
        if (res.status === 409) setNote(words.ownBusy)
        else if (!res.ok) setNote(words.ownFailed)
        else {
          const d = (await res.json()) as { own?: boolean }
          setState({ canOwn: true, own: d.own === true })
          window.dispatchEvent(new Event("claude-own-changed"))
        }
      } catch {
        setNote(words.ownFailed)
      } finally {
        setBusy(false)
      }
    },
    [api, busy, state, words],
  )

  if (!state?.canOwn) return null
  return (
    <div data-block="ub6m5" className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4" data-claude-own-login data-own={state.own ? "own" : "node"}>
      <p data-block="hvahd" className="font-medium text-foreground text-sm">{words.ownTitle}</p>
      <div data-block="oxf2n" className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant={state.own ? "outline" : "default"} disabled={busy} aria-pressed={!state.own} onClick={() => choose(false)}>
          {words.ownNode}
        </Button>
        <Button type="button" size="sm" variant={state.own ? "default" : "outline"} disabled={busy} aria-pressed={state.own} onClick={() => choose(true)}>
          {words.ownOwn}
        </Button>
      </div>
      {note ? <p data-block="rm68s" className="text-destructive text-sm" role="status">{note}</p> : null}
    </div>
  )
}
