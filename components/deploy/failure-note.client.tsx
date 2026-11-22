"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

// ИТОГ УПАВШЕГО РАЗВЁРТЫВАНИЯ (узел, шаг 642-4). Владелец 2026-11-04: «если процессе этого какая-то ошибка что должно произойти в
// идеальном сценарии так чтобы пользователю было понятно что прямо сейчас процесс в режиме отладки будет перезапущен?».
// Три строки и кнопка: что упало (причина простыми словами, `lib/deploy/build-failure.cjs`), работает ли прежняя версия (проверено
// ответом процесса), был ли повтор. «Разобрать с главным агентом» — слово человека главному агенту (`POST /api/node/deploy
// { debug }`): закон «только агенты говорят с агентами» — агенту элемента задачу даёт главный агент, не эта кнопка.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

export type FailureCause = { kind: string; passing?: boolean; detail?: string } | null
export type FailureWords = {
  causes: Record<string, string>
  /** `{detail}` — строка журнала, где найдена причина */
  where: string
  previousUp: string
  previousDown: string
  retried: string
  debug: string
  debugSent: string
  debugPending: string
  debugRefused: string
}

export function FailureNote({ words, cause, previousUp, retried, target }: {
  words: FailureWords; cause: FailureCause; previousUp: boolean | null; retried?: boolean; target: string
}) {
  const [sent, setSent] = useState<string | null>(null)
  async function debug() {
    const r = await fetch(`${BASE}/api/node/deploy`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ debug: target }) }).catch(() => null)
    const b = r ? ((await r.json().catch(() => null)) as { ok?: boolean; pending?: boolean } | null) : null
    setSent(b?.ok ? (b.pending ? words.debugPending : words.debugSent) : words.debugRefused)
  }
  const kind = cause?.kind ?? "unknown"
  return (
    <div data-block="b0mox" className="flex flex-col gap-1 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm" data-failure={kind}>
      <p data-block="u8z03" className="font-medium text-foreground">{words.causes[kind] ?? words.causes.unknown}</p>
      {cause?.detail && <p data-block="ell34" className="font-mono text-xs text-muted-foreground">{words.where.replace("{detail}", cause.detail)}</p>}
      {previousUp !== null && <p data-block="t8yt3" className="text-foreground" data-failure-previous={previousUp ? "up" : "down"}>{previousUp ? words.previousUp : words.previousDown}</p>}
      {retried && <p data-block="rngkl" className="text-muted-foreground" data-failure-retried>{words.retried}</p>}
      {sent ? <p data-block="s0s63" className="text-foreground" data-failure-sent>{sent}</p> : (
        <Button variant="outline" size="sm" className="self-start" onClick={() => void debug()} data-failure-debug={target}>{words.debug}</Button>
      )}
    </div>
  )
}
