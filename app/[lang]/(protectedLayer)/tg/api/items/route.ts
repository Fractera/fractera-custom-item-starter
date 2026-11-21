// @api the person adds an item to a direction of the Mini App's projects
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { revalidatePath } from "next/cache"
import { NextRequest, NextResponse } from "next/server"
import { elementRoot } from "@/lib/page-tree"
import raw from "../../_data/projects.json"
import { adminOfMiniApp } from "../../_libs/admin-only"
import { addItem, treeDir, writeItems } from "../../_libs/projects-catalog.mjs"

// «＋ ДОБАВИТЬ» НАПРАВЛЕНИЯ (шаг узла 826; владелец, Telegram 503, 505: «модальное окно для добавления новый соцсети … эта кнопка должна
// обновить … файл в маршруте»; «Кнопку удалить не делаем кнопку редактировать не делаем»). POST `{ group, title, line? }` → пункт
// дописывается в `tg/_projects/<раздел>/<группа>/items.json` папки элемента (ELEMENT_DIR — тот же файл, что читает экран), без сборки;
// экран группы перерисовывается сразу. Только добавление: удалить и переименовать — агент элемента.
// 🔒 Файл пишется целиком: прежние строки — как лежали (и те, что экран пропускает), плюс одна новая. Нечитаемый файл (его правит агент)
// не перезаписывается — `broken-file`, ничего не теряется.
export const dynamic = "force-dynamic"

const NO_STORE = { "Cache-Control": "no-store" }
const LANG = /^[a-z]{2}$/
const SECTIONS = (raw as unknown as { sections: { slug: string; groups: { slug: string }[] }[] }).sections

export async function POST(req: NextRequest, { params }: { params: Promise<{ lang: string }> }) {
  const who = await adminOfMiniApp(req)
  if (who !== 200) return NextResponse.json({ ok: false }, { status: who, headers: NO_STORE })
  const { lang } = await params
  if (!LANG.test(lang)) return NextResponse.json({ ok: false, error: "bad-lang" }, { status: 400, headers: NO_STORE })
  let body: { group?: unknown; title?: unknown; line?: unknown }
  try { body = await req.json() } catch { return NextResponse.json({ ok: false, error: "bad-body" }, { status: 400, headers: NO_STORE }) }
  const group = typeof body.group === "string" ? body.group : ""
  const section = SECTIONS.find((s) => s.groups.some((g) => g.slug === group))?.slug
  if (!section) return NextResponse.json({ ok: false, error: "no-group" }, { status: 404, headers: NO_STORE })

  const tree = treeDir(elementRoot())
  let lines: unknown[]
  try {
    const parsed: unknown = JSON.parse(readFileSync(join(tree, section, group, "items.json"), "utf8"))
    if (!Array.isArray(parsed)) throw new Error("not a list")
    lines = parsed
  } catch {
    return NextResponse.json({ ok: false, error: "broken-file" }, { status: 409, headers: NO_STORE })
  }
  const langs = ["en", "ru", ...(process.env.NEXT_PUBLIC_SUPPORTED_LANGUAGES ?? "").split(",").map((x) => x.trim()).filter((x) => LANG.test(x))]
  // every line as it lies — the ones the screen skips too: a name or an address already there is never given twice
  const r = addItem(lines, { title: body.title, line: body.line }, langs) as { error?: string; item?: { slug: string }; items?: unknown[] }
  if (r.error || !r.item || !r.items) return NextResponse.json({ ok: false, error: r.error ?? "failed" }, { status: r.error === "taken" || r.error === "full" ? 409 : 400, headers: NO_STORE })
  writeItems(tree, section, group, r.items)
  revalidatePath(`/${lang}/tg/projects/${group}`)
  return NextResponse.json({ ok: true, slug: r.item.slug, href: `/${lang}/tg/projects/${group}/${r.item.slug}` }, { headers: NO_STORE })
}
