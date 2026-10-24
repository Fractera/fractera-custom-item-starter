"use client"

import { type ReactNode, useEffect, useState } from "react"
import { AppDialog } from "@/components/dialog/app-dialog.client"
import type { AppDialogUi } from "@/components/dialog/app-dialog.i18n"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableHeader } from "@/components/ui/table"
import { ALL_ROLES } from "@/lib/roles"
import type { UsersTableUi } from "./ui.i18n"
import type { AppUserRow } from "./index.client"

// ОКНО ЧЕЛОВЕКА — перенос из вкладки «Пользователи» ядра (`components/node-users/user-dialog.client.tsx`, шаги 559-5, 580-3).
// Карандаш в строке открывает его: правка → подтверждение, история свойства, обезличивание (только архитектор узла). Окна поверх окон
// не открываются (закон `check-dialogs`). Запись — дверь пакета элемента (`/api/users/batch` → служба входа `/api/app-users/batch`);
// правила проверяет служба входа, отказ приходит с причиной.
// 🔒 ОРГАНИЗАЦИЙ В ОКНЕ НЕТ (владелец 2026-10-24: «здесь нельзя будет переключить пользователя в организации»): служба отвечает
// `org-locked` на любую попытку, и показывать то, что нельзя сделать, незачем.

const WALLET = /^0x[0-9a-fA-F]{40}$/
type Tri = "unset" | "yes" | "no"
type View = { kind: "edit" } | { kind: "confirm" } | { kind: "anonymize" } | { kind: "history"; of: HistoryKind }
export type HistoryKind = "roles" | "methods" | "marketing" | "tracking" | "log" | "messenger"
type Draft = {
  nickname: string; firstName: string; lastName: string; email: string; avatar: string; wallet: string
  roles: string[]; blocked: boolean; marketing: Tri; tracking: Tri
}

const triOf = (c: { granted: boolean } | null, refuse = false): Tri => (c ? ((refuse ? !c.granted : c.granted) ? "yes" : "no") : "unset")
const draftOf = (u: AppUserRow): Draft => ({
  nickname: u.nickname ?? "", firstName: u.firstName ?? "", lastName: u.lastName ?? "", email: u.email, avatar: u.avatar ?? "", wallet: u.wallet ?? "",
  roles: u.roles, blocked: u.status === "blocked", marketing: triOf(u.marketing), tracking: triOf(u.tracking, true),
})

