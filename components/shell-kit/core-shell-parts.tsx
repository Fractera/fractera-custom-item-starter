import { TopMenu } from "@/components/menu/top/top-menu.server"
import { FooterMenu } from "@/components/menu/footer/footer-menu.server"
import { loadCoreShell, propsJson } from "./core-shell"
import { DrawerBridge } from "./drawer-bridge.client"

// ШАПКА И ПОДВАЛ ИЗ ИНСТРУМЕНТА ЯДРА (узел, шаг 727-2) — две части макета вместо `TopMenu` / `FooterMenu`. Ядро ответило — фрагмент
// ядра как есть (React элемента его не трогает: внутри `dangerouslySetInnerHTML`), пакет ядра оживляет его своим React. Ядро
// молчит — свои `TopMenu` / `FooterMenu`, как до 727. Почему так и как отказаться — `README.md` рядом.

export async function CoreShellHeader({ lang }: { lang: string }) {
  const kit = await loadCoreShell(lang)
  if (!kit) return <TopMenu lang={lang} />
  return (
    <>
      <link rel="stylesheet" href={`/shell-kit/${kit.assets.css}`} precedence="default" />
      <div data-block="shell-kit-header" data-shell-kit="header" data-shell-kit-version={kit.version} dangerouslySetInnerHTML={{ __html: kit.html.header }} />
      <DrawerBridge />
    </>
  )
}

export async function CoreShellFooter({ lang }: { lang: string }) {
  const kit = await loadCoreShell(lang)
  if (!kit) return <FooterMenu lang={lang} />
  return (
    <>
      <div data-block="shell-kit-footer" data-shell-kit="footer" data-shell-kit-version={kit.version} dangerouslySetInnerHTML={{ __html: kit.html.footer }} />
      <script type="application/json" id="shell-kit-props" dangerouslySetInnerHTML={{ __html: propsJson(kit.props) }} />
      <script src={`/shell-kit/${kit.assets.js}`} async />
    </>
  )
}
