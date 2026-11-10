import { childRoute } from '@/lib/branch-page'
import { prototypeStyle, readPrototype } from '@/lib/prototypes'
import { WIDGETS } from '../_widgets'

// Прототип дизайна — /<lang>/prototypes/<id> (узел, шаг 711-4): страница ветки, как любая, плюс её СВОЯ копия токенов. Метка
// `data-prototype` на обёртке включает правила `:root:has([data-prototype="<id>"])` из `lib/design-css.ts` — шапка, подвал и тело
// этой страницы показываются в облике прототипа, остальной сайт его не видит. Обёртка `contents` не меняет раскладку.
export function prototypeRoute() {
  const route = childRoute({ segments: ['(protectedLayer)', 'prototypes'], subPath: '/prototypes', widgets: WIDGETS })
  async function Page(props: { params: Promise<{ lang: string; slug: string }> }) {
    const { slug } = await props.params
    const style = prototypeStyle(slug)
    // 715: навык прототипа — для круга ширины и навыка в углу (`components/shell/viewport-badge.client.tsx`).
    const skill = readPrototype(slug)?.skill
    return (
      <div data-block="pr7x1" data-prototype={slug} data-prototype-skill={skill || undefined} className="contents">
        {style?.fontLinks.map((href) => <link key={href} rel="stylesheet" href={href} precedence="default" />)}
        {style?.css ? <style dangerouslySetInnerHTML={{ __html: style.css }} /> : null}
        <route.Page params={props.params} />
      </div>
    )
  }
  return { Page, generateMetadata: route.generateMetadata, generateStaticParams: route.generateStaticParams }
}
