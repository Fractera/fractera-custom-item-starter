'use client'

// ВЫКЛЮЧАТЕЛИ ФУНКЦИЙ САЙТА ЭЛЕМЕНТА (шаг 579-2). Копия страницы «Функции» CONFIG: двенадцать выключателей `PLATFORM-CONFIG`
// (меню, подвал, баннер cookie, офлайн-копия, вход, крошки, вопросы и ответы, тема, ширина, язык, соцсети, индикатор ширины).
// Слово владельца 2026-10-23 на вопрос «перенести переключатели функций?» — «Перенести (Рекомендую)».
//
// Отличия от CONFIG названы: (1) пишется свой файл элемента через дверь ветки, рассылки нет — сохранено значит применено на
// страницах этого элемента; (2) окно перед выключением меню или входа показывает прямые ссылки ЭТОГО элемента, которые сервер
// дал пропсом, а не список элементов узла (`/api/elements` есть только у CONFIG).
import { H2 } from '@/components/ui/typography'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { AppDialog } from '@/components/dialog/app-dialog.client'
import type { AppDialogUi } from '@/components/dialog/app-dialog.i18n'
import { loadSettings, saveSettings, type Access, type AccessWords } from './settings-access'
import { AccessNotice } from './access-notice'
import { toast } from './toast'

type Guard = { title: string; text: string }
export type FeatureSwitchesProps = {
  title: string
  note?: string
  features: { key: string; label: string; hint?: string; guard?: Guard }[]
  words: AccessWords & {
    saved: string
    saveFailed: string
    guardLinks: string
    guardCopy: string
    guardCopied: string
    guardConfirm: string
    guardProceed: string
    guardCancel: string
  }
  /** Прямые ссылки этого элемента — их показывает окно перед выключением меню или входа. */
  links: { label: string; url: string }[]
  loginHref?: string
  configHref?: string
  settingsHref?: string
}

export function FeatureSwitchesIsland({ title, note, features, words, links, loginHref, configHref, settingsHref, dialogUi }: FeatureSwitchesProps & { dialogUi: AppDialogUi }) {
  const [access, setAccess] = useState<Access>('loading')
  const [values, setValues] = useState<Record<string, unknown>>({})
  const [busy, setBusy] = useState<string | null>(null)
  const [guarded, setGuarded] = useState<{ key: string; guard: Guard } | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    loadSettings('platform').then((r) => {
      setAccess(r.access)
      if (r.config) setValues(r.config)
    })
  }, [])

  async function save(key: string, next: boolean) {
    setBusy(key)
    const r = await saveSettings('platform', { [key]: next })
    setBusy(null)
    if (r.access === 'ok' && r.config) {
      setValues(r.config)
      toast.success(words.saved)
    } else if (r.access === 'ok') {
      toast.error(words.saveFailed)
    } else {
      setAccess(r.access)
    }
  }

  async function toggle(key: string) {
    const next = !(values[key] === true)
    const f = features.find((x) => x.key === key)
    if (!next && f?.guard) {
      setGuarded({ key, guard: f.guard })
      setConfirmed(false)
      setCopied(false)
      return
    }
    await save(key, next)
  }

  const linksText = links.map((l) => `${l.label}: ${l.url}`).join('\n')

  async function copyLinks() {
    try {
      await navigator.clipboard.writeText(linksText)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <section data-block="rrb9a" className={title ? 'mt-10' : undefined} aria-labelledby={title ? 'feature-switches' : undefined} aria-label={title ? undefined : note}>
      {title && <H2 data-block="zmqve" variant="ui" id="feature-switches">{title}</H2>}
      {note && <p data-block="n1d9g" className="mt-1 text-sm text-muted-foreground">{note}</p>}
      <div data-block="fjrx1" className="mt-4">
        {access !== 'ok' ? (
          <AccessNotice access={access} words={words} loginHref={loginHref} configHref={configHref} settingsHref={settingsHref} />
        ) : (
          <ul data-block="xyqdo" className="grid gap-3 sm:grid-cols-2">
            {features.map((f) => {
              const on = values[f.key] === true
              return (
                <li data-block="yds4a" key={f.key} className="flex items-start justify-between gap-4 rounded-xl border border-border bg-card p-4">
                  <div data-block="vrvmp">
                    <p data-block="a6369" className="font-medium">{f.label}</p>
                    {f.hint && <p data-block="hgv7x" className="mt-1 text-sm text-muted-foreground">{f.hint}</p>}
                  </div>
                  <Switch checked={on} aria-label={f.label} disabled={busy !== null} onCheckedChange={() => toggle(f.key)} />
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <AppDialog
        open={guarded !== null}
        onOpenChange={(open) => { if (!open) setGuarded(null) }}
        ui={dialogUi}
        titleClassName="flex items-center gap-2 text-destructive"
        title={<><AlertTriangle className="size-5" aria-hidden />{guarded?.guard.title}</>}
        description={guarded?.guard.text}
        footer={<>
            <Button variant="outline" type="button" onClick={() => setGuarded(null)}>
              {words.guardCancel}
            </Button>
            <Button
              variant="destructive"
              type="button"
              disabled={!confirmed}
              onClick={async () => {
                const g = guarded
                setGuarded(null)
                if (g) await save(g.key, false)
              }}
            >
              {words.guardProceed}
            </Button>
        </>}
      >
          <div data-block="blorw" className="flex flex-col gap-3">
            <p data-block="xyu9q" className="text-sm font-medium">{words.guardLinks}</p>
            <ul data-block="l3nm8" className="flex flex-col gap-1 rounded-lg border border-border bg-muted/40 p-3 text-sm">
              {links.map((l) => (
                <li data-block="bmggr" key={l.url} className="flex flex-wrap gap-2">
                  <span className="text-muted-foreground">{l.label}:</span>
                  <a href={l.url} className="break-all text-primary hover:underline">{l.url}</a>
                </li>
              ))}
            </ul>
            <Button variant="outline" size="sm" type="button" onClick={copyLinks} disabled={!linksText} className="self-start">
              {copied ? words.guardCopied : words.guardCopy}
            </Button>
            <Label className="flex items-start gap-2 text-sm font-normal">
              <Checkbox checked={confirmed} onCheckedChange={(v) => setConfirmed(v === true)} className="mt-0.5" />
              {words.guardConfirm}
            </Label>
          </div>
      </AppDialog>
    </section>
  )
}
