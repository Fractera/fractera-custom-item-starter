import { SECTIONS, isSection, type SectionItem } from '@/components/sections'
import type { PageItem, FaqPair } from '@/lib/content/page-items'
import { resolveMarkdownLinks } from '@/lib/content/links'

// Блоки страницы → markdown (шаг 505, AIO).
//
// ЗАЧЕМ. Публичная страница существует в двух видах: HTML для человека и markdown
// для машины. Второй нужен затем, что модель, пришедшая за содержимым сайта,
// разбирает разметку страницы вместе с меню, подвалом, баннером согласия и
// скриптами — и половину контекста тратит на то, что к содержимому отношения не
// имеет. Markdown отдаёт ровно текст.
//
// 🔒 ИСТОЧНИК ОДИН. Обе формы собираются из ОДНИХ И ТЕХ ЖЕ блоков, поэтому
// разойтись не могут: отредактировал текст — изменились обе. Отдельный файл с
// «версией для ИИ» разошёлся бы с сайтом на первой же правке, и никто бы этого
// не заметил, потому что в браузере его никто не открывает.
//
// Инлайновая разметка (`**жирный**`, `[метка](адрес)`) в наших блоках УЖЕ
// markdown — переносится как есть.
//
// 🔒 КРОМЕ ОДНОЙ ФОРМЫ, И ИМЕННО НА НЕЙ ЭТО ОБЕЩАНИЕ ЛОМАЛОСЬ (2026-08-17).
// Ссылка на корень пишется `[%SITE%](/en)` — это не markdown, а соглашение
// проекта, которое раскрывает рендерер: подпись становится названием сайта.
// Машинная версия «переносила как есть» и отдавала дословный `%SITE%` с
// относительным адресом, который вне сайта не разрешается ни во что. То есть
// ровно та ссылка, ради которой правило и придумано, до машины не доезжала.
// Раскрывает её теперь `resolveMarkdownLinks` — там же, где живут все прочие
// решения о ссылках, чтобы обе формы страницы не разошлись снова.

/** Текст виджета по его имени (`_widgets/markdown.ts` ветки); виджет без текста — пустая строка. */
export type WidgetText = (kind: string) => string

function lines(block: PageItem, widget?: WidgetText): string[] {
  // 717-2: a section brings its own words (`components/sections/<kind>/markdown.ts`).
  if (isSection(block.kind)) return (SECTIONS[block.kind].markdown as (s: unknown) => string[])(block)
  // 428: виджет ветки несёт свой текст (лендинг — поле `landing` данных, форма — свои строки), и в копию он приходит через
  // `markdown(lang)` в папке виджета. 🪦 Здесь стояло «его слова уже в машинной версии» — неверно: главная отдавала 159 байт.
  if (block.kind.startsWith('widget-')) {
    const text = widget ? widget(block.kind).trim() : ''
    return text ? [text] : []
  }
  const section = block as Exclude<PageItem, { kind: `widget-${string}` } | SectionItem>
  // 314-2, 706-5: виды набора элемента (`components/sections/index.ts`). Проверка ИСЧЕРПЫВАЮЩАЯ: новый вид в `types.ts` без своей
  // строки здесь не соберётся (`never` ниже) — машинная копия страницы не может молча потерять текст секции, которую агент написал сам.
  switch (section.kind) {
    // 423: типографика элемента — сама почти Markdown.
    case 'text-h2':
      return [`## ${section.text}`]
    case 'text-h3':
      return [`### ${section.text}`]
    case 'text-h4':
      return [`#### ${section.text}`]
    case 'text-p':
    case 'text-lead':
    case 'text-small':
      return [section.text]
    case 'text-list':
      return section.items.map((t, i) => (section.ordered ? `${i + 1}. ${t}` : `- ${t}`))
    case 'text-quote':
      return [`> ${section.text}`, ...(section.cite ? [`> — ${section.cite}`] : [])]
    case 'text-code':
      return ['```', section.text, '```']
    case 'text-table': {
      const row = (cells: string[]) => `| ${cells.map((c) => c.replace(/\|/g, '\\|')).join(' | ')} |`
      const RULE: Record<string, string> = { left: ':---', center: ':---:', right: '---:' }
      const rule = section.head.map((_, i) => RULE[section.align?.[i] ?? ''] ?? '---')
      return [row(section.head), `| ${rule.join(' | ')} |`, ...section.rows.map(row)]
    }
    default: {
      const unhandled: never = section
      return unhandled
    }
  }
}

/**
 * 🔒 `siteName` ОБЯЗАТЕЛЕН, И ЭТО ИСПРАВЛЕНИЕ, А НЕ УДОБСТВО (2026-08-17).
 *
 * Комментарий вверху файла обещал, что инлайновая разметка «уже markdown и
 * переносится как есть». Для жирного и обычных ссылок это правда, для одной
 * формы — нет: `[%SITE%](/en)` раскрывает рендерер, и без него машина получала
 * дословный `%SITE%` и относительный адрес, который вне сайта не разрешается ни
 * во что. Параметр сделан ОБЯЗАТЕЛЬНЫМ намеренно: с умолчанием следующая
 * поверхность молча забыла бы его передать, и дефект вернулся бы туда же.
 */
export function pageToMarkdown(body: PageItem[], siteName: string, widget?: WidgetText): string {
  return resolveMarkdownLinks(
    body
      .flatMap(b => [...lines(b, widget), ''])
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim(),
    siteName,
  )
    // Узел, шаг 450-1: голый `%SITE%` (заголовок секции, пункт списка) — тоже имя сайта, как на самой странице.
    .split('%SITE%')
    .join(siteName)
}

/**
 * Вопросы и ответы отдельным разделом.
 *
 * Форма пары — `{ q, a }` из набора секций (`FaqPair`), а не
 * `{ question, answer }`: типы поймали это на сборке, и подгонять надо код под
 * набор, а не наоборот — набор читают ещё и разметка страницы, и JSON-LD.
 */
export function faqToMarkdown(faq?: FaqPair[]): string {
  if (!faq?.length) return ''
  return ['## FAQ', '', ...faq.flatMap(f => [`### ${f.q}`, '', f.a, ''])].join('\n').trim()
}
