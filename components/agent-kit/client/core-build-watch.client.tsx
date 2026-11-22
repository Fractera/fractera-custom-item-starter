"use client"

import { kitDoor } from "./kit-place"
import { type ReactNode, useEffect, useState } from "react"
import { Hammer, Play, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CoreTerminal, type CoreTerminalWords } from "@/components/deploy/core-terminal.client"
import { LiveLog } from "@/app/[lang]/(architectLayer)/_components/live-log.client"
import type { AgentTerminalWords } from "../words/agent-terminal.i18n"
import { silenceVerdict } from "@/lib/deploy/core-silence.mjs"

// ИДЁТ СБОРКА ЯДРА — ВМЕСТО КНОПКИ «ЗАПУСТИТЬ АГЕНТА» (675-2). Владелец 2026-11-07: «вместо кнопки запустить агента, была бы индикация
// того что идёт сборка проекта … перенести сюда на вкладку терминали … чтобы не было иллюзия повторно нажать запуска агента»; «если нет
// ошибки то вводится кнопка закрыть и запустить агента и кнопка просто закрыть».
// 🔒 ТОТ ЖЕ ТЕРМИНАЛ СБОРКИ, ЧТО НА ДОСКЕ РАЗВЁРТЫВАНИЙ (`components/deploy/core-terminal.client.tsx`), а не второй: дверь ядра, пока
// оно отвечает, потом чтец сборки этого компьютера (`lib/deploy/build-reader.cjs`). Сборку узнаёт по записям узла: обновление
// (`/api/node/update`), кнопка «Развернуть ядро» (`/api/node/deploy`); ядро молчит — чтец. Голая `serve:rebuild` записи не пишет: её
// строки — от чтеца, а конец — «ядро снова отвечает», без вердикта.
// 🔒 СПРАШИВАЕТ, ТОЛЬКО ПОКА АГЕНТ НЕ РАБОТАЕТ (`active`): работающему терминалу показывать нечего. После сборки — свои кнопки; главный
// агент, которого сборка остановила, возвращается сам (675-1) — тогда страница перезагружается и подключается к нему.
// 🔒 738-8: МОЛЧАНИЕ ЯДРА — НЕ СБОРКА САМО ПО СЕБЕ. Голая сборка без единого ответа чтеца дольше трёх минут называется «ядро не отвечает»
// (`lib/deploy/core-silence.mjs`): ✗ 2026-11-13 переезд 737 остановил ядро, и терминал десять часов говорил «идёт сборка».

const READER = "http://127.0.0.1:25680/status" // READER_PORT в lib/deploy/build-reader.cjs
const local = () => typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname)

type Rec = { state?: string; startedAt?: string; finishedAt?: string }
type Build = { mode: "update" | "rebuild" | "bare"; since: number }
type End = "done" | "failed" | "back" | null

async function json<T>(url: string, ms = 4000): Promise<T | null> {
  try {
    const r = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(ms) })
    return r.ok ? ((await r.json()) as T) : null
  } catch {
    return null
  }
}

/**
 * Какая сборка идёт сейчас: запись ядра, а ядро молчит — чтец. Молчат оба — тоже «сборка» (675-4): ✗ снято наблюдателем 2026-11-07 —
 * между остановкой ядра и подъёмом чтеца ~16 с страница рисовала «Запустить агента», а кнопка при мёртвом ядре никуда не ведёт.
 * Ядро отвечает и сборки нет — `null`.
 */
async function detect(): Promise<Build | null> {
  const u = await json<{ update: Rec | null }>(kitDoor("/api/node/update?tail=1"))
  if (u) {
    if (u.update?.state === "running") return { mode: "update", since: Date.parse(u.update.startedAt ?? "") || Date.now() }
    const d = await json<{ core?: { deploy: Rec | null } }>(kitDoor("/api/node/deploy?progress=1&core=1"))
    const c = d?.core?.deploy
    return c?.state === "running" ? { mode: "rebuild", since: Date.parse(c.startedAt ?? "") || Date.now() } : null
  }
  const r = local() ? await json<{ what?: string; startedAt?: string }>(READER, 2500) : null
  if (r?.what === "update") return { mode: "update", since: (Date.parse(r.startedAt ?? "") || Date.now()) - 60 * 60_000 } // запись обновления началась раньше чтеца
  return { mode: "bare", since: Date.now() }
}

