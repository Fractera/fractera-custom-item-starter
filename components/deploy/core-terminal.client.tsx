"use client"

import { useEffect, useRef, useState } from "react"
import { LiveLog } from "@/app/[lang]/(architectLayer)/_components/live-log.client"
import { Button } from "@/components/ui/button"
import { FailureNote, type FailureCause, type FailureWords } from "./failure-note.client"

// ТЕРМИНАЛ ЯДРА НА ДОСКЕ РАЗВЁРТЫВАНИЙ (узел, шаги 642-2, 642-3). Владелец 2026-11-04: «от каждого элементом и в том числе ребро в
// случае запуска развёртывания вниз открывалось подобное решение».
// 🔒 ТРИ ИСТОЧНИКА ПО ОЧЕРЕДИ, раз в 1,5 с: дверь ядра, пока оно отвечает (сборка ядра — `/api/node/deploy?progress=1&core=1`,
// обновление узла — `/api/node/update?tail=1`: форк, элементы, навыки); ядро молчит (закрыта крышка) — чтец сборки
// `http://127.0.0.1:25680/status` (`lib/deploy/build-reader.cjs`, только этот компьютер); молчат оба — строка «ядро поднимается».
// Ядро ответило снова — итог из его двери и кнопка «Обновить страницу»: после сборки у страницы новые файлы.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
const READER = "http://127.0.0.1:25680/status" // READER_PORT в lib/deploy/build-reader.cjs

export type CoreTerminalWords = {
  /** сборка ядра идёт; `{stage}` — этап обновления узла */
  building: string
  updating: string
  /** строки идут от чтеца сборки — ядро остановлено */
  fromReader: string
  /** молчат и ядро, и чтец */
  silent: string
  done: string
  failed: string
  updateDone: string
  updateFailed: string
  reload: string
  stages: Record<string, string>
  /** 642-4 */
  failure: FailureWords
}

type Phase = "running" | "done" | "failed"
const local = () => typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname)

async function json<T>(url: string, ms = 4000): Promise<T | null> {
  try {
    const r = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(ms) })
    return r.ok ? ((await r.json()) as T) : null
  } catch {
    return null
  }
}

// 675-2: `onEnd` — итог сборки тому, кто терминал показал (терминал агента рисует свои кнопки); `noReload` — без своей кнопки.
export function CoreTerminal({ words, mode, since, onEnd, noReload = false }: { words: CoreTerminalWords; mode: "rebuild" | "update"; since: number; onEnd?: (phase: "done" | "failed") => void; noReload?: boolean }) {
  const [lines, setLines] = useState<string[]>([])
  const [phase, setPhase] = useState<Phase>("running")
  const [source, setSource] = useState<"core" | "reader" | "none">("core")
  const [stage, setStage] = useState<string | null>(null)
  const [cause, setCause] = useState<FailureCause>(null)
  const [retried, setRetried] = useState(false)
  const down = useRef(false)

  useEffect(() => {
    if (phase !== "running") return
    let stop = false
    const finished = (at?: string) => !!at && Date.parse(at) >= since - 5000
    const tick = async () => {
      if (mode === "rebuild") {
        const b = await json<{ core?: { deploy: { state: string; finishedAt?: string; cause?: FailureCause; retried?: boolean } | null; log: string[] } }>(`${BASE}/api/node/deploy?progress=1&core=1`)
        if (stop) return
        if (b?.core) {
          setSource("core")
          if (b.core.log?.length) setLines(b.core.log)
          const d = b.core.deploy
          if (d && (d.state === "done" || d.state === "failed") && finished(d.finishedAt)) {
            setCause(d.cause ?? null)
            setRetried(!!d.retried)
            setPhase(d.state)
          }
          return
        }
      } else {
        const b = await json<{ update: { state: string; stage?: string; finishedAt?: string; cause?: FailureCause } | null; log: string[] }>(`${BASE}/api/node/update?tail=1`)
        if (stop) return
        if (b) {
          setSource("core")
          if (b.log?.length) setLines(b.log)
          if (b.update?.stage) setStage(b.update.stage)
          const u = b.update
          if (u && (u.state === "done" || u.state === "failed" || u.state === "interrupted") && finished(u.finishedAt)) {
            setCause(u.cause ?? null)
            setRetried(!!b.log?.some((l) => l.startsWith("↻ Повторяю один раз")))
            setPhase(u.state === "done" ? "done" : "failed")
          }
          return
        }
      }
      down.current = true
      const r = local() ? await json<{ lines: string[] }>(READER, 2500) : null
      if (stop) return
      if (r) {
        setSource("reader")
        if (r.lines?.length) setLines(r.lines)
        if (mode === "update") setStage("core")
      } else setSource("none")
    }
    void tick()
    const t = setInterval(() => void tick(), 1500)
    return () => {
      stop = true
      clearInterval(t)
    }
  }, [mode, phase, since])

  const ended = useRef(onEnd)
  ended.current = onEnd
  useEffect(() => { if (phase !== "running") ended.current?.(phase) }, [phase])

  const stageName = stage ? words.stages[stage] ?? stage : ""
  const title =
    phase === "done" ? (mode === "update" ? words.updateDone : words.done)
    : phase === "failed" ? (mode === "update" ? words.updateFailed : words.failed)
    : source === "none" ? words.silent
    : mode === "update" ? words.updating.replace("{stage}", stageName)
    : words.building
  return (
    <div className="flex flex-col gap-2" data-block="core-terminal" data-core-terminal={phase} data-core-terminal-source={source}>
      <LiveLog title={title} lines={lines.length ? lines : ["…"]} done={phase !== "running"} failed={phase === "failed"} />
      {source === "reader" && phase === "running" && <p data-block="aayof" className="text-xs text-muted-foreground">{words.fromReader}</p>}
      {/* Ядро ответило — значит, прежняя сборка работает: это проверено самим ответом. */}
      {phase === "failed" && <FailureNote words={words.failure} cause={cause} previousUp={true} retried={retried} target={mode === "update" ? "update" : "core"} />}
      {phase !== "running" && down.current && !noReload && (
        <Button variant="outline" size="sm" className="self-start" onClick={() => window.location.reload()} data-core-terminal-reload>{words.reload}</Button>
      )}
    </div>
  )
}
