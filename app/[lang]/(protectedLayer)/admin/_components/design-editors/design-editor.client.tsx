'use client'

// РЕДАКТОР РАЗДЕЛА СВОЕГО ОФОРМЛЕНИЯ ЭЛЕМЕНТА (579-1) — загрузчик элемента «Дизайн», перенесённый на дверь этого элемента.
// Четыре редактора — дословные копии «Дизайна»: та же мастерская, но решения ложатся в `DESIGN-CONFIG` одного элемента.
//
// 🛑 Отказ двери — СОСТОЯНИЕ («войдите», «не архитектор», «вход недоступен», «ошибка», «ведёт общий Дизайн»), а не пустые
// настройки: пустой редактор при отказе предложил бы сохранить пустоту поверх настоящего оформления.
import { useEffect, useState } from 'react'
import { DesignColors } from './design-colors.client'
import { DesignFonts } from './design-fonts.client'
import { DesignType } from './design-type.client'
import { DesignShape } from './design-shape.client'
import type { DesignUi } from './design.i18n'
import { loadDesign, type Access, type AccessWords } from './settings-access'
import { AccessNotice } from './access-notice'

export type DesignSection = 'colors' | 'fonts' | 'type' | 'shape'

type Raw = {
  colors?: { light?: Record<string, string>; dark?: Record<string, string> }
  fonts?: Record<string, { family: string; import?: string }>
  type?: { scale?: number; leading?: number }
  shape?: { radius?: string; borderWidth?: string; spaceScale?: number; appWidth?: string }
}

export type DesignEditorProps = {
  section: DesignSection
  ui: Pick<DesignUi, DesignSection>
  words: AccessWords
  loginHref?: string
  /** Связь включена: страница общего «Дизайна» в ядре и выключатель связи элемента. */
  designHref?: string
  settingsHref?: string
}

export function DesignEditorIsland({ section, ui, words, loginHref, designHref, settingsHref }: DesignEditorProps) {
  const [access, setAccess] = useState<Access>('loading')
  const [config, setConfig] = useState<Raw | null>(null)

  useEffect(() => {
    loadDesign().then((r) => {
      setAccess(r.access)
      setConfig(r.config as Raw | null)
    })
  }, [])

  if (access !== 'ok' || !config) {
    return <AccessNotice access={access} words={words} loginHref={loginHref} designHref={designHref} settingsHref={settingsHref} />
  }

  const c = config
  return section === 'colors' ? (
    <DesignColors initial={{ light: c.colors?.light ?? {}, dark: c.colors?.dark ?? {} }} ui={ui.colors} />
  ) : section === 'fonts' ? (
    <DesignFonts initial={c.fonts ?? {}} ui={ui.fonts} />
  ) : section === 'type' ? (
    <DesignType initial={c.type ?? {}} ui={ui.type} />
  ) : (
    <DesignShape initial={c.shape ?? {}} ui={ui.shape} />
  )
}
