'use client'

// БАННЕР COOKIE ЭЛЕМЕНТА (шаг 579-2) — `CookieBannerIsland` CONFIG, перенесённый как есть: выключатель `cookieBanner` своего
// `PLATFORM-CONFIG` и ссылка на правовую страницу о cookie этого элемента (`/<язык>/cookies`). Значения и запись — дверь ветки.
import { useEffect, useState } from 'react'
import { FeaturesEditor } from './features-editor.client'
import type { GroupsUi } from './groups.i18n'
import { loadSettings, type Access, type AccessWords } from './settings-access'
import { AccessNotice } from './access-notice'

export function CookieBannerIsland({ ui, words, loginHref, policyHref, configHref, settingsHref }: {
  ui: GroupsUi
  words: AccessWords
  loginHref?: string
  policyHref?: string
  configHref?: string
  settingsHref?: string
}) {
  const [access, setAccess] = useState<Access>('loading')
  const [config, setConfig] = useState<Record<string, unknown> | null>(null)
  useEffect(() => {
    loadSettings('platform').then((r) => {
      setAccess(r.access)
      setConfig(r.config)
    })
  }, [])
  if (access !== 'ok' || !config) return <AccessNotice access={access} words={words} loginHref={loginHref} configHref={configHref} settingsHref={settingsHref} />
  return (
    <FeaturesEditor
      title={ui.cookies.title}
      hint={ui.cookies.hint}
      switches={[
        {
          key: 'cookieBanner',
          label: ui.cookies.enable,
          hint: ui.cookies.enableHint,
          notice: { on: ui.cookies.onNotice, off: ui.cookies.offNotice },
          initial: config.cookieBanner === true,
        },
      ]}
      ui={ui}
    >
      {policyHref && (
        <section data-block="tegg7" className="flex flex-col gap-2">
          <a href={policyHref} className="text-[length:var(--fs-body)] text-primary hover:underline" data-cookie-policy-link>
            {ui.cookies.linkTitle}
          </a>
          <p data-block="kidwt" className="text-sm text-muted-foreground">{ui.cookies.linkHint}</p>
        </section>
      )}
    </FeaturesEditor>
  )
}
