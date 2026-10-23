// СВОИ НАСТРОЙКИ САЙТА ЭЛЕМЕНТА ИЗ БРАУЗЕРА (шаг 579-2). Редакторы — копии CONFIG (шапка, подвал, функции, баннер cookie); ходят
// они не в общий CONFIG, а в двери этого элемента внутри его ветки (закон 422): `/<язык>/admin/api/settings/app` пишет `APP-CONFIG`,
// `/<язык>/admin/api/settings/platform` — `PLATFORM-CONFIG`. Тело то же, что у CONFIG: выключатели плоско (`{ "topMenu": true }`).
// 🔒 Отказ двери — это СОСТОЯНИЕ, а не пустые настройки (урок 2026-09-25). `linked` — связь с CONFIG включена: настройки приходят
// оттуда и лягут поверх любой правки здесь, поэтому редактор не рисуется, а запись отвечает 409.
export type SettingsKind = 'app' | 'platform'
export type Access = 'loading' | 'ok' | 'linked' | 'signin' | 'forbidden' | 'unavailable' | 'error'
export type Loaded = { access: Access; config: Record<string, unknown> | null }

const accessOf = (status: number): Access =>
  status === 200 ? 'ok' : status === 409 ? 'linked' : status === 401 ? 'signin' : status === 403 ? 'forbidden' : status === 503 ? 'unavailable' : 'error'

/** Адрес двери по виду — один источник для всех островков (✗ 425: два места собирали его сами и стучались в 404). */
export function ownSettingsUrl(kind: SettingsKind): string {
  const lang = (typeof document !== 'undefined' && document.documentElement.lang) || 'en'
  return `/${lang}/admin/api/settings/${kind}`
}

export async function loadSettings(kind: SettingsKind): Promise<Loaded> {
  try {
    const r = await fetch(ownSettingsUrl(kind), { cache: 'no-store' })
    const body = await r.json().catch(() => null)
    const access = r.status === 200 && body?.linked ? 'linked' : accessOf(r.status)
    return { access, config: access === 'ok' && body?.ok ? (body.config as Record<string, unknown>) : null }
  } catch {
    return { access: 'unavailable', config: null }
  }
}

export async function saveSettings(kind: SettingsKind, patch: Record<string, unknown>): Promise<Loaded> {
  try {
    const r = await fetch(ownSettingsUrl(kind), {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(patch),
    })
    const body = await r.json().catch(() => null)
    const access = accessOf(r.status)
    return { access, config: access === 'ok' && body?.ok ? (body.config as Record<string, unknown>) : null }
  } catch {
    return { access: 'unavailable', config: null }
  }
}

export type AccessWords = {
  loading: string
  signin: string
  signinLink: string
  forbidden: string
  unavailable: string
  error: string
  /** Связь с CONFIG включена — где менять и как вести своё. */
  linked: string
  linkedConfig: string
  linkedSettings: string
}
