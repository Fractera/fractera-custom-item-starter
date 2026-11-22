"use client"

import { kitApi, kitSocket } from "./kit-place"
import { useCallback, useEffect, useRef, useState } from "react"
import { ForbiddenWithExit } from "@/components/node-state/open-on-this-computer.client"
import { Check, CircleAlert, Copy, ExternalLink, KeyRound, RotateCw, X } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { AppDialog } from "@/components/dialog/app-dialog.client"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import type { ClaudeSubscriptionWords } from "../words/claude-subscription.i18n"
import { createMouseFilter, MOUSE_OFF } from "./mouse-filter.mjs"
import { extractAuthUrl } from "./terminal-auth.mjs"
import { type XtermHandle, XtermTerminal } from "./xterm-terminal.client"

// ПОДПИСКА CLAUDE CODE: СОСТОЯНИЕ ВХОДА И САМ ВХОД (267-2).
//
// Перенос `fractera-memory-starter/app/[lang]/terminal/_components/terminal-panel.client.tsx` и
// `auth-flow-modal.client.tsx`, с одним отличием по устройству: в памяти страница СРАЗУ открывала терминал
// в режиме проверки. Здесь состояние сперва спрашивается дверью `/api/terminal/claude-auth` — без оболочки,
// без процесса, — а терминал входа рождается только кнопкой. Слово владельца о мастерской памяти: «до того
// как она будет запущена она не должна расходовать ресурсы компьютера».
//
// 🔒 ССЫЛКУ ИЩЕМ В СЫРОМ ПОТОКЕ (`terminal-auth.mjs`): Claude Code печатает её гиперссылкой OSC-8 или
// текстом, разорванным переносами, — поэтому разбор ждёт паузу в потоке, а не первый кусок.
// 🔒 ПОСЛЕ КОДА СОСТОЯНИЕ СПРАШИВАЕТСЯ ЗАНОВО, А НЕ ОБЪЯВЛЯЕТСЯ: «код отправлен» не значит «вошли».

// 🔒 ДВЕРИ И СОКЕТ — В МАРШРУТЕ СЛУЖБЫ (271): `/{lang}/architect/<служба>/agent-api/*` и `/pty/<служба>`.

const BUFFER_LIMIT = 8000
const DETECT_DELAY_MS = 300

// 689: `own` — элемент на подписке своего человека (своя папка Claude Code); тогда и почта, и лимит — его.
// 833-3: `walledNone` — on a server this element has no account of its own, and the node's login is never its login.
type Auth = { loggedIn: boolean | null; email: string | null; plan: string | null; own?: boolean; walledNone?: boolean }

