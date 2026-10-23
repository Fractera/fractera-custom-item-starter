"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowRight, UserRound } from "lucide-react"
import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ai-elements/conversation"
import { Message, MessageContent } from "@/components/ai-elements/message"
import { Shimmer } from "@/components/ai-elements/shimmer"
import { ChainOfThought, ChainOfThoughtContent, ChainOfThoughtHeader, ChainOfThoughtStep } from "@/components/ai-elements/chain-of-thought"
import { Tool, ToolContent, ToolHeader, ToolInput, ToolOutput } from "@/components/ai-elements/tool"
import { Task, TaskContent, TaskItem, TaskTrigger } from "@/components/ai-elements/task"
import { Confirmation, ConfirmationAccepted, ConfirmationTitle } from "@/components/ai-elements/confirmation"
import { Attachment, AttachmentInfo, AttachmentPreview, Attachments } from "@/components/ai-elements/attachments"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import base from "./landing-agent.module.css"

// ИМИТАЦИЯ ЧАТА АГЕНТОВ НА ПЕРВОМ ЭКРАНЕ (шаг 333-12). Слово владельца: «имитацию чата между агентами, которые создают
// приложения … слева агент-регистратор, справа ему отвечают люди и агенты людей … как стрим»; «используй как можно больше
// элементов из ui elements, всегда отмечай в каком контракте идёт a2a, m2m, h2a … аватарку человека в виде иконки».
// Собрано из AI Elements: Conversation, Message, Shimmer, Chain of Thought, Tool, Task, Confirmation (Message — облегчённый,
// без streamdown, выбор владельца), метки контракта — Badge, человек — Avatar со значком. Шрифт — как код в Telegram, цвет —
// роль «плакат». Только широкий экран, без градиента.
// 🔒 СТАТИКА ЦЕЛА: сервер отдаёт весь разговор; островок, увидев чат на экране, проигрывает его заново — по одной реплике,
// с «печатает…» перед каждой. Ушёл с экрана — пауза, вернулся — продолжает. При «уменьшить движение» разговор стоит целиком.
// 🔒 КОНЕЦ — ОСТАНОВКА, НЕ ПОВТОР (слово владельца, 333-17: «исчезает автоматически в конце … даже не могу прочитать»):
// после последней реплики разговор стоит, прокручен до конца, под ним — кнопка `endCta`. Реплики `side: "system"` — не
// левые и не правые: уведомление системы по центру (штамп в ленте), без аватара и без «печатает…».

type Contract = "a2a" | "h2a" | "m2m" | "h2m" | "h2h"
type Item = {
  side: "left" | "right" | "system"
  who: string
  text: string
  contract: Contract
  kind?: "thinking" | "tool" | "confirm" | "task"
  title?: string
  steps?: string[]
  checks?: string[]
  tool?: string
  input?: unknown
  output?: unknown
  accepted?: string
  /** 346 (слово владельца: «покажи … как будто она загрузила изображения и … документ»): вложения реплики — AI Elements
   *  `Attachments`, вид `list`; файлов нет (это визуализация), поэтому у картинки — значок, а не выдуманное фото. */
  attachments?: { filename: string; mediaType: string }[]
}

/** Классы, которые страница может заменить своими («Дизайн агента», `_widgets/static/widget-static-landing-agent/`); без них — вид главной. */
export type AgentChatClass =
  | "chat" | "chatHead" | "chatDot" | "chatLog" | "chatContent" | "chatMsg" | "msgMeta" | "msgMetaRight" | "msgWho"
  | "msgAvatar" | "contract" | "msgText" | "msgTextRight" | "aeBlock" | "typing" | "typingRight"
  | "system" | "systemStamp" | "systemBadge" | "endCta"
type Classes = Record<AgentChatClass, string>

// 346: настоящие ссылки в репликах (скачать Claude, форк на GitHub) — кликабельны; вымышленные адреса Анны (временный адрес
// Cloudflare, её домен) остаются текстом: мёртвая ссылка на публичной странице хуже никакой.
const LINK_HOSTS = ["claude.com", "github.com"]
function Linked({ text }: { text: string }) {
  const parts = text.split(/(https:\/\/[^\s,)]+)/g)
  return <>{parts.map((p, i) => {
    if (!p.startsWith("https://")) return p
    const url = p.replace(/[.;:]+$/, "")
    const tail = p.slice(url.length)
    let host = ""
    try { host = new URL(url).hostname.replace(/^www\./, "") } catch { /* не адрес */ }
    return LINK_HOSTS.includes(host)
      ? <span key={i}><a href={url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">{url.replace("https://", "")}</a>{tail}</span>
      : p
  })}</>
}

// Темп на 33 реплики: «печатает…» короче, чтение — по длине реплики (блок AI Elements — дольше), системное — сразу.
const TYPING_MS = 900
const SYSTEM_MS = 500

function readMs(item: Item): number {
  return Math.min(2800, 900 + item.text.length * 14) + (item.kind ? 700 : 0)
}

function isHuman(item: Item): boolean {
  // 333-21: человек пишет по любому протоколу «h2…» (h2a своему агенту, h2m внешнему, h2h человеку) — у него аватар.
  return item.contract.startsWith("h2") && item.side === "right"
}

