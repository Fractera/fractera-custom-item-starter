import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"

// Скелетон ЭТОЙ таблицы — её собственные колонки, до нажатия «Показать записи».
//
// 🔒 ПОЧЕМУ НЕ ОБЩИЙ (шаг 521, названо владельцем критическим). Общий скелетон заранее решает, что все таблицы одной формы, и чужая
// рама означала бы, что разметка дёрнется, когда придёт ответ. Колонки приходят списком подписей той же таблицы (580-3: таблица стала
// окном вкладки «Пользователи» — пользователь, email, роли, способ входа, статус, регистрация, последний вход).
//
// Рама и заголовки статические: они известны до всякого запроса и рисуются без JavaScript — вместо пустого «Загрузка…».
const ROWS = 5
const WIDTHS = ["w-40", "w-48", "w-24", "w-16", "w-16", "w-20", "w-20"]

export function UsersTableSkeleton({ labels }: { labels: string[] }) {
  return (
    <div data-block="gmegg" className="overflow-hidden rounded-xl border border-border">
      <Table data-block="v7enf" className="w-full text-xs">
        <TableHeader>
          <TableRow className="border-b border-border bg-muted/40">
            {labels.map((l) => (
              <TableHead key={l} className="px-4 py-2.5 text-left font-medium text-muted-foreground">{l}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: ROWS }, (_, i) => (
            <TableRow key={i} className={`border-b border-border last:border-0 ${i % 2 !== 0 ? "bg-muted/20" : ""}`}>
              {labels.map((l, c) => (
                <TableCell key={l} className="px-4 py-2.5"><Skeleton className={`h-4 ${WIDTHS[c] ?? "w-16"}`} /></TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
