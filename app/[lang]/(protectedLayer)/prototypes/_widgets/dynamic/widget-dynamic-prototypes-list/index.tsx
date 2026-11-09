import Link from "next/link"
import { listPrototypes } from "@/lib/prototypes"
import { prototypesListWords } from "./words.i18n"

// Список прототипов дизайна элемента (узел, шаг 711-4): каждый — навык, исходная страница, референсы, статус и ссылка. Читается во
// время работы: новый прототип появляется без пересборки.
export function Widget({ lang }: { lang: string }) {
  const w = prototypesListWords(lang)
  const all = listPrototypes()
  if (all.length === 0) return <p data-block="pl4a1" className="my-4 text-[length:var(--fs-small)] text-muted-foreground">{w.empty}</p>
  return (
    <ul data-block="pl4a2" className="my-4 flex flex-col gap-3">
      {all.map((p) => (
        <li key={p.id} data-block="pl4a3" data-prototype-item={p.id} data-status={p.status} className="rounded-lg border border-border p-4">
          <p data-block="pl4a4" className="text-[length:var(--fs-body)] font-medium text-foreground">{p.title ?? p.id}</p>
          <p data-block="pl4a5" className="mt-1 text-[length:var(--fs-small)] text-muted-foreground">
            {w.skill}: {p.skill} · {w.from}: {p.from === "home" ? w.home : p.from} · {w.status[p.status]}
          </p>
          {p.references.length > 0 && (
            <p data-block="pl4a6" className="mt-1 text-[length:var(--fs-small)] text-muted-foreground">{w.references}: {p.references.length}</p>
          )}
          {p.status !== "archived" && (
            <Link data-block="pl4a7" href={`/${lang}/prototypes/${p.id}`} className="mt-2 inline-block text-[length:var(--fs-small)] text-primary underline-offset-4 hover:underline">{w.open}</Link>
          )}
        </li>
      ))}
    </ul>
  )
}
