"use client"

import { useState } from "react"
import Link from "next/link"
import { Loader2, Search, ThumbsDownIcon, ThumbsUpIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { P, Small } from "@/components/ui/typography"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious, PaginationFirst, PaginationLast,
} from "@/components/ui/pagination"

// THE REVIEWS LIST WITH SERVER SEARCH AND PAGES (node step 518-7). The owner, 2026-10-17: «сделать вкладку поиск и пагинацию у нас есть
// стандартная таблица … представь если человек по 10 по 15 по 50 работ делает в день. Это должно быть серверный поиск».
// The first page comes from the server inside the static HTML (search engines read it); searching and turning pages ask the door
// `GET /api/reviews?q=&page=&perPage=&lang=`, which queries the data layer with LIMIT/OFFSET. The parts are the element's standard table
// (`admin/_widgets/dynamic/widget-dynamic-users-table`): a field with a button, then the rows, then the count, the page size and the arrows.
// The arrows stay visible on a single page — greyed, so the control is seen to exist (the users table's rule).
//
// Polish (impeccable `polish`, owner: «Добавь слева картинку тот самый снимет … привёл в порядок эту страницу»): every row opens with the
// page's own snippet on the left (1200×630, width and height set so nothing shifts, lazy), the title and the facts beside it; a search
// says what it found and offers «show all» to leave the results; one spacing rhythm — search, results line, rows, pager.

export type ListRow = { slug: string; title: string; description: string; counterpart: string; verdict: "like" | "dislike"; score: number; createdAt: string }

export type ReviewsListWords = {
  with: string; verdict: { like: string; dislike: string }; empty: string
  searchPlaceholder: string; search: string; nothingFound: string; count: string; perPage: string; pageOf: string; found: string; showAll: string
  first: string; prev: string; next: string; last: string; failed: string
}

const SIZES = [10, 20, 50]
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

