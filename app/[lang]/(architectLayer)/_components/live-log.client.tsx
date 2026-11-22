"use client"

import { useEffect, useRef } from "react"
import { Spinner } from "@/components/ui/spinner"

// ЯЩИК ЖИВОГО ХОДА (узел, шаг 353-3). Слово владельца 2026-10-01: «контейнер который увеличивается максимум до 400 пикселей у
// которого внутри идут какие-то движения процессы я бы хотя бы понимал что что-то происходит». Растёт со строками до 400 px, дальше
// прокручивается и держится на последней строке. Строки даёт тот, кто его показывает (хвост журнала из двери); сам ящик ничего
// не спрашивает.
// 642-1: `done` — работа кончилась: без вращения, заголовок — итог (`failed` — красным), ящик остаётся со своими строками.
export function LiveLog({ title, lines, done, failed }: { title: string; lines: string[]; done?: boolean; failed?: boolean }) {
  const ref = useRef<HTMLPreElement>(null)
  useEffect(() => {
    const el = ref.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lines])
  return (
    <div data-block="dwc8e" className="flex flex-col gap-2" role="status" data-live-log={done ? (failed ? "failed" : "done") : "running"}>
      <p data-block="hwnnd" className={`flex items-center gap-2 text-sm font-medium ${failed ? "text-destructive" : "text-foreground"}`}>
        {!done && <Spinner />}
        {title}
      </p>
      <pre
        ref={ref}
        className="max-h-[400px] min-h-16 overflow-auto whitespace-pre-wrap break-all rounded-md border border-border bg-muted p-3 font-mono text-xs leading-relaxed text-foreground"
        data-live-log-lines={lines.length}
      >
        {lines.join("\n")}
      </pre>
    </div>
  )
}
