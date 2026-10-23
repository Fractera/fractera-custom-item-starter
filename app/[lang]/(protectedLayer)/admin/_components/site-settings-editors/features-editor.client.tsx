"use client"

import { useMemo, useState, type ReactNode } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "./toast"
import { ownSettingsUrl } from "./settings-access"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { H3, P, Small } from "@/components/ui/typography"
import type { GroupsUi } from "./groups.i18n"

// ВЫКЛЮЧАТЕЛИ ВОЗМОЖНОСТЕЙ ПРОЕКТА (31-13, 2026-08-29).
//
// 🔒 ОДИН ЭЛЕМЕНТ НА ТРИ ГРУППЫ: куки-баннер, хедер и футер — каждая начинается с
// выключателя «показывать ли это вообще», и все три пишут в одну ветку
// `features` одного файла. Три копии разошлись бы молча, как расходятся любые
// копии; здесь это особенно дорого, потому что расхождение выглядело бы как
// «сохранилось в одной группе и не сохранилось в другой».
//
// 🔒 ВЫКЛЮЧЕННАЯ ВОЗМОЖНОСТЬ ОБЪЯСНЯЕТСЯ, А НЕ ПРОСТО ГАСНЕТ. Под переключателем
// стоит строка о том, что значит текущее положение: у куки-баннера выключенное
// состояние имеет правовые последствия, и человек должен прочесть об этом здесь,
// а не узнать от юриста.
//
// 🔒 ДЕТИ РИСУЮТСЯ ПОД ВЫКЛЮЧАТЕЛЕМ. Хедеру и футеру нужен список пунктов, куки-
// баннеру — ссылка на страницу политики. Класть их внутрь этого элемента значило
// бы сделать его знающим про три предмета сразу.
export function FeaturesEditor({
  title,
  hint,
  switches,
  ui,
  childrenGatedBy,
  children,
}: {
  title: string
  hint?: string
  /** Выключатели этой группы: ключ ветки `features`, подпись, объяснение. */
  switches: readonly {
    key: string
    label: string
    hint?: string
    /** Строка под переключателем, своя для каждого положения. */
    notice?: { on: string; off: string }
    initial: boolean
  }[]
  ui: GroupsUi
  /**
   * Ключ выключателя, от которого зависят дети.
   *
   * 🔒 ВЫКЛЮЧЕННАЯ ВОЗМОЖНОСТЬ НЕ ПОКАЗЫВАЕТ СВОИХ НАСТРОЕК (решение владельца
   * 2026-08-29). Список пунктов меню под погашенным «показывать это меню» —
   * приглашение править то, чего на сайте нет: человек расставляет порядок,
   * сохраняет и не находит результата. Именно отсутствующий, а не серый: серый
   * по-прежнему выглядит как работа, которую можно сделать.
   */
  childrenGatedBy?: string
  /**
   * Функция вместо узла — дети сохраняют выключатели СВОЕЙ кнопкой (299-8, слово владельца: «Зачем внизу две кнопки
   * продублированы? Поставь одну»). Своя кнопка тогда видна, только пока детей на экране нет (выключатель погашен).
   */
  children?: ReactNode | ((pending: { patch: Record<string, boolean> | null; commit: () => void }) => ReactNode)
}) {
  const [values, setValues] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(switches.map(s => [s.key, s.initial])),
  )
  const [saved, setSaved] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(switches.map(s => [s.key, s.initial])),
  )
  const [busy, setBusy] = useState(false)

  const changed = useMemo(
    () => switches.some(s => values[s.key] !== saved[s.key]),
    [switches, values, saved],
  )

  const showChildren = !childrenGatedBy || values[childrenGatedBy]
  // Одна кнопка на раздел: дети-функция несут её сами, пока видны.
  const ownButton = !(typeof children === 'function' && showChildren)

  async function save() {
    if (!changed) {
      toast.info(ui.nothingToSave)
      return
    }
    setBusy(true)

    // 🔒 ОТПРАВЛЯЮТСЯ ТОЛЬКО ТРОНУТЫЕ КЛЮЧИ. Прислать все значило бы записать в
    // файл как решение владельца и те выключатели, которых он не касался, — а
    // «выключено по умолчанию» и «выключил владелец» здесь разные состояния, и
    // читатель их различает.
    const features = Object.fromEntries(
      switches.filter(s => values[s.key] !== saved[s.key]).map(s => [s.key, values[s.key]]),
    )

    try {
      // 299-5: дверь элемента настроек; PLATFORM-CONFIG плоский, как у сайта (`featureOn(ключ)`).
      const res = await fetch(ownSettingsUrl("platform"), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(features),
      })
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean }
      if (!res.ok || !data.ok) {
        toast.error(ui.failed)
        setBusy(false)
        return
      }
      toast.success(ui.savedReload)
      setSaved({ ...values })
      setBusy(false)
    } catch {
      toast.error(ui.failed)
      setBusy(false)
    }
  }

  return (
    <div data-block="ibho5" data-features-editor className="flex flex-col gap-8">
      <section data-block="k0pca" className="flex flex-col gap-4">
        <div data-block="eexyf" className="flex flex-col gap-1">
          <H3 data-block="grbyy" variant="ui">{title}</H3>
          {hint && <Small data-block="kbab1" className="max-w-2xl">{hint}</Small>}
        </div>
        <Separator />

        <ul data-block="azaz4" className="flex flex-col gap-3">
          {switches.map(s => (
            <li data-block="hpovb" key={s.key} data-feature={s.key} data-on={values[s.key] ? "true" : "false"} className="flex flex-col gap-2">
              <div data-block="j5xmu" className="flex items-start justify-between gap-4 rounded-lg border border-border px-4 py-3">
                <div data-block="hpd1m" className="min-w-0">
                  <span className="block text-[length:var(--fs-body)] text-foreground">{s.label}</span>
                  {s.hint && <Small data-block="yos6l" className="mt-0.5 block">{s.hint}</Small>}
                </div>
                <Switch
                  checked={Boolean(values[s.key])}
                  aria-label={s.label}
                  onCheckedChange={next => setValues(prev => ({ ...prev, [s.key]: next }))}
                />
              </div>

              {/* Последствие текущего положения — своими словами, на своём месте.
                  У куки-баннера выключенное состояние правовое, а не косметическое. */}
              {s.notice && (
                <Small data-block="uaior"
                  data-feature-notice={values[s.key] ? "on" : "off"}
                  className={
                    values[s.key]
                      ? "px-1"
                      : "rounded-md border border-warning/50 bg-warning/10 px-3 py-2 text-foreground"
                  }
                >
                  {values[s.key] ? s.notice.on : s.notice.off}
                </Small>
              )}
            </li>
          ))}
        </ul>
      </section>

      {showChildren &&
        (typeof children === 'function'
          ? children({
              patch: changed
                ? Object.fromEntries(switches.filter(s => values[s.key] !== saved[s.key]).map(s => [s.key, values[s.key]]))
                : null,
              commit: () => setSaved({ ...values }),
            })
          : children)}

      {ownButton && (
      <div data-block="lj96d" className="flex items-center gap-3">
        <Button type="button" onClick={save} disabled={busy || !changed} data-save className="h-10 px-5">
          {busy && <Loader2 className="size-4 animate-spin" aria-hidden />}
          {busy ? ui.saving : ui.save}
        </Button>
        {!changed && <P data-block="yhyan" className="text-[length:var(--fs-small)] text-muted-foreground">{ui.nothingToSave}</P>}
      </div>
      )}
    </div>
  )
}
