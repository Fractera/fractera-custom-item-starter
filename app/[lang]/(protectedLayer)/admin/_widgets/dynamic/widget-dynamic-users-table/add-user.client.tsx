"use client"
// @local — the «Add a user» button and its window of the accounts widget (one route, core step 805)

import { useState } from "react"
import { UserPlus } from "lucide-react"
import { AppDialog } from "@/components/dialog/app-dialog.client"
import type { AppDialogUi } from "@/components/dialog/app-dialog.i18n"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { UsersTableUi } from "./ui.i18n"

// 805 (the owner of the node, 2026-11-19: «В данный момент при регистрации у нас нету возможности выбрать организацию поэтому единственный
// способ появиться пользователем данной организации это в этом интерфейсе сделать кнопку добавить пользователя. При добавлении пользователя
// через модальный окно пишем его e-mail и пароль. Если пользователь уже существует в каком-то другом элементе или в ядре … мы запрещаем
// создавать такого пользователя»). The window sends e-mail and password to this element's door `/api/users/create`; the sign-in makes the
// person in THIS app and refuses an e-mail taken anywhere (`email-taken`). The password never leaves the request.

type Why = "taken" | "email" | "password" | "forbidden" | "failed"

export function AddUser({ ui, dialogUi, onCreated }: { ui: UsersTableUi; dialogUi: AppDialogUi; onCreated: () => void }) {
  const w = ui.add
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [sending, setSending] = useState(false)
  const [why, setWhy] = useState<Why | null>(null)
  const [done, setDone] = useState<string | null>(null)
  const fits = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) && password.length >= 8 && password.length <= 200

  const reset = () => { setEmail(""); setPassword(""); setWhy(null); setSending(false) }

  async function create() {
    setSending(true)
    setWhy(null)
    try {
      const r = await fetch("/api/users/create", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: email.trim(), password }) })
      const j = (await r.json().catch(() => ({}))) as { ok?: boolean; error?: string }
      if (r.ok && j.ok) {
        setDone(email.trim())
        setOpen(false)
        reset()
        onCreated()
        return
      }
      setWhy(j.error === "email-taken" ? "taken" : j.error === "bad-email" ? "email" : String(j.error ?? "").startsWith("password-") ? "password" : r.status === 401 || r.status === 403 ? "forbidden" : "failed")
    } catch {
      setWhy("failed")
    }
    setSending(false)
  }

  return (
    <div data-block="au5x1" className="flex flex-col items-end gap-1">
      <Button size="sm" variant="outline" onClick={() => { reset(); setDone(null); setOpen(true) }} data-add-user>
        <UserPlus size={12} />
        {w.button}
      </Button>
      {done && <p data-block="au5x2" className="text-xs text-muted-foreground" role="status" data-add-user-done>{w.done.replace("{email}", done)}</p>}
      <AppDialog
        open={open}
        onOpenChange={(o) => { if (!sending) setOpen(o) }}
        title={w.title}
        description={w.text}
        ui={dialogUi}
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={sending}>{ui.cancel}</Button>
            <Button onClick={() => void create()} disabled={!fits || sending} data-add-user-create>{sending ? w.creating : w.create}</Button>
          </>
        }
      >
        <div data-block="au5x3" className="flex flex-col gap-3">
          <div data-block="au5x4" className="flex flex-col gap-1.5">
            <Label htmlFor="add-user-email">{w.email}</Label>
            <Input id="add-user-email" type="email" autoComplete="off" value={email} onChange={(e) => { setEmail(e.target.value); setWhy(null) }} disabled={sending} data-add-user-email />
          </div>
          <div data-block="au5x5" className="flex flex-col gap-1.5">
            <Label htmlFor="add-user-password">{w.password}</Label>
            <Input id="add-user-password" type="password" autoComplete="new-password" value={password} onChange={(e) => { setPassword(e.target.value); setWhy(null) }} disabled={sending} data-add-user-password />
            <p data-block="au5x6" className="text-xs text-muted-foreground">{w.passwordHint}</p>
          </div>
          {why && <p data-block="au5x7" className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-foreground" role="alert" data-add-user-error={why}>{w.errors[why]}</p>}
        </div>
      </AppDialog>
    </div>
  )
}
