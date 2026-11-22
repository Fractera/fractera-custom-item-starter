"use client"
// @local — «Как начать» on the home screen of this element's Mini App (node step 840-4; the owner, Telegram 954: «первый вводный текст
// который пользователь должен закрывать … кнопку прочитано»): shown until «Прочитано», remembered in this browser (localStorage); the
// drawer's item «Как начать» opens the same text as its own screen, so it is never lost. Drawn after hydration — nothing for a crawler.

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import type { TgIntroUi } from "./tg-intro.i18n"

const KEY = "tg-intro-read"

/** The text itself — the home card and the screen «Как начать» share it. */
export function TgIntroText({ ui }: { ui: TgIntroUi }) {
  return (
    <div className="flex flex-col gap-2 text-[length:var(--fs-body)] leading-normal" data-block="tg-intro-text">
      <p data-block="tgi01">{ui.start}</p>
      <p data-block="tgi02" className="text-muted-foreground">{ui.build}</p>
      <p data-block="tgi03" className="font-medium">{ui.wish}</p>
    </div>
  )
}

export function TgIntro({ ui }: { ui: TgIntroUi }) {
  const [show, setShow] = useState(false)
  useEffect(() => {
    try { setShow(localStorage.getItem(KEY) !== "1") } catch { setShow(true) }
  }, [])
  if (!show) return null
  return (
    <section className="flex flex-col gap-3 rounded-xl bg-[var(--tg-card)] px-4 py-4" data-block="tg-intro">
      <TgIntroText ui={ui} />
      <Button className="self-start" data-block="tg-intro-read" onClick={() => { try { localStorage.setItem(KEY, "1") } catch { /* private mode */ } setShow(false) }} type="button">{ui.read}</Button>
    </section>
  )
}