export function ReviewsList({ lang, words, initial }: { lang: string; words: ReviewsListWords; initial: { rows: ListRow[]; total: number; perPage: number } }) {
  const [rows, setRows] = useState(initial.rows)
  const [total, setTotal] = useState(initial.total)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(initial.perPage)
  const [query, setQuery] = useState("")
  const [asked, setAsked] = useState("")
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)
  const pages = Math.max(1, Math.ceil(total / perPage))

  const load = async (next: { page: number; perPage: number; q: string }) => {
    setLoading(true)
    setFailed(false)
    try {
      const sp = new URLSearchParams({ q: next.q, page: String(next.page), perPage: String(next.perPage), lang })
      const r = await fetch(`${BASE}/api/reviews?${sp}`, { cache: "no-store" })
      const d = (await r.json()) as { ok: boolean; rows: ListRow[]; total: number; page: number; perPage: number }
      if (!d.ok) throw new Error("not ok")
      setRows(d.rows); setTotal(d.total); setPage(d.page); setPerPage(d.perPage); setAsked(next.q)
    } catch {
      setFailed(true)
    } finally {
      setLoading(false)
    }
  }

  const off = (cond: boolean) => (cond ? "pointer-events-none opacity-40" : "")
  const date = (iso: string) => new Date(iso).toLocaleDateString(lang, { day: "numeric", month: "long", year: "numeric" })

  if (initial.total === 0 && !asked) return <P className="max-w-[70ch] text-muted-foreground" data-reviews-empty>{words.empty}</P>

  return (
    <div className="flex flex-col gap-5" data-reviews-browser>
      <form
        role="search"
        className="flex max-w-xl gap-2"
        onSubmit={(e) => { e.preventDefault(); void load({ page: 1, perPage, q: query.trim() }) }}
      >
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={words.searchPlaceholder} aria-label={words.searchPlaceholder} data-reviews-query />
        <Button type="submit" variant="secondary" disabled={loading} data-reviews-search>
          {loading ? <Loader2 aria-hidden className="animate-spin" /> : <Search aria-hidden />}
          {words.search}
        </Button>
      </form>

      {(asked || failed) && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1" data-reviews-results>
          {asked && !failed && <Small className="tabular-nums">{words.found.replace("{q}", asked).replace("{count}", String(total))}</Small>}
          {failed && <Small className="text-destructive">{words.failed}</Small>}
          {asked && (
            <Button type="button" variant="link" size="sm" className="h-auto px-0" onClick={() => { setQuery(""); void load({ page: 1, perPage, q: "" }) }} data-reviews-show-all>
              {words.showAll}
            </Button>
          )}
        </div>
      )}

      {rows.length === 0 ? (
        <P className="text-muted-foreground" data-reviews-nothing>{words.nothingFound.replace("{q}", asked)}</P>
      ) : (
        <ul className={`divide-y divide-border border-y border-border ${loading ? "opacity-60" : ""}`} data-reviews-list aria-busy={loading}>
          {rows.map((p) => {
            const like = p.verdict === "like"
            return (
              <li key={p.slug} className="grid grid-cols-[7.5rem_1fr] items-start gap-x-4 gap-y-2 py-6 sm:grid-cols-[13rem_1fr] sm:gap-x-6" data-reviews-item={p.slug}>
                <Link href={`/${lang}/reviews/${p.slug}`} tabIndex={-1} aria-hidden className="row-span-3 block overflow-hidden rounded-[calc(var(--radius)*0.75)] border border-border bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/${lang}/reviews/${p.slug}/snippet.png`} alt="" width={1200} height={630} loading="lazy" decoding="async" className="aspect-[1200/630] h-auto w-full object-cover" data-reviews-thumb />
                </Link>
                <Small className="flex flex-wrap items-center gap-x-4 gap-y-1 tabular-nums">
                  <span className={`inline-flex items-center gap-1.5 font-medium ${like ? "text-primary" : "text-destructive"}`}>
                    {like ? <ThumbsUpIcon aria-hidden className="size-4" /> : <ThumbsDownIcon aria-hidden className="size-4" />}
                    {words.verdict[p.verdict]}
                  </span>
                  <span>{p.score} / 10</span>
                  <span>{words.with}: <span className="font-mono">{p.counterpart}</span></span>
                  <time dateTime={p.createdAt}>{date(p.createdAt)}</time>
                </Small>
                <Link href={`/${lang}/reviews/${p.slug}`} className="text-xl font-semibold text-foreground underline-offset-4 hover:underline focus-visible:underline">{p.title}</Link>
                <P className="m-0 max-w-[70ch] text-muted-foreground">{p.description}</P>
              </li>
            )
          })}
        </ul>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 pt-2" data-reviews-pager>
        <Small className="tabular-nums" data-reviews-total={total}>{words.count.replace("{count}", String(total))}</Small>
        <div className="flex items-center gap-1.5 sm:gap-3">
          <div className="flex items-center gap-1">
            <span className="hidden text-xs text-muted-foreground sm:inline">{words.perPage}</span>
            <Select value={String(perPage)} onValueChange={(v) => void load({ page: 1, perPage: Number(v), q: asked })}>
              <SelectTrigger className="h-8 w-[68px] px-2 text-xs" aria-label={words.perPage}><SelectValue /></SelectTrigger>
              <SelectContent>
                {SIZES.map((s) => <SelectItem key={s} value={String(s)} className="text-xs">{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Pagination className="mx-0 w-auto justify-end">
            <PaginationContent>
              <PaginationItem><PaginationFirst title={words.first} aria-disabled={page <= 1} className={off(page <= 1)} onClick={() => void load({ page: 1, perPage, q: asked })} /></PaginationItem>
              <PaginationItem><PaginationPrevious title={words.prev} aria-disabled={page <= 1} className={off(page <= 1)} onClick={() => void load({ page: page - 1, perPage, q: asked })} /></PaginationItem>
              <PaginationItem>
                <span className="px-2 text-xs tabular-nums text-muted-foreground" data-reviews-page={page}>
                  {words.pageOf.replace("{page}", String(page)).replace("{pages}", String(pages))}
                </span>
              </PaginationItem>
              <PaginationItem><PaginationNext title={words.next} aria-disabled={page >= pages} className={off(page >= pages)} onClick={() => void load({ page: page + 1, perPage, q: asked })} /></PaginationItem>
              <PaginationItem><PaginationLast title={words.last} aria-disabled={page >= pages} className={off(page >= pages)} onClick={() => void load({ page: pages, perPage, q: asked })} /></PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  )
}
