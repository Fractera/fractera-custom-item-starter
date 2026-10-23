import { SiteMenuEditor } from "../../../_components/site-settings-editors/blocks"
import { SectionTabs } from "../../../_components/section-tabs"
import { SettingsToaster } from "../../../_components/site-settings-editors/toast"

// 579-2: страница «header» своих настроек сайта — копия редактора CONFIG над файлами этого элемента. Тостер — свой у страницы:
// сообщения редакторов «Сохранено» и «Не сохранилось» иначе уходили бы в пустоту (✗ 340-4).
export function Widget({ lang }: { lang: string }) {
  return (
    <>
      <SectionTabs lang={lang} page="site-settings" current="header" />
      <SiteMenuEditor lang={lang} slot="top" />
      <SettingsToaster deployLabel="" closeLabel="" />
    </>
  )
}
