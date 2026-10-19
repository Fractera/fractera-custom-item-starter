import { landingWords } from "./words"

// ТЕКСТ ЛЕНДИНГА ДЛЯ МАШИН (узел, шаг 428). Сборщик markdown-копии страницы (`lib/aio/surfaces.ts` → `/<язык>/index.md`,
// `llms-full.txt`) зовёт эту функцию на блоке `widget-static-landing-agent`. Источник тот же, что рисует виджет, — `landingWords`
// (данные главной, поле `landing`): поправили слова — изменились обе формы страницы.
// Здесь только поле `landing`: заголовок, «что умеет» и «под капотом» — обычные блоки страницы, их пишет сборщик сам.
// 🔒 Только слова из данных — ни одной своей подписи: английская подпись на русской странице — чужой язык для машины (шаг 507).

export function markdown(lang: string): string {
  const w = landingWords(lang)
  if (!w) return ""
  const x = w.x
  const out: string[] = []
  const para = (...t: (string | undefined)[]) => {
    for (const s of t) if (s && s.trim()) out.push(s.trim(), "")
  }
  const list = (items: (string | undefined)[]) => {
    const rows = items.filter((s): s is string => !!s && !!s.trim())
    if (rows.length) out.push(...rows.map((s) => `- ${s.trim()}`), "")
  }
  const head = (level: 2 | 3, t?: string) => {
    if (t && t.trim()) out.push(`${"#".repeat(level)} ${t.trim()}`, "")
  }
  const qa = (q?: string, a?: string) => {
    if (q && a) out.push(`### ${q.trim()}`, "", a.trim(), "")
  }

  // Первый экран: приглашение, подсказка к нему, указатель к чату.
  para(x.titleSub)
  qa(x.titleSubHintLabel, x.titleSubHint)
  if (x.gate) {
    list(x.gate.routes)
    qa(x.gate.ask, x.gate.answer)
  }

  // Чат-пример: кто что сказал, по порядку.
  if (x.chat?.items?.length) {
    head(2, x.chat.label)
    for (const m of x.chat.items) {
      if (m.text) out.push(`**${m.who}:** ${m.text.trim()}`, "")
      if (m.steps?.length) list(m.steps)
      if (m.checks?.length) list(m.checks)
    }
    if (x.chat.endCta) out.push(`[${x.chat.endCta.label}](${x.chat.endCta.href})`, "")
  }

  head(2, x.claim)
  qa(x.claimHintLabel, x.claimHint)

  if (x.waiting) {
    head(2, x.waiting.title)
    para(x.waiting.text)
  }

  list(x.cards)

  if (x.ticket) {
    head(2, x.ticket.kicker)
    list(x.ticket.fields.map((f) => `${f.label}: ${f.value}`))
    para(x.ticket.keep)
  }

  list(x.chips)

  if (x.compare) {
    head(2, x.compare.title)
    if (x.compare.sub) para(x.compare.sub)
    for (const side of [x.compare.left, x.compare.right]) {
      head(3, side.who ? `${side.who} — ${side.label}` : side.label)
      para(side.text)
      list(side.items.map((i) => (i.tag ? `**${i.tag}** ${i.text}` : i.text)))
    }
  }

  if (x.helpDesk) {
    const d = x.helpDesk
    head(2, d.title)
    para(d.greeting)
    d.questions.forEach((q, i) => qa(q, d.answers[i]))
    qa(d.departure?.question, d.departure?.answer)
    qa(d.transfer?.question, d.transfer?.answer)
    if (d.github?.href) out.push(`[${d.github.label}](${d.github.href})`, "")
  }

  if (x.outcomes?.length) {
    head(2, x.outcomesLabel)
    list(x.outcomes.map((o) => `**${o.name}** — ${o.text}`))
  }

  head(2, x.closingTitle)
  para(x.closingText)
  if (x.routeBuilt) {
    const r = x.routeBuilt
    head(3, r.title)
    list([`${r.from.label}: ${r.from.station}`, r.via ? `${r.via.label}: ${r.via.station}` : undefined, `${r.to.label}: ${r.to.station}`])
  }

  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim()
}
