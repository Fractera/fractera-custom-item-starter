"use client"

import { useState } from "react"
import { CheckIcon, PrinterIcon, Share2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"

// SHARE AND PRINT (node step 518-2; owner 2026-10-17: «кнопочка поделиться этим отзывом. И распечатать этот отзыв в формате PDF»).
// Share: the system share sheet where the browser has one (`navigator.share`), otherwise the link is copied — with the old `execCommand`
// as the fallback outside a secure context, and a failure that says what to do instead of repeating the button's label (ANTI-PATTERNS:
// «Возможность браузера есть только на HTTPS»). Print: the browser's own print, where «Save as PDF» is a destination; the page's print
// styles hide the site's header, footer and these buttons. No server makes a PDF.

export type ReviewActionsWords = { share: string; copyLink: string; copied: string; copyFailed: string; print: string }

export function ReviewActions({ url, title, words }: { url: string; title: string; words: ReviewActionsWords }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle")

  const share = async () => {
    if (typeof navigator.share === "function") {
      try { await navigator.share({ title, url }); return } catch (e) { if ((e as Error)?.name === "AbortError") return }
    }
    let ok = false
    try { await navigator.clipboard.writeText(url); ok = true } catch {
      const t = document.createElement("textarea")
      t.value = url
      document.body.appendChild(t)
      t.select()
      try { ok = document.execCommand("copy") } catch { ok = false }
      t.remove()
    }
    setState(ok ? "copied" : "failed")
    if (ok) setTimeout(() => setState("idle"), 1800)
  }

  return (
    <div className="flex flex-col gap-2 print:hidden" data-review-actions>
      <div className="flex flex-wrap gap-3">
        <Button onClick={share} data-review-share>
          {state === "copied" ? <CheckIcon aria-hidden /> : <Share2Icon aria-hidden />}
          {state === "copied" ? words.copied : words.share}
        </Button>
        <Button variant="outline" onClick={() => window.print()} data-review-print>
          <PrinterIcon aria-hidden />
          {words.print}
        </Button>
      </div>
      {state === "failed" && <p className="text-sm text-destructive">{words.copyFailed}</p>}
    </div>
  )
}
