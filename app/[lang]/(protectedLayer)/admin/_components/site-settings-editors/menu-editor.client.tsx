'use client'

// 579-2: копия редактора CONFIG в элементе — значения и запись идут в двери ветки элемента (`./settings-access`), меню «как сейчас»
// и кандидаты — из оболочки самого элемента (`siteShellData`, обёртка `./blocks.tsx`).
// РЕДАКТОР ШАПКИ ИЛИ ПОДВАЛА (шаг 299-5): группы header · footer редактора aifa.dev/ru/architect/app-config.
// Перенесены как есть `FeaturesEditor` (выключатель меню — PLATFORM-CONFIG) и `NavEditor` (пункты — APP-CONFIG `nav.<место>`).
// Разница с aifa.dev одна — откуда берутся страницы: у элемента настроек своих страниц сайта нет, поэтому кандидаты и
// меню «как сейчас» приходят из оболочки проекта, которую сайт отдаёт всем элементам (`PROJECT_SHELL_URL`).
import { useEffect, useMemo, useState } from 'react'
import { FeaturesEditor } from './features-editor.client'
import { NavEditor } from './nav-editor.client'
import type { GroupsUi } from './groups.i18n'
import { parseNavItems, type NavCandidate, type NavItem, type NavSlot } from './lib/nav'
import { loadSettings, type Access, type AccessWords } from './settings-access'
import { AccessNotice } from './access-notice'

export type MenuEditorProps = {
  slot: NavSlot
  editLang: string
  /** Меню, которое сайт показывает сейчас (из оболочки проекта) — начальное, пока своего `nav.<место>` нет. */
  current: NavItem[]
  candidates: NavCandidate[]
  ui: GroupsUi
  words: AccessWords
  loginHref?: string
  /** Связь с CONFIG включена: страница общего CONFIG в ядре и выключатель связи элемента. */
  configHref?: string
  settingsHref?: string
}

export function MenuEditorIsland({ slot, editLang, current, candidates, ui, words, loginHref, configHref, settingsHref }: MenuEditorProps) {
  const [access, setAccess] = useState<Access>('loading')
  const [app, setApp] = useState<Record<string, unknown> | null>(null)
  const [platform, setPlatform] = useState<Record<string, unknown> | null>(null)

  useEffect(() => {
    Promise.all([loadSettings('app'), loadSettings('platform')]).then(([a, p]) => {
      const worst = [a.access, p.access].find((x) => x !== 'ok') ?? 'ok'
      setAccess(worst)
      setApp(a.config)
      setPlatform(p.config)
    })
  }, [])

  const nav = useMemo(() => {
    const raw = (app?.nav as Record<string, unknown> | undefined)?.[slot]
    const configured = Array.isArray(raw)
    return { configured, items: configured ? parseNavItems(raw) : current }
  }, [app, slot, current])

  if (access !== 'ok' || !app || !platform) return <AccessNotice access={access} words={words} loginHref={loginHref} configHref={configHref} settingsHref={settingsHref} />

  const key = slot === 'top' ? 'topMenu' : 'footerPages'
  return (
    <FeaturesEditor
      title={slot === 'top' ? ui.nav.topTitle : ui.nav.footerTitle}
      hint={slot === 'top' ? ui.nav.topHint : ui.nav.footerHint}
      switches={[
        {
          key,
          label: ui.nav.enable,
          hint: slot === 'top' ? ui.nav.enableTop : ui.nav.enableFooter,
          initial: platform[key] === true,
        },
      ]}
      ui={ui}
      childrenGatedBy={key}
    >
      {(pending) => (
        <NavEditor slot={slot} initial={nav.items} configured={nav.configured} candidates={candidates} editLang={editLang} ui={ui} alsoSave={pending} />
      )}
    </FeaturesEditor>
  )
}
