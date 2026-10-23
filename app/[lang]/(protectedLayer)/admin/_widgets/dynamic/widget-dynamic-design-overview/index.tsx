import { DesignEditorBlock } from "../../../_components/design-editors/blocks"
import { designAccessWords } from "../../../_components/design-editors/access-words.i18n"

// 579-1: страница «fonts» своей мастерской оформления — редактор элемента «Дизайн», который пишет DESIGN-CONFIG этого элемента.
export function Widget({ lang }: { lang: string }) {
  return <DesignEditorBlock lang={lang} section="fonts" words={designAccessWords(lang)} />
}
