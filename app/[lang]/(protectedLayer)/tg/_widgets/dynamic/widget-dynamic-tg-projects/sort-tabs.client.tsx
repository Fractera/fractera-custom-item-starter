"use client"
// @local — the order switch of the Mini App's projects (node step 821; the owner, Telegram 412: «популярные … в которых больше всего
// страниц, актуальные … в которых установлены задачи в Cron»): three lists drawn on the server, the person's choice lives here only.

import type { ReactNode } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type Props = { label: string; words: { all: string; popular: string; actual: string }; all: ReactNode; popular: ReactNode; actual: ReactNode }

export function SortTabs({ label, words, all, popular, actual }: Props) {
  return (
    <Tabs className="gap-5" data-block="tg-projects-sort" defaultValue="all">
      <TabsList aria-label={label} className="grid h-9 w-full grid-cols-3">
        <TabsTrigger value="all">{words.all}</TabsTrigger>
        <TabsTrigger value="popular">{words.popular}</TabsTrigger>
        <TabsTrigger value="actual">{words.actual}</TabsTrigger>
      </TabsList>
      <TabsContent data-block="ba5we" className="flex flex-col gap-6" value="all">{all}</TabsContent>
      <TabsContent data-block="f67tj" className="flex flex-col gap-6" value="popular">{popular}</TabsContent>
      <TabsContent data-block="qhw0g" className="flex flex-col gap-6" value="actual">{actual}</TabsContent>
    </Tabs>
  )
}
