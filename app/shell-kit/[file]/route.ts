// @api give the browser the core's shell kit files through this element
import { NextResponse } from "next/server"
import { coreUrl } from "@/lib/a2a/log"

// ФАЙЛЫ ИНСТРУМЕНТА ЯДРА «ОБОЛОЧКА ПРОЕКТА» ЧЕРЕЗ ЭТОТ ЭЛЕМЕНТ (узел, шаг 727-2). Браузер ходит только на адрес элемента: ни CORS, ни
// адреса ядра в странице; элемент берёт файл у ядра по петле с ключом узла. Имя несёт хэш содержимого — ответ неизменен, кэш навсегда.
// Только имена `shell-kit.<хэш>.js|css`; остальное — 404. Ядро молчит — 502, и страница живёт со своей шапкой при следующей отрисовке.
const FILE = /^shell-kit\.[0-9a-f]{10}\.(js|css)$/

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params
  if (!FILE.test(file)) return NextResponse.json({ ok: false, error: "unknown file" }, { status: 404 })
  const core = coreUrl()
  const key = process.env.SETTINGS_SECRET?.trim()
  if (!core || !key) return NextResponse.json({ ok: false, error: "no core" }, { status: 502 })
  try {
    const r = await fetch(`${core}/api/shell-kit/asset/${file}`, { headers: { "x-node-key": key }, signal: AbortSignal.timeout(8000) })
    if (!r.ok) return NextResponse.json({ ok: false, error: `core ${r.status}` }, { status: r.status === 404 ? 404 : 502 })
    const type = file.endsWith(".js") ? "text/javascript; charset=utf-8" : "text/css; charset=utf-8"
    return new NextResponse(await r.arrayBuffer(), { headers: { "Content-Type": type, "Cache-Control": "public, max-age=31536000, immutable" } })
  } catch {
    return NextResponse.json({ ok: false, error: "core did not answer" }, { status: 502 })
  }
}