export function ClaudeSubscription({ service, lang, words }: { service: string; lang: string; words: ClaudeSubscriptionWords }) {
  const api = kitApi(lang, service)
  const [auth, setAuth] = useState<Auth | "checking" | "forbidden">("checking")
  const [open, setOpen] = useState(false)
  const [authUrl, setAuthUrl] = useState<string | null>(null)
  const termRef = useRef<XtermHandle>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const bufRef = useRef("")
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const modalRef = useRef(false)
  const sizeRef = useRef({ cols: 100, rows: 24 })
  const mouseRef = useRef(createMouseFilter())

  const check = useCallback(async () => {
    setAuth("checking")
    try {
      const res = await fetch(`${api}/claude-auth`, { cache: "no-store" })
      if (res.status === 401 || res.status === 403) return setAuth("forbidden")
      const d = (await res.json()) as Auth
      setAuth({ loggedIn: d.loggedIn ?? null, email: d.email ?? null, plan: d.plan ?? null, own: d.own === true, walledNone: d.walledNone === true })
    } catch {
      setAuth({ loggedIn: null, email: null, plan: null })
    }
  }, [api])

  useEffect(() => {
    check()
    // 689: переключатель «чья подписка» (`claude-own-login.client.tsx`) просит проверить вход заново — без таймера, по событию.
    window.addEventListener("claude-own-changed", check)
    return () => window.removeEventListener("claude-own-changed", check)
  }, [check])

  const send = useCallback((payload: unknown) => {
    const ws = wsRef.current
    if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(payload))
  }, [])

  const scan = useCallback(() => {
    if (modalRef.current) return
    const found = extractAuthUrl(bufRef.current)
    if (found) {
      modalRef.current = true
      setAuthUrl(found.url)
    }
  }, [])

  const closeTerminal = useCallback(() => {
    wsRef.current?.close()
    wsRef.current = null
    setOpen(false)
    setAuthUrl(null)
    modalRef.current = false
    bufRef.current = ""
    startingRef.current = false
    setStarting(false)
    check()
  }, [check])

  // 🛑 ОДНО НАЖАТИЕ — ОДИН ВХОД. ✗ Оплачено владельцем 2026-09-22: «нажимаю на кнопку ничего не меняется я
  // ещё раз нажимаю… а потом сразу открывается много вкладок на авторизацию». Кнопка оставалась живой,
  // пока шёл запрос билета, и каждое нажатие рождало свой `claude auth login` — а тот на этой машине сам
  // открывает вкладку в браузере. Отсюда два замка: ref отсекает повтор мгновенно (состояние React
  // обновится только к следующей отрисовке), а `starting` показывает, что нажатие принято.
  const startingRef = useRef(false)
  const [starting, setStarting] = useState(false)

  const startLogin = useCallback(async () => {
    if (startingRef.current || wsRef.current) return
    startingRef.current = true
    setStarting(true)
    let ticket = ""
    let socketUrl: string | null = null
    try {
      const res = await fetch(`${api}/ticket`, { method: "POST" })
      if (res.status === 401 || res.status === 403) {
        startingRef.current = false
        setStarting(false)
        return setAuth("forbidden")
      }
      const issued = (await res.json()) as { ticket?: string; socket?: string }
      ticket = issued.ticket ?? ""
      socketUrl = issued.socket ?? null
    } catch {
      startingRef.current = false
      setStarting(false)
      return
    }
    setOpen(true)
    bufRef.current = ""
    modalRef.current = false
    const ws = new WebSocket(kitSocket(service, socketUrl))
    wsRef.current = ws
    ws.onopen = () => {
      // 🛑 `init` ПЕРВЫМ ДЕЙСТВИЕМ — см. островок терминала.
      ws.send(JSON.stringify({ mode: "login", ticket, type: "init" }))
      ws.send(JSON.stringify({ type: "resize", ...sizeRef.current }))
      mouseRef.current = createMouseFilter()
      termRef.current?.reset()
      termRef.current?.write(MOUSE_OFF)
      termRef.current?.focus()
    }
    ws.onmessage = (event) => {
      const chunk = typeof event.data === "string" ? event.data : new TextDecoder().decode(event.data)
      termRef.current?.write(mouseRef.current(chunk))
      bufRef.current = (bufRef.current + chunk).slice(-BUFFER_LIMIT)
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(scan, DETECT_DELAY_MS)
    }
    // Отказ моста (вход уже идёт в другой вкладке и т. п.) называется в самом терминале, а не оставляет
    // пустой чёрный прямоугольник.
    ws.onclose = (event) => {
      if (wsRef.current === ws) wsRef.current = null
      if (event.reason) termRef.current?.write(`\r\n[${event.reason}]\r\n`)
    }
  }, [api, scan, service])

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      wsRef.current?.close()
    },
    [],
  )

  const handleData = useCallback((data: string) => send({ data, type: "stdin" }), [send])
  const handleResize = useCallback(
    (size: { cols: number; rows: number }) => {
      sizeRef.current = size
      send({ type: "resize", ...size })
    },
    [send],
  )

  if (auth === "forbidden") return <ForbiddenWithExit reason={words.forbidden} why={words.exitWhy} open={words.exitOpen} />

  const state = auth === "checking" ? null : auth
  const on = state?.loggedIn === true
  const unknown = state !== null && state.loggedIn === null
  const walledNone = state?.walledNone === true

  return (
    <div data-block="tn46c" className="my-6 flex flex-col gap-3" data-claude-subscription data-state={auth === "checking" ? "checking" : on ? "on" : unknown ? "unknown" : "off"}>
      <div data-block="enet0" className="rounded-lg border border-border bg-card p-4">
        {auth === "checking" ? (
          <p data-block="q9cen" className="text-muted-foreground text-sm">{words.checking}</p>
        ) : (
          <>
            <p data-block="vcyqo" className={cn("flex items-center gap-2 font-medium text-sm", walledNone && "text-destructive")} data-claude-walled={walledNone ? "none" : undefined}>
              {on ? <Check className="size-4 shrink-0" aria-hidden /> : <CircleAlert className="size-4 shrink-0" aria-hidden />}
              {on ? words.onTitle : walledNone ? words.walledTitle : unknown ? words.unknownTitle : words.offTitle}
            </p>
            <p data-block="ri9tu" className="mt-1 text-muted-foreground text-sm">
              {walledNone ? words.walledText : on
                ? (state?.own ? words.ownOnText : words.onText).replace("{email}", state?.email ?? "—").replace("{plan}", state?.plan ?? "—")
                : unknown
                  ? words.unknownText
                  : words.offText}
            </p>
            <div data-block="mc8wn" className="mt-3 flex flex-wrap gap-2">
              {!open && !walledNone && (
                <Button type="button" onClick={startLogin} disabled={starting} aria-busy={starting} variant={on ? "outline" : "default"} data-claude-login>
                  {starting ? <Spinner className="size-4" /> : <KeyRound className="size-4" aria-hidden />}
                  {starting ? words.starting : on ? words.relogin : words.login}
                </Button>
              )}
              <Button type="button" variant="ghost" onClick={check}>
                <RotateCw className="size-4" aria-hidden />
                {words.recheck}
              </Button>
            </div>
          </>
        )}
      </div>

      <p data-block="da9nc" className="text-muted-foreground text-xs">{state?.own ? words.ownQuota : words.quota}</p>

      {open && (
        <div data-block="uo9pj" className="flex flex-col gap-2">
          <div data-block="ja4m0" className="flex items-center gap-2">
            <p data-block="l5ooo" className="flex-1 text-muted-foreground text-xs">{words.terminalNote}</p>
            <Button type="button" size="sm" variant="outline" onClick={closeTerminal}>
              <X className="size-4" aria-hidden />
              {words.close}
            </Button>
          </div>
          <div data-block="kukcu" className="h-[45dvh] min-h-[320px] overflow-hidden rounded-lg bg-[#0b0b0c] p-2">
            <XtermTerminal onData={handleData} onResize={handleResize} ref={termRef} />
          </div>
        </div>
      )}

      {authUrl && (
        <AuthModal
          url={authUrl}
          words={words}
          onClose={() => {
            modalRef.current = false
            setAuthUrl(null)
            bufRef.current = ""
          }}
          onSend={(code) => {
            send({ data: `${code}\r`, type: "stdin" })
            // Вход проверяется у самого `claude`, когда он успел записать учётку.
            setTimeout(check, 4000)
          }}
        />
      )}
    </div>
  )
}

