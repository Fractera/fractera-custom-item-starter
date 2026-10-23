import { DesignEditorBlock } from "../../../_components/design-editors/blocks"
import { SectionTabs } from "../../../_components/section-tabs"
import { designAccessWords } from "../../../_components/design-editors/access-words.i18n"

// 579-1: страница «shape» своей мастерской оформления — редактор элемента «Дизайн», который пишет DESIGN-CONFIG этого элемента.
export function Widget({ lang }: { lang: string }) {
  return (
    <>
      <SectionTabs lang={lang} page="design" current="shape" />
      <DesignEditorBlock lang={lang} section="shape" words={designAccessWords(lang)} />
    </>
  )
}
