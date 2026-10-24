"use client"

import { useCallback, useEffect, useState } from "react"
import { Eye, Pencil } from "lucide-react"
import type { AppDialogUi } from "@/components/dialog/app-dialog.i18n"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { H4 } from "@/components/ui/typography"
import { ALL_ROLES } from "@/lib/roles"
import type { UsersTableUi } from "./ui.i18n"
import { BatchBar } from "./batch-bar.client"
import { ClampedChips } from "./clamped-chips.client"
import { ServerTableTools, SERVER_PER_PAGE, type ServerTableQuery } from "./server-table-tools.client"
import { UsersTableSkeleton } from "./skeleton"
import { UserDialog } from "./user-dialog.client"

// ВИДЖЕТ «УЧЁТНЫЕ ЗАПИСИ» — люди ЭТОГО ПРИЛОЖЕНИЯ (узел, шаг 580-3). Динамический островок в статической странице.
//
// 🎯 Владелец 2026-10-24: «вкладка для работы с пользователями своего приложения позволит также как и основная вкладка с пользователями
// … работать с ролями пользователей но только в рамках данной организации то есть здесь нельзя будет переключить пользователя в
// организации а в остальном этой таблице пользователей будет редактироваться также как и таблица пользователей нативном элементе
// авторизации». Поэтому окно — перенос вкладки «Пользователи» ядра (`components/node-users`, шаг 559): поиск, отбор по роли,
// сортировка, страницы, выбор строк, пакет, карточка человека с историями — без организаций.
// 🔒 КТО ВИДИТ — РЕШАЕТ СЛУЖБА ВХОДА (`/api/app-users`): архитектор узла — любое приложение, администратор — только приложение своей
// записи (закон 580). Отказ разбирается по коду: 403 — «вам сюда нельзя», 502 — «служба не ответила», остальное — «не удалось».
// 🔒 ЗАКРЫТ ПО УМОЛЧАНИЮ: список людей — самая чувствительная выборка страницы; пока человек не нажал, служба не спрошена. Скелетон
// виден сразу — та же рама, что у ответа.

export type AppUserRow = {
  id: string; email: string; nickname: string | null; firstName: string | null; lastName: string | null; avatar: string | null
  roles: string[]; methods: string[]; status: "active" | "blocked" | "anonymized"
  createdAt: string; lastLoginAt: string | null; wallet: string | null; guest: boolean
  marketing: { granted: boolean; at: string } | null; tracking: { granted: boolean; at: string } | null; messengerCount: number
}
type Filters = { role: string; sort: "created_desc" | "created_asc" }
type State =
  | { kind: "loading" }
  | { kind: "error"; why: "forbidden" | "unreachable" | "failed" }
  | { kind: "ok"; rows: AppUserRow[]; total: number; nodeArchitect: boolean }

const ANY = "all"
const fullName = (r: Pick<AppUserRow, "firstName" | "lastName">) => [r.firstName, r.lastName].filter(Boolean).join(" ")

export function UsersTable({ lang, ui, dialogUi }: { lang: string; ui: UsersTableUi; dialogUi: AppDialogUi }) {
  const [revealed, setRevealed] = useState(false)
  const cols = [ui.cols.user, ui.cols.email, ui.cols.roles, ui.cols.methods, ui.cols.status, ui.cols.created, ui.cols.lastSeen]
  return (
    <div data-block="rhpwj" className="flex flex-col">
      <div data-block="p1r1g" className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <H4 data-block="uliyu" variant="ui">{ui.tableTitle}</H4>
        {!revealed && (
          <Button size="sm" onClick={() => setRevealed(true)} data-reveal-users>
            <Eye size={12} />
            {ui.reveal}
          </Button>
        )}
      </div>
      {revealed ? (
        <AppUsers lang={lang} ui={ui} dialogUi={dialogUi} />
      ) : (
        <>
          <UsersTableSkeleton labels={cols} />
          <p data-block="ixsa0" className="mt-3 text-xs text-muted-foreground">{ui.revealHint}</p>
        </>
      )}
    </div>
  )
}

