// @api the product quiz's depth and automation, set from the Mini App
import { readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { NextRequest, NextResponse } from "next/server"
import { elementRoot } from "@/lib/page-tree"
import { DEPTH, FREEDOM, flatten } from "@/scripts/quiz-tree.mjs"
import { adminOfMiniApp } from "../../_libs/admin-only"
import { QUIZ_FILE } from "../../_libs/quiz"

// ГЛУБИНА И АВТОМАТИЗАЦИЯ КВИЗА ИЗ МИНИ-ПРИЛОЖЕНИЯ (шаг ядра 852-7; Рома, Telegram 1299: «там же мы регулируем глубину … уровень
// автоматизации»). POST `{ depth?: 1–5, freedom?: 0–100 }` → только эти два поля `development-docs/product/quiz.json`; дерево не
// трогается. Глубина мельче уже пройденного уровня — 409 `shallow` (дерево стало бы неверным для `quiz-tree.mjs`). Агент читает файл
// на следующем ходу и коммитит его с ходом квиза (навык product-quiz).
export const dynamic = "force-dynamic"

const NO_STORE = { "Cache-Control": "no-store" }
const whole = (v: unknown, min: number, max: number) => (typeof v === "number" && Number.isInteger(v) && v >= min && v <= max ? v : null)

export async function POST(req: NextRequest) {
  const who = await adminOfMiniApp(req)
  if (who !== 200) return NextResponse.json({ ok: false }, { status: who, headers: NO_STORE })
  let body: { depth?: unknown; freedom?: unknown }
  try { body = await req.json() } catch { return NextResponse.json({ ok: false, reason: "bad-body" }, { status: 400, headers: NO_STORE }) }
  const depth = body.depth === undefined ? undefined : whole(body.depth, DEPTH.min, DEPTH.max)
  const freedom = body.freedom === undefined ? undefined : whole(body.freedom, FREEDOM.min, FREEDOM.max)
  if (depth === null || freedom === null || (depth === undefined && freedom === undefined)) {
    return NextResponse.json({ ok: false, reason: "bad-value" }, { status: 400, headers: NO_STORE })
  }
  const file = join(elementRoot(), QUIZ_FILE)
  let quiz: Record<string, unknown>
  try { quiz = JSON.parse(readFileSync(file, "utf8")) } catch { return NextResponse.json({ ok: false, reason: "no-quiz" }, { status: 404, headers: NO_STORE }) }
  if (depth !== undefined) {
    const reached = Math.max(0, ...(flatten(quiz.tree ?? []) as { level: number }[]).map((x) => x.level))
    if (depth < reached) return NextResponse.json({ ok: false, reason: "shallow", reached }, { status: 409, headers: NO_STORE })
    quiz.depth = depth
  }
  if (freedom !== undefined) quiz.freedom = freedom
  writeFileSync(file, JSON.stringify(quiz, null, 2) + "\n")
  return NextResponse.json({ ok: true, depth: quiz.depth ?? DEPTH.default, freedom: quiz.freedom ?? FREEDOM.default }, { headers: NO_STORE })
}