function AuthModal({
  url,
  words,
  onClose,
  onSend,
}: {
  url: string
  words: ClaudeSubscriptionWords
  onClose: () => void
  onSend: (code: string) => void
}) {
  const [copied, setCopied] = useState(false)
  const [code, setCode] = useState("")
  const [sent, setSent] = useState(false)

  const submit = () => {
    const v = code.trim()
    if (!v) return
    onSend(v)
    setSent(true)
    setTimeout(onClose, 1200)
  }

  // 🔒 ОКНО ПРОДУКТА ОДНО — `AppDialog` (сторож `check:dialogs`): у примитива нет предела высоты и
  // прокручиваемого тела, и длинная ссылка вытолкнула бы поле кода за край экрана.
  return (
    <AppDialog
      open
      onOpenChange={(o) => !o && onClose()}
      size="md"
      ui={{ close: words.close }}
      titleClassName="flex items-center gap-2"
      title={<><KeyRound className="size-4 shrink-0" aria-hidden /> {words.modalTitle}</>}
      description={words.modalText}
      footer={
        <div data-block="dprzv" className="flex w-full flex-col gap-2">
          <Input
            autoComplete="off"
            disabled={sent}
            value={code}
            placeholder={words.codePlaceholder}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
          <Button type="button" className="w-full" disabled={sent || !code.trim()} onClick={submit}>
            {sent ? words.codeSent : words.sendCode}
          </Button>
        </div>
      }
    >
      <div data-block="wb4kk" className="flex flex-col gap-3">
        <div data-block="qi4rh" className="max-h-[110px] select-text overflow-y-auto break-all rounded-lg border border-border bg-muted/50 px-3 py-2 font-mono text-xs">
          {url}
        </div>
        <div data-block="ytj2f" className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(url)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              } catch {
                /* буфер закрыт политикой браузера — ссылка видна и выделяется */
              }
            }}
          >
            {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
            {copied ? words.copied : words.copyLink}
          </Button>
          {/* Ссылка, а не кнопка-обёртка: `Button` узла не умеет `asChild`. */}
          <a href={url} target="_blank" rel="noopener noreferrer" className={buttonVariants({ size: "sm", variant: "outline" })}>
            <ExternalLink className="size-4" aria-hidden />
            {words.openLink}
          </a>
        </div>
      </div>
    </AppDialog>
  )
}