function AppUsers({ lang, ui, dialogUi }: { lang: string; ui: UsersTableUi; dialogUi: AppDialogUi }) {
  const [selected, setSelected] = useState<string[]>([])
  const [editing, setEditing] = useState<AppUserRow | null>(null)
  const [query, setQuery] = useState<ServerTableQuery>({ q: "", page: 1, perPage: SERVER_PER_PAGE[0] })
  const [filters, setFilters] = useState<Filters>({ role: ANY, sort: "created_desc" })
  const [state, setState] = useState<State>({ kind: "loading" })
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setBusy(true)
    const p = new URLSearchParams({ page: String(query.page), perPage: String(query.perPage), sort: filters.sort })
    if (query.q) p.set("q", query.q)
    if (filters.role !== ANY) p.set("role", filters.role)
    try {
      const r = await fetch(`/api/users?${p}`, { cache: "no-store" })
      const j = (await r.json().catch(() => ({}))) as { ok?: boolean; rows?: AppUserRow[]; total?: number; nodeArchitect?: boolean }
      if (r.status === 401 || r.status === 403) setState({ kind: "error", why: "forbidden" })
      else if (r.status === 502 || r.status === 503) setState({ kind: "error", why: "unreachable" })
      else if (!j.ok || !j.rows) setState({ kind: "error", why: "failed" })
      else setState({ kind: "ok", rows: j.rows, total: j.total ?? 0, nodeArchitect: j.nodeArchitect === true })
    } catch {
      setState({ kind: "error", why: "unreachable" })
    } finally {
      setBusy(false)
    }
  }, [query, filters])

  useEffect(() => { void load() }, [load])

  const date = (s: string) => new Date(s.replace(" ", "T") + "Z").toLocaleDateString(lang === "ru" ? "ru-RU" : "en-GB", { dateStyle: "medium" })
  const cell = "px-4 py-3 align-top"
  const setFilter = (next: Partial<Filters>) => { setFilters((f) => ({ ...f, ...next })); setQuery((q) => ({ ...q, page: 1 })) }

  if (state.kind === "loading") return <p data-block="s5k2v" className="text-sm text-muted-foreground">{ui.loading}</p>
  if (state.kind === "error") return <p data-block="e7q4n" className="text-sm text-destructive" role="alert" data-users-error={state.why}>{ui[state.why]}</p>

  // Выбор живёт по id на текущей странице: обезличенных не выбирают — с ними ничего сделать нельзя.
  const pickable = state.rows.filter((r) => r.status !== "anonymized").map((r) => r.id)
  const allPicked = pickable.length > 0 && pickable.every((id) => selected.includes(id))
  const head = (
    <tr data-block="yeqjr" className="border-b border-border">
      <th data-block="eudnt" scope="col" className={`${cell} w-10`}>
        <Checkbox aria-label={ui.cols.selectPage} checked={allPicked} onCheckedChange={() => setSelected(allPicked ? [] : pickable)} data-select-page />
      </th>
      {[ui.cols.user, ui.cols.email, ui.cols.roles, ui.cols.methods, ui.cols.status, ui.cols.created, ui.cols.lastSeen].map((h) => (
        <th data-block="n7o9h" key={h} scope="col" className={`${cell} font-semibold whitespace-nowrap text-foreground`}>{h}</th>
      ))}
      <th data-block="nd3iz" scope="col" className={`${cell} w-12`}><span className="sr-only">{ui.cols.edit}</span></th>
    </tr>
  )

  const rows = state.rows.map((r) => {
    const gone = r.status === "anonymized"
    return (
      <tr data-block="jmlqy" key={r.id} className="border-b border-border last:border-0 text-muted-foreground" data-user-row={r.id} data-status={r.status}>
        <td data-block="kq4wo" className={cell}>
          {!gone && <Checkbox aria-label={ui.cols.select} checked={selected.includes(r.id)} onCheckedChange={() => setSelected((s) => (s.includes(r.id) ? s.filter((x) => x !== r.id) : [...s, r.id]))} />}
        </td>
        <td data-block="w3485" className={`${cell} min-w-[180px] max-w-[240px]`}>
          <div data-block="hd15r" className="flex items-center gap-3">
            {r.avatar && !gone
              ? <img alt="" className="size-8 shrink-0 rounded-full object-cover" referrerPolicy="no-referrer" src={r.avatar} />
              : <span aria-hidden className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-foreground">{(r.nickname ?? "?").slice(0, 1).toUpperCase()}</span>}
            <div data-block="fewgz" className="flex min-w-0 flex-col">
              <span className="truncate font-medium text-foreground">{r.nickname || ui.noName}</span>
              <span className="truncate text-xs">{gone ? ui.anonymizedName : fullName(r) || (r.guest ? ui.guest : "")}</span>
            </div>
          </div>
        </td>
        <td data-block="dr64i" className={`${cell} w-[280px] min-w-[280px] max-w-[280px]`} data-col="email">
          <div data-block="z3x9d" className="truncate" title={gone ? undefined : r.email ?? undefined}>{gone ? ui.noName : r.email}</div>
        </td>
        <td data-block="gggaj" className={`${cell} w-[200px] min-w-[200px]`} data-col="roles"><ClampedChips items={r.roles} maxWidth={200} chipMaxWidth={200} /></td>
        <td data-block="llcpm" className={`${cell} whitespace-nowrap`} data-col="methods">
          {r.methods.length
            ? <div data-block="a0ab5" className="max-w-[200px] truncate" title={r.methods.map((m) => ui.methods[m] ?? m).join(", ")}>{r.methods.map((m) => ui.methods[m] ?? m).join(", ")}</div>
            : ui.noName}
        </td>
        <td data-block="vcoqf" className={`${cell} whitespace-nowrap`}>
          <Badge data-block="ib2ex" variant={r.status === "active" ? "secondary" : r.status === "blocked" ? "destructive" : "outline"}>{ui.status[r.status]}</Badge>
        </td>
        <td data-block="x5dws" className={`${cell} whitespace-nowrap`}>{date(r.createdAt)}</td>
        <td data-block="ggj06" className={`${cell} whitespace-nowrap`} data-col="last-seen">{r.lastLoginAt ? date(r.lastLoginAt) : ui.lastSeenNever}</td>
        <td data-block="fbna8" className={cell}>
          {!gone && (
            <Button size="icon-sm" variant="ghost" aria-label={`${ui.cols.edit}: ${r.nickname ?? r.id}`} onClick={() => setEditing(r)} data-edit={r.id}>
              <Pencil />
            </Button>
          )}
        </td>
      </tr>
    )
  })

  const filterBar = (
    <>
      <Select value={filters.role} onValueChange={(v) => setFilter({ role: v })}>
        <SelectTrigger className="h-9 w-48" aria-label={ui.filterRole} data-filter="role">
          <SelectValue placeholder={ui.filterRole} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ANY}>{ui.filterRole}: {ui.any}</SelectItem>
          {ALL_ROLES.map((role) => <SelectItem key={role} value={role}>{role}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={filters.sort} onValueChange={(v) => setFilter({ sort: v as Filters["sort"] })}>
        <SelectTrigger className="h-9 w-44" aria-label={ui.cols.created} data-filter="sort">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="created_desc">{ui.sortNewest}</SelectItem>
          <SelectItem value="created_asc">{ui.sortOldest}</SelectItem>
        </SelectContent>
      </Select>
    </>
  )

  return (
    <div data-block="w3n8d" className="flex flex-col" data-app-users={state.total}>
      <ServerTableTools
        above={selected.length > 0
          ? <BatchBar ids={selected} ui={ui} dialogUi={dialogUi} nodeArchitect={state.nodeArchitect} onClear={() => setSelected([])} onDone={() => { setSelected([]); void load() }} />
          : null}
        columns={9}
        filters={filterBar}
        head={head}
        loading={busy}
        onQuery={setQuery}
        onReset={() => {
          setFilters({ role: ANY, sort: "created_desc" })
          setQuery({ q: "", page: 1, perPage: SERVER_PER_PAGE[0] })
        }}
        query={query}
        rows={rows}
        total={state.total}
        words={ui.table}
      />
      {editing && (
        <UserDialog
          user={editing}
          ui={ui}
          dialogUi={dialogUi}
          lang={lang}
          nodeArchitect={state.nodeArchitect}
          onClose={() => setEditing(null)}
          onChanged={() => void load()}
        />
      )}
    </div>
  )
}