function Extra({ item, s }: { item: Item; s: Classes }) {
  if (item.kind === "thinking" && item.steps) {
    return (
      <ChainOfThought defaultOpen className={s.aeBlock}>
        <ChainOfThoughtHeader>{item.title}</ChainOfThoughtHeader>
        <ChainOfThoughtContent>
          {item.steps.map((st, i) => <ChainOfThoughtStep key={i} label={st} status="complete" />)}
        </ChainOfThoughtContent>
      </ChainOfThought>
    )
  }
  if (item.kind === "tool" && item.tool) {
    return (
      <Tool defaultOpen className={s.aeBlock}>
        <ToolHeader type={`tool-${item.tool}` as `tool-${string}`} state="output-available" />
        <ToolContent>
          <ToolInput input={item.input} />
          <ToolOutput output={item.output} errorText={undefined} />
        </ToolContent>
      </Tool>
    )
  }
  if (item.kind === "confirm" && item.title) {
    return (
      <Confirmation approval={{ id: "sign", approved: true }} state="approval-responded" className={s.aeBlock}>
        <ConfirmationTitle>{item.title}</ConfirmationTitle>
        <ConfirmationAccepted>
          <span>{item.accepted}</span>
        </ConfirmationAccepted>
      </Confirmation>
    )
  }
  if (item.kind === "task" && item.checks) {
    return (
      <Task defaultOpen className={s.aeBlock}>
        <TaskTrigger title={item.title ?? ""} />
        <TaskContent>
          {item.checks.map((c, i) => <TaskItem key={i}>{c}</TaskItem>)}
        </TaskContent>
      </Task>
    )
  }
  return null
}

export function AgentChat({ label, items, contractLabels, endCta, classes }: {
  label: string
  items: Item[]
  contractLabels: Record<Contract, string>
  endCta?: { label: string; href: string }
  classes?: Partial<Classes>
}) {
  const s: Classes = { ...(base as Classes), ...classes }
  const box = useRef<HTMLDivElement>(null)
  // `null` — ещё не запускались: показан весь разговор, как его отдал сервер.
  const [shown, setShown] = useState<{ count: number; typing: boolean } | null>(null)
  const visible = useRef(false)

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const el = box.current
    if (!el) return
    let timer: ReturnType<typeof setTimeout> | null = null
    let state = { count: 0, typing: true }

    const tick = () => {
      if (!visible.current) return
      // Последняя реплика показана — стоим. Повтора нет: разговор остаётся на экране для чтения.
      if (state.count >= items.length || (state.count === items.length - 1 && !state.typing)) return
      if (state.typing) {
        const wait = items[state.count].side === "system" ? SYSTEM_MS : TYPING_MS
        timer = setTimeout(() => { state = { count: state.count, typing: false }; setShown(state); tick() }, wait)
      } else {
        timer = setTimeout(() => { state = { count: state.count + 1, typing: true }; setShown(state); tick() }, readMs(items[state.count]))
      }
    }

    const io = new IntersectionObserver(([e]) => {
      visible.current = e.isIntersecting
      if (timer) { clearTimeout(timer); timer = null }
      if (e.isIntersecting) { setShown(state); tick() }
    }, { threshold: 0.35 })
    io.observe(el)
    return () => { io.disconnect(); if (timer) clearTimeout(timer) }
  }, [items])

  const count = shown === null ? items.length : shown.count + (shown.typing ? 0 : 1)
  const list = items.slice(0, count)
  const typingItem = shown !== null && shown.typing && items[shown.count]?.side !== "system" ? items[shown.count] : null
  const done = count >= items.length

  return (
    <div data-block="fh1tp" ref={box} className={s.chat} aria-label={label}>
      <p data-block="j8uli" className={s.chatHead}>
        <span className={s.chatDot} aria-hidden="true" />
        {label}
      </p>
      <Conversation className={s.chatLog}>
        <ConversationContent className={s.chatContent}>
          {list.map((m, i) => m.side === "system" ? (
            <div data-block="t647q" key={i} className={s.system}>
              <p data-block="j2lc9" className={s.systemStamp}>
                <span className={s.systemBadge} title={contractLabels[m.contract]}>{`${m.who} · ${m.contract}`}</span>
                <span><Linked text={m.text} /></span>
              </p>
            </div>
          ) : (
            <Message key={i} from={m.side === "right" ? "user" : "assistant"} className={s.chatMsg}>
              <div data-block="tvc5g" className={m.side === "right" ? s.msgMetaRight : s.msgMeta}>
                {isHuman(m) && (
                  <Avatar className={s.msgAvatar}>
                    <AvatarFallback><UserRound className="size-3.5" aria-hidden="true" /></AvatarFallback>
                  </Avatar>
                )}
                <span className={s.msgWho}>{m.who}</span>
                <Badge data-block="gz8av" variant="outline" className={s.contract} title={contractLabels[m.contract]}>{m.contract}</Badge>
              </div>
              <MessageContent className={m.side === "right" ? s.msgTextRight : s.msgText}><Linked text={m.text} /></MessageContent>
              {m.attachments && m.attachments.length > 0 && (
                <Attachments variant="list" className={m.side === "right" ? "ml-auto w-fit" : "w-fit"}>
                  {m.attachments.map((a, k) => (
                    <Attachment key={k} data={{ id: `${i}-${k}`, type: "file", mediaType: a.mediaType, filename: a.filename, url: "" }}>
                      <AttachmentPreview />
                      <AttachmentInfo showMediaType />
                    </Attachment>
                  ))}
                </Attachments>
              )}
              <Extra item={m} s={s} />
            </Message>
          ))}
          {typingItem && (
            <div data-block="y2bup" className={typingItem.side === "right" ? s.typingRight : s.typing}>
              <Shimmer as="span" duration={1.4}>{`${typingItem.who} …`}</Shimmer>
            </div>
          )}
          {done && endCta && (
            <a href={endCta.href} className={s.endCta}>
              {endCta.label}
              <ArrowRight className="size-4" strokeWidth={2} aria-hidden="true" />
            </a>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
    </div>
  )
}
