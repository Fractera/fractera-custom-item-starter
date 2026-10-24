"use client"

import { Search } from "lucide-react"
import { type FormEvent, type ReactNode, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination"
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table"
import { Small } from "@/components/ui/typography"
import type { TableUi } from "./ui.i18n"

// ПОЛНЫЙ НАБОР ТАБЛИЦЫ С СЕРВЕРА: ПОИСК СВЕРХУ, СТРАНИЦЫ СНИЗУ — перенос из ядра (`components/table/server-table-tools.client.tsx`,
// шаги 559-4, 580-3). Строк ровно на одну страницу: поиск, отбор, сортировку и страницу считает служба входа, таблица только сообщает,
// чего хочет человек. Слова — свои у виджета (`ui.i18n.ts`, ключ `table`). В отличие от ядра — только компоненты `components/ui`
// (закон элемента `no-raw-control`: сырой тег не перекрашивается токенами и не получает адрес подсветки).

export const SERVER_PER_PAGE = [10, 25, 50, 100] as const
export type ServerTableQuery = { q: string; page: number; perPage: number }

export function ServerTableTools({
  head,
  rows,
  columns,
  words,
  total,
  query,
  onQuery,
  onReset,
  loading,
  filters,
  above,
}: {
  head: ReactNode
  /** Готовые строки `<tr>` текущей страницы. */
  rows: ReactNode[]
  columns: number
  words: TableUi
  /** Сколько строк подходит всего — по ответу сервера. */
  total: number
  query: ServerTableQuery
  onQuery: (next: ServerTableQuery) => void
  /** «Сбросить»: снять и свои отборы. Не передан — сбрасываются поиск, страница и размер. */
  onReset?: () => void
  loading?: boolean
  /** Отборы над таблицей (выпадающие списки, переключатели) — рядом с «Сбросить». */
  filters?: ReactNode
  /** Полоса между панелью и таблицей (действия над выбранными строками). */
  above?: ReactNode
}) {
  const [draft, setDraft] = useState(query.q)
  useEffect(() => setDraft(query.q), [query.q])

  const pages = Math.max(1, Math.ceil(total / query.perPage))
  const current = Math.min(query.page, pages)
  const from = total === 0 ? 0 : (current - 1) * query.perPage + 1
  const to = Math.min(total, (current - 1) * query.perPage + rows.length)
  const atFirst = current <= 1
  const atLast = current >= pages

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    onQuery({ ...query, q: draft.trim(), page: 1 })
  }

  return (
    <div data-block="lckox" className="my-6 flex flex-col gap-4" data-server-table={total} aria-busy={loading || undefined}>
      {/* ── ПАНЕЛЬ УПРАВЛЕНИЯ ТАБЛИЦЕЙ ─────────────────────────────────────── */}
      <div data-block="dkih6" className="flex flex-col gap-3 rounded-md border border-border p-3">
        <form data-block="rql4w" className="flex flex-wrap items-center gap-2" onSubmit={onSubmit} role="search">
          <div data-block="udv19" className="relative min-w-[16rem] flex-1">
            <Search aria-hidden className="-translate-y-1/2 absolute top-1/2 left-2.5 size-4 text-muted-foreground" />
            <Input
              aria-label={words.search}
              className="h-9 pl-8"
              data-table-search
              onChange={(e) => setDraft(e.target.value)}
              placeholder={words.search}
              type="search"
              value={draft}
            />
          </div>
          <Button size="sm" variant="outline" type="submit">
            {words.searchDo}
          </Button>
        </form>

        <div data-block="tflmd" className="flex flex-wrap items-center gap-2">
          {filters}
          <Button
            className="ml-auto"
            onClick={() => (onReset ? onReset() : onQuery({ q: "", page: 1, perPage: SERVER_PER_PAGE[0] }))}
            size="sm"
            type="button"
            variant="link"
          >
            {words.reset}
          </Button>
        </div>
      </div>

      {above}

      {/* ── ТАБЛИЦА ───────────────────────────────────────────────────────── */}
      <figure data-block="tsjfo" className={`overflow-x-auto rounded-2xl border border-border ${loading ? "opacity-60" : ""}`}>
        <Table data-block="lvanp" className="w-full border-collapse text-left text-sm">
          <TableHeader data-block="ekdcq">{head}</TableHeader>
          <TableBody data-block="uuyxl">
            {rows.length === 0 ? (
              <TableRow data-block="onlsm">
                <TableCell data-block="o1szo" className="px-4 py-3" colSpan={columns}>
                  <Small data-block="w5yy8" className="text-muted-foreground" data-table-empty>
                    {words.empty}
                  </Small>
                </TableCell>
              </TableRow>
            ) : (
              rows
            )}
          </TableBody>
        </Table>
      </figure>

      {/* ── СТРАНИЦЫ ───────────────────────────────────────────────────────── */}
      <div data-block="kd5p9" className="flex flex-wrap items-center justify-between gap-3">
        <Small data-block="n3udt" className="text-muted-foreground" data-table-shown>
          {words.shown.replace("{from}", String(from)).replace("{to}", String(to)).replace("{total}", String(total))}
        </Small>

        <div data-block="wgghg" className="flex items-center gap-2">
          <Small data-block="xzfvb" className="text-muted-foreground">{words.perPage}</Small>
          <div data-block="b97my" className="flex items-center gap-1 rounded-md border border-border p-0.5" data-filter="per">
            {SERVER_PER_PAGE.map((n) => (
              <Button
                aria-current={n === query.perPage ? "true" : undefined}
                key={n}
                onClick={() => onQuery({ ...query, perPage: n, page: 1 })}
                size="sm"
                type="button"
                variant={n === query.perPage ? "secondary" : "ghost"}
              >
                {n}
              </Button>
            ))}
          </div>
        </div>

        <Pagination className="mx-0 w-auto">
          <PaginationContent data-table-pager={`${current}/${pages}`}>
            <PaginationItem>
              <Button aria-label={words.first} disabled={atFirst} onClick={() => onQuery({ ...query, page: 1 })} size="sm" type="button" variant="outline">
                ««
              </Button>
            </PaginationItem>
            <PaginationItem>
              <Button aria-label={words.prev} disabled={atFirst} onClick={() => onQuery({ ...query, page: Math.max(1, current - 1) })} size="sm" type="button" variant="outline">
                {words.prev}
              </Button>
            </PaginationItem>
            <PaginationItem>
              <Small data-block="f79z8" className="px-2 text-muted-foreground">{words.page.replace("{n}", String(current)).replace("{of}", String(pages))}</Small>
            </PaginationItem>
            <PaginationItem>
              <Button aria-label={words.next} disabled={atLast} onClick={() => onQuery({ ...query, page: Math.min(pages, current + 1) })} size="sm" type="button" variant="outline">
                {words.next}
              </Button>
            </PaginationItem>
            <PaginationItem>
              <Button aria-label={words.last} disabled={atLast} onClick={() => onQuery({ ...query, page: pages })} size="sm" type="button" variant="outline">
                »»
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}