export function UserDialog({ user, ui, dialogUi, lang, nodeArchitect, onClose, onChanged }: {
  user: AppUserRow; ui: UsersTableUi; dialogUi: AppDialogUi; lang: string; nodeArchitect: boolean
  onClose: () => void; onChanged: () => void
}) {
  const [view, setView] = useState<View>({ kind: "edit" })
  const [draft, setDraft] = useState<Draft>(() => draftOf(user))
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  useEffect(() => { setDraft(draftOf(user)); setView({ kind: "edit" }); setError(null) }, [user])

  const set = (p: Partial<Draft>) => setDraft((d) => ({ ...d, ...p }))
  const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v])
  const walletBad = !!draft.wallet && !WALLET.test(draft.wallet)
  // Роль архитектора выдаёт и снимает только архитектор узла: администратору её флажок не показываем, если у человека её нет.
  const roleChoices = ALL_ROLES.filter((r) => (r !== "guest" || draft.roles.includes("guest")) && (nodeArchitect || r !== "architect" || draft.roles.includes("architect")))

  // Заплата — только то, что изменилось: история человека не засоряется строками «без изменений».
  function patch(): Record<string, unknown> {
    const was = draftOf(user)
    const p: Record<string, unknown> = {}
    for (const k of ["nickname", "firstName", "lastName", "email", "avatar", "wallet"] as const) if (draft[k] !== was[k]) p[k] = draft[k]
    if (JSON.stringify([...draft.roles].sort()) !== JSON.stringify([...was.roles].sort())) p.roles = draft.roles
    if (draft.blocked !== was.blocked) p.blocked = draft.blocked
    if (draft.marketing !== was.marketing && draft.marketing !== "unset") p.marketing = draft.marketing === "yes"
    if (draft.tracking !== was.tracking && draft.tracking !== "unset") p.tracking = draft.tracking !== "yes"
    return p
  }

  async function send(action: "update" | "anonymize") {
    setSending(true)
    setError(null)
    try {
      const r = await fetch("/api/users/batch", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action, ids: [user.id], value: action === "update" ? patch() : undefined }),
      })
      const j = (await r.json().catch(() => ({}))) as { ok?: boolean; error?: string; skipped?: { reason: string }[] }
      const why = j.error ?? j.skipped?.[0]?.reason
      if (!r.ok || !j.ok || why) {
        setError(ui.reasons[why ?? ""] ?? why ?? ui.failed)
        setView({ kind: action === "update" ? "edit" : "anonymize" })
        return
      }
      onChanged()
      onClose()
    } catch {
      setError(ui.unreachable)
    } finally {
      setSending(false)
    }
  }

  async function upload(file: File) {
    setUploading(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append("file", file)
      const r = await fetch("/api/media/upload", { method: "POST", body: fd })
      const j = (await r.json().catch(() => ({}))) as { ok?: boolean; item?: { id: string } }
      // Адрес — дверь `/api/media/<id>/file`, она есть у ядра и у каждого элемента; по нему элемент входа узнаёт свой файл и удаляет его.
      if (j.ok && j.item?.id) set({ avatar: `/api/media/${j.item.id}/file` })
      else setError(ui.failed)
    } catch {
      setError(ui.unreachable)
    } finally {
      setUploading(false)
    }
  }

  const history = (of: HistoryKind) => (
    <Button className="h-auto p-0 text-xs" onClick={() => setView({ kind: "history", of })} size="sm" type="button" variant="link" data-history={of}>
      {ui.historyLink}
    </Button>
  )
  const field = (id: keyof Draft, label: string, extra?: ReactNode) => (
    <div data-block="xw2cb" className="flex flex-col gap-1.5">
      <Label htmlFor={`au-${id}`}>{label}</Label>
      <Input id={`au-${id}`} value={String(draft[id])} onChange={(e) => set({ [id]: e.target.value } as Partial<Draft>)} />
      {extra}
    </div>
  )
  const tri = (id: "marketing" | "tracking", label: string, kind: HistoryKind) => (
    <div data-block="vo0hz" className="flex flex-col gap-1.5">
      <div data-block="aomd2" className="flex items-center justify-between gap-2"><Label>{label}</Label>{history(kind)}</div>
      <Select value={draft[id]} onValueChange={(v) => set({ [id]: v as Tri } as Partial<Draft>)}>
        <SelectTrigger className="h-9" aria-label={label}><SelectValue /></SelectTrigger>
        <SelectContent>
          {draft[id] === "unset" && <SelectItem value="unset">{ui.tri.unset}</SelectItem>}
          <SelectItem value="yes">{ui.tri.yes}</SelectItem>
          <SelectItem value="no">{ui.tri.no}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )

  const title =
    view.kind === "confirm" ? ui.confirmSaveTitle
    : view.kind === "anonymize" ? ui.anonymizeTitle
    : view.kind === "history" ? `${ui.history[view.of]} — ${user.nickname ?? user.id}`
    : `${ui.editTitle} — ${user.nickname ?? user.id}`

  const footer =
    view.kind === "edit" ? (
      <>
        {nodeArchitect && <Button variant="destructive" onClick={() => setView({ kind: "anonymize" })} disabled={sending} data-action="anonymize">{ui.actions.anonymize}</Button>}
        <Button variant="outline" onClick={onClose}>{ui.cancel}</Button>
        <Button onClick={() => setView({ kind: "confirm" })} disabled={walletBad || uploading || Object.keys(patch()).length === 0} data-action="save">{ui.save}</Button>
      </>
    ) : view.kind === "confirm" ? (
      <>
        <Button variant="outline" onClick={() => setView({ kind: "edit" })} disabled={sending}>{ui.cancel}</Button>
        <Button onClick={() => void send("update")} disabled={sending} data-action="confirm-save">{ui.confirm}</Button>
      </>
    ) : view.kind === "anonymize" ? (
      <>
        <Button variant="outline" onClick={() => setView({ kind: "edit" })} disabled={sending}>{ui.cancel}</Button>
        <Button variant="destructive" onClick={() => void send("anonymize")} disabled={sending} data-action="confirm-anonymize">{ui.anonymizeDo}</Button>
      </>
    ) : (
      <Button variant="outline" onClick={() => setView({ kind: "edit" })}>← {ui.editTitle}</Button>
    )

  return (
    <AppDialog open onOpenChange={(o) => { if (!o) onClose() }} title={title} ui={dialogUi} size="lg" footer={footer}>
      <div data-block="xkibf" className="flex flex-col gap-4 px-5 py-4" data-user-dialog={view.kind}>
        {error && <p data-block="b3rk0" className="text-sm text-destructive" role="alert">{error}</p>}

        {view.kind === "edit" && (
          <>
            <div data-block="anzro" className="grid gap-4 sm:grid-cols-2">
              {field("nickname", ui.fields.nickname)}
              {field("email", ui.fields.email)}
              {field("firstName", ui.fields.firstName)}
              {field("lastName", ui.fields.lastName)}
            </div>
            <div data-block="ltw86" className="flex flex-col gap-1.5">
              <Label>{ui.fields.avatar}</Label>
              <div data-block="oxee0" className="flex flex-wrap items-center gap-3">
                {draft.avatar
                  ? <img alt="" className="size-12 rounded-full object-cover" referrerPolicy="no-referrer" src={draft.avatar} />
                  : <span aria-hidden className="flex size-12 items-center justify-center rounded-full bg-muted text-sm font-medium">{(draft.nickname || "?").slice(0, 1).toUpperCase()}</span>}
                <Label className="cursor-pointer rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted">
                  {uploading ? ui.avatarUploading : ui.avatarUpload}
                  <Input accept="image/*" className="sr-only" type="file" onChange={(e) => { const f = e.target.files?.[0]; if (f) void upload(f) }} />
                </Label>
                {draft.avatar && <Button size="sm" variant="ghost" onClick={() => set({ avatar: "" })}>{ui.avatarRemove}</Button>}
              </div>
            </div>
            <div data-block="i6ck2" className="flex flex-col gap-1.5">
              <div data-block="bk3iv" className="flex items-center justify-between gap-2"><Label>{ui.fields.roles}</Label>{history("roles")}</div>
              <div data-block="cnwnq" className="flex flex-wrap gap-x-4 gap-y-2" data-field="roles">
                {roleChoices.map((role) => (
                  <label key={role} className="inline-flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={draft.roles.includes(role)}
                      disabled={role === "architect" && !nodeArchitect}
                      onCheckedChange={() => set({ roles: toggle(draft.roles, role) })}
                    />
                    {role}
                  </label>
                ))}
              </div>
            </div>
            <div data-block="g7fzu" className="grid gap-4 sm:grid-cols-2">
              {tri("marketing", ui.fields.marketing, "marketing")}
              {tri("tracking", ui.fields.tracking, "tracking")}
            </div>
            <p data-block="uf44p" className="text-xs text-muted-foreground">{ui.trackingHint}</p>
            {field("wallet", ui.fields.wallet, walletBad ? <p data-block="hl2f7" className="text-xs text-destructive">{ui.walletBad}</p> : null)}
            <div data-block="uavdm" className="flex items-center justify-between gap-3">
              <label className="inline-flex items-center gap-3 text-sm">
                <Switch checked={draft.blocked} onCheckedChange={(v) => set({ blocked: v })} />
                {ui.fields.blocked}
              </label>
              <div data-block="zi0kb" className="flex flex-wrap items-center gap-3 text-xs">
                <span className="text-muted-foreground">{ui.cols.methods}: {user.methods.map((m) => ui.methods[m] ?? m).join(", ") || ui.noName}</span>
                {history("methods")}
                {history("log")}
                <span className="text-muted-foreground">{ui.history.messenger}: {user.messengerCount}</span>
                {history("messenger")}
              </div>
            </div>
          </>
        )}

        {view.kind === "confirm" && (
          <div data-block="nthis" className="flex flex-col gap-2 text-sm">
            <p data-block="vdn5f">{ui.confirmSaveText}</p>
            <div data-block="hkgpp" className="flex flex-wrap gap-1">{Object.keys(patch()).map((k) => <Badge data-block="k7al5" key={k} variant="outline">{ui.fields[k as keyof UsersTableUi["fields"]] ?? k}</Badge>)}</div>
          </div>
        )}

        {view.kind === "anonymize" && (
          <div data-block="hus2h" className="flex flex-col gap-2 text-sm">
            <p data-block="l75v7">{ui.anonymizeErased}</p>
            <p data-block="fisoa">{ui.anonymizeKept}</p>
            <p data-block="edlrg" className="font-medium">{ui.anonymizeNickname.replace("{nickname}", user.nickname ?? user.id)}</p>
          </div>
        )}

        {view.kind === "history" && <HistoryTable userId={user.id} kind={view.of} ui={ui} lang={lang} />}
      </div>
    </AppDialog>
  )
}

