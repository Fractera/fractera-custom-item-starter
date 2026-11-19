// test:quick-nav (706-3) — правило показа полосы быстрой навигации на любом адресе, без браузера (Node 22 снимает типы сам).
import { quickNavVisible } from './quick-nav-visibility.ts'
const cases = [
  [{ loopback: true, temporary: false }, null, true, 'this computer, roles unknown — shown'],
  [{ loopback: true, temporary: false }, [], true, 'this computer, a guest — shown'],
  [{ loopback: false, temporary: true }, ['architect'], false, 'temporary address, even the architect — hidden'],
  [{ loopback: false, temporary: false }, ['architect'], true, 'own domain, the architect — shown'],
  [{ loopback: false, temporary: false }, ['user', 'admin'], false, 'own domain, a signed-in non-architect — hidden'],
  [{ loopback: false, temporary: false }, null, false, 'own domain, a visitor — hidden'],
]
let bad = 0
for (const [place, roles, want, what] of cases) {
  const got = quickNavVisible(place, roles)
  console.log(`${got === want ? '✓' : '✗'} ${what}`)
  if (got !== want) bad++
}
if (bad) { console.log(`===QUICK_NAV_FAILED=== ${bad}`); process.exit(1) }
console.log('===QUICK_NAV_OK===')
