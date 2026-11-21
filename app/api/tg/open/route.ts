// @api open the Mini App from Telegram's signed launch without sign-in
import { NextRequest, NextResponse } from "next/server"

// THE MINI APP'S FIRST STOP (node step 832-6). The edge gate of /tg (`proxy.ts`, «ворота страниц управления элементом») sends a visitor
// with no session here instead of the sign-in form. This page carries no data of anyone: a script reads Telegram's launch data — the URL
// fragment `#tgWebAppData=…` that Telegram gives every Mini App (it survives the redirect; no outside script is loaded here) —
// and trades it at `POST /api/tg/session` for the element's Telegram ticket, then goes back to the page it came for.
// - No launch data (an ordinary browser) → back with `tg=none`: the gate sends it to the sign-in form, as before.
// - Launch data refused (a person the bot did not admit) → one line in words, no form: a password would not help them.
export const dynamic = "force-dynamic"

const WORDS = {
  ru: { wait: "Открываю…", denied: "Этот аккаунт Telegram не допущен к приложению. Попросите владельца допустить вас в боте элемента.", fail: "Не получилось открыть. Закройте приложение и откройте его снова кнопкой бота." },
  en: { wait: "Opening…", denied: "This Telegram account is not admitted to the app. Ask its owner to admit you in the element's bot.", fail: "Could not open. Close the app and open it again with the bot's button." },
} as const

// a value inside the inline script: `<` escaped, so no `</script>` can close it
const js = (v: unknown) => JSON.stringify(v).replace(/</g, "\\u003c")

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("next") ?? "/"
  // only a path of this very site — never another host (`//evil`, `/\evil`)
  const next = /^\/(?![/\\])[^\s]*$/.test(raw) ? raw : "/"
  const lang = /^\/ru(\/|$|\?)/.test(next) ? "ru" : "en"
  const w = WORDS[lang]
  const html = `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="robots" content="noindex,nofollow"><title>${w.wait}</title>
<style>:root{color-scheme:light dark}body{margin:0;min-height:100dvh;display:flex;align-items:center;justify-content:center;font:15px/1.45 system-ui,-apple-system,sans-serif;padding:24px;text-align:center}</style></head><body data-block="tg-open"><p id="m">${w.wait}</p>
<script>(function(){var next=${js(next)};var W=${js(w)};
function frag(){try{return new URLSearchParams(location.hash.slice(1)).get('tgWebAppData')||''}catch(e){return ''}}
var init=frag()||(window.Telegram&&Telegram.WebApp&&Telegram.WebApp.initData)||'';
function back(extra){var u=new URL(next,location.origin);if(extra)u.searchParams.set('tg',extra);location.replace(u.pathname+u.search+location.hash)}
if(!init){back('none');return}
fetch('/api/tg/session',{method:'POST',headers:{'content-type':'application/json'},credentials:'same-origin',body:JSON.stringify({initData:init})})
.then(function(r){return r.json().catch(function(){return {}}).then(function(b){if(r.ok&&b&&b.ok){back('');return}
document.getElementById('m').textContent=(b&&b.reason==='not-allowed')?W.denied:W.fail})})
.catch(function(){document.getElementById('m').textContent=W.fail})})()</script></body></html>`
  return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } })
}