export function CoreBuildWatch({ active, words, build: terminalWords, sessionUrl, children }: { active: boolean; words: AgentTerminalWords; build?: CoreTerminalWords; sessionUrl: string; children: ReactNode }) {
  const [build, setBuild] = useState<Build | null>(null)
  const [end, setEnd] = useState<End>(null)
  const [woke, setWoke] = useState(false)
  const [lines, setLines] = useState<string[]>([])
  const [readerSeen, setReaderSeen] = useState(false)
  const [silent, setSilent] = useState(false)

  useEffect(() => {
    if (!active || !terminalWords || build) return
    let stop = false
    const tick = async () => { const b = await detect(); if (!stop && b) setBuild(b) }
    void tick()
    const t = setInterval(() => void tick(), 2000)
    return () => { stop = true; clearInterval(t) }
  }, [active, build, terminalWords])

  // Голая сборка: строки чтеца, конец — чтец ушёл, а ядро отвечает.
  useEffect(() => {
    if (build?.mode !== "bare" || end) return
    let stop = false
    const t = setInterval(async () => {
      const r = await json<{ lines?: string[] }>(READER, 2500)
      if (stop) return
      if (r) { setReaderSeen(true); setSilent(false); if (r.lines?.length) setLines(r.lines); return }
      const u = await json<{ update: Rec | null }>(kitDoor("/api/node/update?tail=1"))
      if (stop) return
      if (!u) { setSilent(silenceVerdict({ since: build.since, readerSeen }) === "silent"); return }
      // Ядро ответило: итог — у записи, которая шла, когда ядро замолчало (кнопка «Развернуть ядро», обновление); нет такой — «ядро снова отвечает».
      const d = await json<{ core?: { deploy: Rec | null } }>(kitDoor("/api/node/deploy?progress=1&core=1"))
      // ✗ Снято наблюдателем 2026-11-07: ядро отвечает раньше, чем сборка пишет итог (сначала возвращаются агенты) — запись ещё «running»,
      // и страница говорила «ядро снова отвечает» вместо вердикта. Идущая запись — ждать её итога.
      const covers = (x?: Rec | null) => Boolean(x && Date.parse(x.startedAt ?? "") <= build.since && (x.state === "running" || Date.parse(x.finishedAt ?? "") >= build.since - 5000))
      const rec = [u.update, d?.core?.deploy].find(covers)
      if (stop || rec?.state === "running") return
      setEnd(rec?.state === "done" ? "done" : rec ? "failed" : "back")
    }, 1500)
    return () => { stop = true; clearInterval(t) }
  }, [build, end, readerSeen])

  // После удачной сборки: главный агент, которого сборка остановила, возвращается сам (675-1) — подключиться к нему.
  useEffect(() => {
    if (end !== "done" && end !== "back") return
    let n = 0
    const t = setInterval(async () => {
      const s = await json<{ running?: boolean }>(sessionUrl)
      if (s?.running) { clearInterval(t); setWoke(true); window.setTimeout(() => window.location.reload(), 2000) }
      if (++n >= 40) clearInterval(t)
    }, 1500)
    return () => clearInterval(t)
  }, [end, sessionUrl])

  if (!build || !terminalWords) return <>{children}</>
  const close = () => window.location.reload()
  const closeAndStart = () => {
    const url = new URL(window.location.href)
    url.searchParams.set("start", "1")
    window.location.assign(url.toString())
  }
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/40 p-5" data-block="core-build-watch" data-core-build={end ?? (silent ? "silent" : "running")}>
      <div data-block="chf2m" className="flex items-center gap-2 font-medium text-sm">
        <Hammer className="size-4" aria-hidden />
        {end ? words.buildEnded : silent ? words.coreSilent : words.buildRunning}
      </div>
      {!end && <p data-block="ly52x" className="text-muted-foreground text-sm">{silent ? words.coreSilentText : words.buildNoStart}</p>}
      {build.mode === "bare"
        ? <LiveLog title={end === "done" ? terminalWords.done : end === "failed" ? terminalWords.failed : end ? words.buildBack : lines.length ? terminalWords.building : words.buildSilent} lines={lines.length ? lines : ["…"]} done={Boolean(end)} failed={end === "failed"} />
        : <CoreTerminal words={terminalWords} mode={build.mode} since={build.since} noReload onEnd={setEnd} />}
      {woke && <p data-block="pbw46" className="text-sm" data-core-build-woke>{words.buildWoke}</p>}
      {end && !woke && (
        <div data-block="skr8x" className="flex flex-wrap gap-2">
          {end !== "failed" && (
            <Button onClick={closeAndStart} type="button" data-core-build-start>
              <Play className="size-4" aria-hidden />
              {words.buildCloseStart}
            </Button>
          )}
          <Button onClick={close} type="button" variant="outline" data-core-build-close>
            <X className="size-4" aria-hidden />
            {words.buildClose}
          </Button>
        </div>
      )}
    </div>
  )
}
