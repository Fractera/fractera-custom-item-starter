// @api answer agent-to-agent JSON-RPC calls from the core and neighbours
import { NextRequest, NextResponse } from "next/server"
import { nodeCaller } from "@/lib/node-key"
import { rpcError } from "@/lib/a2a/endpoint"
import { handleA2A } from "@/lib/a2a/sdk-server"
import { fromOutside, hiddenFrom } from "@/lib/a2a/boundary"
import { describeCall, logCall } from "@/lib/a2a/log"

// КОНЕЧНАЯ ТОЧКА A2A (привязка JSON-RPC, A2A v1.0) — объявлена в визитке `supportedInterfaces` (`/.well-known/agent-card.json`).
// Логика — официальный SDK A2A (`lib/a2a/sdk-server.ts`, исполнитель `lib/a2a/executor.ts`). Здесь: версия протокола (`A2A-Version`, §3.2.6 — без заголовка клиент считается 0.3, её здесь
// нет), ключ узла (`X-Node-Key`; без него — HTTP 401 и ошибка JSON-RPC, §3.3.2 «Authentication Errors»), разбор JSON.
export const dynamic = "force-dynamic"

const JSON_HEADERS = { "Content-Type": "application/json", "Cache-Control": "no-store" }

export async function POST(req: NextRequest) {
  // Каждый исход — и отказ — уходит в журнал узла (шаг узла 408): «до элемента не дозвались» лента обязана показать.
  const t0 = performance.now()
  let body: unknown
  const reply = (answer: unknown, init: { status?: number; headers: Record<string, string> }) => {
    // 409-2: чтения состояния задачи (GetTask, ListTasks) в журнал не идут — вызывающий опрашивает их, и лента с Telegram
    // заполнились бы повторами; ответ агента пишет дверь задач записью TaskResult.
    const method = (body as { method?: unknown } | undefined)?.method
    if (method !== "GetTask" && method !== "ListTasks") logCall({ ...describeCall(body, answer), httpStatus: init.status ?? 200, durationMs: performance.now() - t0, request: body, response: answer })
    return NextResponse.json(answer, init)
  }
  const raw = await req.text()
  try { body = JSON.parse(raw) } catch {
    body = raw.slice(0, 2000)
    return reply(rpcError(null, -32700, "Invalid JSON payload", "JSON_PARSE"), { headers: JSON_HEADERS })
  }
  const id = (body as { id?: unknown })?.id ?? null
  // Граница узла: внутренний элемент (видимость `node`) извне не вызывается — HTTP 403 (A2A §3.3.2 «Authorization Errors»).
  if (hiddenFrom(req.headers)) {
    return reply(rpcError(id, -32000, "Forbidden: this element serves only its own node", "NOT_VISIBLE_OUTSIDE_NODE", "fractera.ai"), { status: 403, headers: JSON_HEADERS })
  }
  // 818-7 (the red team's H6): this element's own key (the core, a native) or a neighbour's pair key from the core (lib/node-key.ts).
  const caller = nodeCaller(req.headers.get("x-node-key"))
  if (!caller) {
    return reply(rpcError(id, -32000, "Unauthenticated: send this element's key or your pair key from the core in the X-Node-Key header", "UNAUTHENTICATED", "fractera.ai"), {
      status: 401, headers: { ...JSON_HEADERS, "WWW-Authenticate": 'ApiKey header="X-Node-Key"' },
    })
  }
  const version = req.headers.get("a2a-version")?.trim() ?? ""
  if (!/^1\.\d+$/.test(version)) {
    return reply(rpcError(id, -32009, `A2A version «${version || "0.3 (no header)"}» is not supported; use A2A-Version: 1.0`, "VERSION_NOT_SUPPORTED"), { headers: JSON_HEADERS })
  }
  // 552-4: откуда пришло сообщение — соседом по петле (i2i, строительный процесс) или извне узла (a2a, рабочий процесс). Метку
  // ставит эта дверь и ТОЛЬКО она: присланное вызывающим значение перезаписывается. Исполнитель по ней открывает задачу первым
  // словом процесса (`lib/a2a/executor.ts`), и ядро ведёт её в сессию этого процесса.
  const message = (body as { params?: { message?: { metadata?: Record<string, unknown> } } })?.params?.message
  // 818-7: and WHO sent it, when the key names a neighbour — a pair key carries the caller's id; the `from` it writes itself is only a
  // claim (the executor prefers this mark). The core and the natives keep their own `from`.
  if (message && typeof message === "object") message.metadata = { ...(message.metadata ?? {}), fracteraOutside: fromOutside(req.headers), fracteraCaller: caller.kind === "element" ? caller.id : null }
  // 418-1: протокол — официальный SDK A2A (lib/a2a/sdk-server.ts); ворота узла выше остаются нашими.
  return reply(await handleA2A(body, version), { headers: JSON_HEADERS })
}
