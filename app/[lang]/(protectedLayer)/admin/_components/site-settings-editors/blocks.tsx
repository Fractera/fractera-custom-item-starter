// СЕРВЕРНЫЕ ОБЁРТКИ СВОИХ НАСТРОЕК САЙТА ЭЛЕМЕНТА (шаг 579-2) — `blocks.tsx` CONFIG, перенесённый в элемент.
// Отличие одно, и оно в источнике: CONFIG спрашивает оболочку САЙТА ПРОЕКТА по петле, элемент берёт свою — `siteShellData`, ту же
// функцию, из которой рисуются его шапка и подвал: меню «как сейчас» в редакторе равно тому, что видит посетитель.
// Адреса (вход, общий CONFIG, связи элемента в ядре, страница о cookie) — из окружения узла; нет адреса — нет ссылки.
import { appDialogUi } from '@/components/dialog/app-dialog.i18n'
import { siteShellData } from '@/lib/shell/site-shell-data'
import type { ShellGroup } from '@/components/shell/shell-types'
import { ownId } from '@/lib/own-id'
import { ownSiteUrl } from '@/lib/own-site'
import { FeatureSwitchesIsland } from './feature-switches.client'
import { MenuEditorIsland } from './menu-editor.client'
import { CookieBannerIsland } from './cookie-banner.client'
import { groupsUi } from './groups.i18n'
import { siteSettingsEditorWords } from './editor-words.i18n'
import type { NavCandidate, NavItem, NavSlot } from './lib/nav'

const SITE = (process.env.PROJECT_SITE_URL ?? '').replace(/\/+$/, '')
const CORE = (process.env.ARCHITECT_URL ?? '').trim().replace(/\/+$/, '')

function hrefs(lang: string) {
  const id = ownId()
  return {
    loginHref: SITE ? `${SITE}/login?lang=${lang}` : undefined,
    configHref: CORE ? `${CORE}/${lang}/architect/config` : undefined,
    settingsHref: CORE && id ? `${CORE}/${lang}/architect/${id}/settings/danger-zone` : undefined,
  }
}

function shellMenu(lang: string, slot: NavSlot): { current: NavItem[]; candidates: NavCandidate[] } {
  const shell = siteShellData(lang)
  const groups: ShellGroup[] = slot === 'top' ? shell.top : shell.footer
  const hrefOf = (g: ShellGroup) => g.href ?? `/${lang}/${g.slug}`
  const current: NavItem[] = groups.map((g, i) => ({
    id: g.slug,
    href: hrefOf(g),
    order: (i + 1) * 10,
    label: g.label,
    ...(g.children.length ? { children: g.children.filter((c) => c.href).map((c) => ({ id: c.slug, href: c.href as string, label: c.title })) } : {}),
  }))
  const seen = new Set<string>()
  const candidates: NavCandidate[] = []
  for (const g of [...shell.top, ...shell.footer]) {
    for (const c of [{ id: g.slug, href: hrefOf(g), title: g.label, section: g.label }, ...g.children.filter((c) => c.href).map((c) => ({ id: c.slug, href: c.href as string, title: c.title, section: g.label }))]) {
      if (!seen.has(c.href)) { seen.add(c.href); candidates.push(c) }
    }
  }
  return { current, candidates }
}

export function SiteMenuEditor({ lang, slot }: { lang: string; slot: NavSlot }) {
  const { current, candidates } = shellMenu(lang, slot)
  return <MenuEditorIsland slot={slot} editLang={lang} current={current} candidates={candidates} ui={groupsUi(lang)} words={siteSettingsEditorWords(lang).access} {...hrefs(lang)} />
}

export function SiteFeatureSwitches({ lang }: { lang: string }) {
  const w = siteSettingsEditorWords(lang)
  const f = w.features_words
  const core = CORE ? [{ label: f.linkCore, url: `${CORE}/${lang}/architect` }] : []
  // Свой адрес элемента — у узла (`domain.json`, поддомен в зоне узла); нет — ссылок на элемент нет.
  const OWN = (ownSiteUrl() ?? '').replace(/\/+$/, '')
  const own = OWN ? [{ label: f.linkSite, url: `${OWN}/${lang}` }, { label: f.linkAdmin, url: `${OWN}/${lang}/admin` }] : []
  return (
    <FeatureSwitchesIsland
      title=""
      note={w.note}
      features={w.features}
      words={{ ...w.access, ...f }}
      links={[...own, ...core]}
      dialogUi={appDialogUi(lang)}
      {...hrefs(lang)}
    />
  )
}

// Правовая страница о cookie живёт у этого элемента (`/<язык>/cookies`, публичная ветка шаблона).
export function SiteCookieBanner({ lang }: { lang: string }) {
  return <CookieBannerIsland ui={groupsUi(lang)} words={siteSettingsEditorWords(lang).access} policyHref={`/${lang}/cookies`} {...hrefs(lang)} />
}
