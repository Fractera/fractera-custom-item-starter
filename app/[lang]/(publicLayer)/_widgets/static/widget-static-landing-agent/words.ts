import { branchRoot } from "@/lib/page-tree"

// СЛОВА ЛЕНДИНГА — ОДНА КОПИЯ НА ТРИ ОФОРМЛЕНИЯ (330-4, 330-5). Главная (`landing`), «Дизайн 1» (`landing-taste`) и
// «Дизайн 2» (`landing-impeccable`) рисуют одно и то же задание по-разному: слова каждого берутся отсюда, из данных главной
// `(publicLayer)/_data/<язык>.json`. Блоки несут общий текст (его же читают агенты через `index.md`), поле `landing` — то,
// чего у блоков нет.

export type Link = { label: string; href: string }
type Block = { kind: string; id?: string; title?: string; text?: string; pill?: string; description?: string; cta?: Link; secondary?: Link }

export type LandingExtra = {
  titleSub: string
  /** Подсказка [?] к подзаголовку (слово владельца 2026-09-30: «add [?] … like in От идеи до enterprise-продукта»); абзацы — через пустую строку. */
  titleSubHint?: string
  titleSubHintLabel?: string
  /** Указатель к чату под первым экраном (владелец 2026-09-30: табло прохода к гейтам в аэропорту). */
  gate?: { routes: string[]; ask: string; answer: string; answerMobile: string; label: string; longWay?: string; exitTime?: string }
  /** Слова заголовка, выделенные эмалевой плашкой (слово владельца 2026-09-29: «ты приглашен»); нет — заголовок без плашки. */
  titleMark?: string
  claim: string
  claimHint: string
  claimHintLabel: string
  cards: string[]
  chips: string[]
  /** Секция «Fractera vs LLM» (владелец 2026-09-30): два табло — пеший маршрут и магистраль; станций карты ровно четыре. */
  compare?: {
    title: string
    sub?: string
    left: { who: string; label: string; text: string; stations: [string, string]; deadEnd: string; products?: { name: string; icon: "chat" | "code" | "cowork" | "platform" }[]; items: { tag: string; text: string }[] }
    right: { who: string; label: string; text: string; hub: string; here?: string; stations: [string, string, string, string]; ring?: { name: string; stations: string[]; free: string[] }; items: { tag: string; text: string }[] }
    mapLabel: string
  }
  /** Билет «под капотом» (владелец 2026-09-30): шапка, поля посадочного, корешок «сохраняется до конца поездки». */
  ticket?: { kicker: string; serial: string; fields: { label: string; value: string }[]; keep: string; stamp?: { top: string; bottom: string } }
  /** Финал (владелец 2026-09-30): «назначение маршрута» у последней секции и отдельная строка «Маршрут построен» в самом конце. */
  route?: { label: string; value: string }
  /** Справочное бюро (узел, шаг 348): киоск с чатом и вывесками вопросов. */
  helpDesk?: { title: string; hours: string; greeting: string; who: string; you: string; placeholder: string; send: string; mic: string; questions: string[]; answers: string[]; departure: { label: string; question: string; answer: string }; transfer: { label: string; question: string; answer: string }; github: { label: string; href: string }; thinking: string; limit: string; closed: string }
  routeBuilt?: { title: string; from: { label: string; station: string }; via?: { label: string; station: string; go?: { label: string; aria: string } }; to: { label: string; station: string } }
  /** Зал ожидания (владелец 2026-10-01): кресло, окно с драпировкой, ламповый телевизор; слова кнопки и описание сцены. */
  waiting?: { title: string; text: string; scene: string; tv: string; on: string; off: string }
  closingTitle: string
  closingText: string
  closingImage?: { src: string; alt: string }
  short: string
  outcomesLabel: string
  outcomes: { name: string; text: string }[]
  chat?: {
    label: string
    contractLabels: Record<"a2a" | "h2a" | "m2m" | "h2m" | "h2h", string>
    items: {
      side: "left" | "right" | "system"; who: string; text: string; contract: "a2a" | "h2a" | "m2m" | "h2m" | "h2h"
      kind?: "thinking" | "tool" | "confirm" | "task"; title?: string; steps?: string[]; checks?: string[]
      tool?: string; input?: unknown; output?: unknown; accepted?: string; attachments?: { filename: string; mediaType: string }[]
    }[]
    endCta?: Link
  }
  board: {
    from: string
    fromValue: string
    destination: string
    platform: string
    departs: string
    when: string
    connections: string
    included: string
    closing: string
  }
}

export type LandingWords = {
  hero: { pill?: string; title: string; description: string; cta?: Link; secondary?: Link }
  can: { title: string; texts: string[] }
  hood: { title: string; texts: string[] }
  x: LandingExtra
}

function section(blocks: Block[], id: string): { title: string; texts: string[] } {
  const at = blocks.findIndex((b) => b.kind === "block-section-head" && b.id === id)
  if (at < 0) return { title: "", texts: [] }
  const texts: string[] = []
  for (const b of blocks.slice(at + 1)) {
    if (b.kind !== "text-p") break
    texts.push(b.text ?? "")
  }
  return { title: blocks[at].title ?? "", texts }
}

/** Слова лендинга на языке `lang`; нет данных — `null` (виджет не рисует ничего, страница не падает). */
export function landingWords(lang: string): LandingWords | null {
  const root = branchRoot("(publicLayer)")
  const words = {
    ...(root?.en as { blocks?: Block[]; landing?: LandingExtra } | undefined),
    ...(root?.overrides[lang] as { blocks?: Block[]; landing?: LandingExtra } | undefined),
  }
  const blocks = words.blocks ?? []
  const hero = blocks.find((b) => b.kind === "block-hero-centered")
  if (!hero || !words.landing) return null
  return {
    hero: { pill: hero.pill, title: hero.title ?? "", description: hero.description ?? "", cta: hero.cta, secondary: hero.secondary },
    can: section(blocks, "what-it-can-do"),
    hood: section(blocks, "under-the-hood"),
    x: words.landing,
  }
}
