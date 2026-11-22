"use client"

import { useEffect, useState, type ReactNode } from "react"
import { Check, Copy, TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { H3, Small } from "@/components/ui/typography"

// ОБЩИЕ СТУПЕНИ ЛЕСТНИЦЫ НАСТРОЙКИ ПРОВАЙДЕРА (266-1).
//
// 🔒 ВЫНЕСЕНЫ ИЗ ЭКРАНА GOOGLE В ТОТ ДЕНЬ, КОГДА ПОЯВИЛСЯ ВТОРОЙ ЭКРАН. Два экрана
// с одинаковыми ступенями, собранные врозь, расходятся молча: в одном поправят
// отступ или подпись кнопки копирования, во втором — нет, и никто этого не
// заметит, потому что оба по отдельности выглядят правильно. Требование владельца
// того же дня — переиспользовать проверенная секция, а не строить похожий рядом.
//
// 🔒 ЗДЕСЬ ТОЛЬКО ФОРМА, А НЕ СЛОВА. Каждый экран приносит свои строки: общий
// модуль не знает ни одного слова, иначе он стал бы словарём, который тянет в
// браузер строки всех провайдеров сразу.

/** Ступень лестницы: номер в кружке, заголовок и содержимое. */
export function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section data-block="ekhs1" className="rounded-lg border border-border bg-card p-4" data-step={n}>
      <H3 data-block="f8zmn" className="mb-2 flex items-center gap-2" variant="ui">
        <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs">
          {n}
        </span>
        {title}
      </H3>
      {children}
    </section>
  )
}

/**
 * Маршрут по чужой панели: пронумерованные точки на горизонтальной линии (265-5).
 *
 * 🔒 ФОРМУ ВЫБРАЛ ВЛАДЕЛЕЦ 2026-09-22: путь по консоли Google длинный, и тринадцать
 * абзацев в карточке не читаются. Линия показывает ДЛИНУ пути сразу, подсказка —
 * одно действие за раз.
 *
 * 🛑 ПОДСКАЗКА ПО НАВЕДЕНИЮ НЕ СУЩЕСТВУЕТ НА ТЕЛЕФОНЕ. Поэтому номер — кнопка:
 * наведение показывает подсказку, нажатие закрепляет тот же текст под линией.
 * Иначе на касании маршрут был бы рядом пустых кружков.
 */
export function RouteLine({ items, hint }: { items: { title: string; text: string }[]; hint: string }) {
  const [picked, setPicked] = useState<number | null>(null)
  const current = picked === null ? null : items[picked]
  return (
    <TooltipProvider delayDuration={100}>
      <div data-block="kqhbq" className="mt-3" data-route-line>
        {/* Прокрутка внутри карточки, а не у страницы: на узком экране линия
            длиннее ширины, и страница не должна ехать вбок. */}
        <ol data-block="vjlvk" className="flex items-start overflow-x-auto pb-2">
          {items.map((it, i) => (
            <li data-block="lvhsh" key={it.title} className="flex shrink-0 items-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    size="icon"
                    variant={picked === i ? "default" : "outline"}
                    onClick={() => setPicked(picked === i ? null : i)}
                    aria-pressed={picked === i}
                    aria-label={`${i + 1}. ${it.title}`}
                    className="size-7 rounded-full text-xs"
                  >
                    {i + 1}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-64">
                  <span className="block font-medium">{it.title}</span>
                  <span className="block">{it.text}</span>
                </TooltipContent>
              </Tooltip>
              {i < items.length - 1 && <span className="h-px w-5 bg-border sm:w-7" aria-hidden />}
            </li>
          ))}
        </ol>
        {current ? (
          <div data-block="b8qzw" className="mt-2 rounded-md border border-border px-3 py-2 text-sm" role="status">
            <span className="block font-medium text-foreground">
              {(picked ?? 0) + 1}. {current.title}
            </span>
            <span className="block text-muted-foreground">{current.text}</span>
          </div>
        ) : (
          <Small data-block="ih4kl" className="mt-1 block text-muted-foreground">{hint}</Small>
        )}
      </div>
    </TooltipProvider>
  )
}

/**
 * Карточка-предупреждение о бесплатных лимитах провайдера (265-5, слово владельца
 * 2026-09-22: «максимально компактно»). Одна на оба экрана: цифры у каждого свои
 * и приходят словами, а ссылка ведёт к первоисточнику — цифры чужого тарифа
 * меняются без нашего ведома, и человек обязан уметь проверить их сам.
 */
export function LimitsNote({ title, text, more, href }: { title: string; text: string; more: string; href: string }) {
  return (
    <p data-block="aw4lk"
      className="flex gap-2 rounded-md border border-warning/50 bg-warning/10 px-3 py-2 text-sm"
      data-limits-note
      role="note"
    >
      <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
      <span>
        <span className="font-medium text-foreground">{title}</span>{" "}
        <span className="text-muted-foreground">{text}</span>{" "}
        <a href={href} target="_blank" rel="noreferrer noopener" className="whitespace-nowrap underline underline-offset-2">
          {more}
        </a>
      </span>
    </p>
  )
}

/** Маркированный список внутри ступени. */
export function StepPoints({ items }: { items: string[] }) {
  return (
    <ul data-block="aywk9" className="mt-2 flex list-disc flex-col gap-1 pl-5 text-foreground text-sm">
      {items.map((t) => (
        <li data-block="vrshk" key={t}>{t}</li>
      ))}
    </ul>
  )
}

/** Строка-значение с кнопкой «скопировать». */
export function CopyRow({
  id,
  label,
  value,
  note,
  copy,
  copied,
  editable = false,
}: {
  id: string
  label: string
  value: string
  note?: string
  copy: string
  copied: string
  /** The owner, 2026-11-19: the bot's suggested name and username «могли быть отредактированы при необходимости» — the field takes the
   *  person's own text and «Копировать» copies what stands in it now. */
  editable?: boolean
}) {
  const [done, setDone] = useState(false)
  const [text, setText] = useState(value)
  useEffect(() => { setText(value) }, [value])
  const shown = editable ? text : value
  return (
    <div data-block="buxs0" className="mt-3 flex flex-col gap-1">
      <Label htmlFor={id}>{label}</Label>
      <div data-block="wmz4j" className="flex gap-2">
        {editable
          ? <Input id={id} value={text} onChange={(e) => setText(e.target.value)} className="font-mono" spellCheck={false} autoCapitalize="none" autoCorrect="off" />
          : <Input id={id} readOnly value={value} className="font-mono text-xs" />}
        <Button
          type="button"
          variant="outline"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(shown)
              setDone(true)
              window.setTimeout(() => setDone(false), 2000)
            } catch {
              // Копирование запрещено политикой страницы — строка видна и
              // выделяется руками. Молча ничего не происходит, и это законно.
            }
          }}
        >
          {done ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
          <span className="ml-2">{done ? copied : copy}</span>
        </Button>
      </div>
      {note && <Small data-block="hautt" className="text-muted-foreground">{note}</Small>}
    </div>
  )
}