type HistoryRow = Record<string, unknown>

/** История одного свойства — страницы с сервера, новые сверху. */
function HistoryTable({ userId, kind, ui, lang }: { userId: string; kind: HistoryKind; ui: UsersTableUi; lang: string }) {
  const [page, setPage] = useState(1)
  const [data, setData] = useState<{ rows: HistoryRow[]; total: number; perPage: number } | "loading" | "failed">("loading")
  useEffect(() => {
    let live = true
    setData("loading")
    fetch(`/api/users/${encodeURIComponent(userId)}/history/${kind}?page=${page}&perPage=10`, { cache: "no-store" })
      .then((r) => r.json())
      .then((j: { ok?: boolean; rows?: HistoryRow[]; total?: number; perPage?: number }) => { if (live) setData(j.ok ? { rows: j.rows ?? [], total: j.total ?? 0, perPage: j.perPage ?? 10 } : "failed") })
      .catch(() => { if (live) setData("failed") })
    return () => { live = false }
  }, [userId, kind, page])

  if (data === "loading") return <p data-block="hc4v5" className="text-sm text-muted-foreground">{ui.loading}</p>
  if (data === "failed") return <p data-block="pbbmg" className="text-sm text-destructive" role="alert">{ui.failed}</p>
  if (data.rows.length === 0) return <p data-block="upfax" className="text-sm text-muted-foreground" data-history-empty>{kind === "messenger" ? ui.messengerEmpty : ui.historyEmpty}</p>

  const when = (s: unknown) => (typeof s === "string" && s ? new Date(s.replace(" ", "T") + "Z").toLocaleString(lang === "ru" ? "ru-RU" : "en-GB", { dateStyle: "short", timeStyle: "short" }) : ui.noName)
  const roles = (s: unknown) => { try { return (JSON.parse(String(s)) as string[]).join(", ") } catch { return ui.noName } }
  const what = (r: HistoryRow): string => {
    if (kind === "roles") return `${r.before ? roles(r.before) : ui.noName} → ${roles(r.after)}`
    if (kind === "methods") return ui.methods[String(r.method)] ?? String(r.method)
    if (kind === "marketing") return r.granted ? ui.tri.yes : ui.tri.no
    if (kind === "tracking") return r.granted ? ui.tri.no : ui.tri.yes
    if (kind === "messenger") return `${r.amount ?? ui.noName} ${r.currency ?? ""}`.trim()
    const action = ui.logActions[String(r.action)] ?? String(r.action)
    let d = ""
    try {
      const j = JSON.parse(String(r.details ?? "null"))
      if (Array.isArray(j)) d = j.map((f) => ui.fields[f as keyof UsersTableUi["fields"]] ?? f).join(", ")
      else if (j && typeof j === "object" && "method" in j) d = ui.methods[String((j as { method: string }).method)] ?? String((j as { method: string }).method)
    } catch { /* без подробностей */ }
    return d ? `${action}: ${d}` : action
  }
  const cell = "px-3 py-2 align-top"
  const pages = Math.max(1, Math.ceil(data.total / data.perPage))
  return (
    <div data-block="c135w" className="flex flex-col gap-3">
      <div data-block="eeriz" className="overflow-x-auto rounded-xl border border-border">
        <Table data-block="o8ewj" className="w-full border-collapse text-left text-sm">
          <TableHeader data-block="kdnqt">
            <tr data-block="ob7vo" className="border-b border-border">
              <th data-block="kntrw" className={cell} scope="col">{ui.historyCols.at}</th>
              <th data-block="gjs5z" className={cell} scope="col">{ui.historyCols.what}</th>
              {kind !== "methods" && kind !== "messenger" && <th data-block="tqv3f" className={cell} scope="col">{ui.historyCols.who}</th>}
            </tr>
          </TableHeader>
          <TableBody data-block="widev">
            {data.rows.map((r, i) => (
              <tr data-block="kdpcd" key={String(r.id ?? i)} className="border-b border-border last:border-0 text-muted-foreground">
                <td data-block="fczzc" className={`${cell} whitespace-nowrap`}>{when(r.at ?? r.sharedAt ?? r.firstAt)}{kind === "methods" && r.lastAt ? ` … ${when(r.lastAt)}` : ""}</td>
                <td data-block="eoy3k" className={`${cell} text-foreground`}>{what(r)}</td>
                {kind !== "methods" && kind !== "messenger" && <td data-block="at71z" className={cell}>{String(r.actor ?? ui.noName)}</td>}
              </tr>
            ))}
          </TableBody>
        </Table>
      </div>
      {pages > 1 && (
        <div data-block="ed5el" className="flex items-center justify-end gap-2 text-sm">
          <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>‹</Button>
          <span className="text-muted-foreground">{page} / {pages}</span>
          <Button size="sm" variant="outline" disabled={page >= pages} onClick={() => setPage(page + 1)}>›</Button>
        </div>
      )}
    </div>
  )
}
