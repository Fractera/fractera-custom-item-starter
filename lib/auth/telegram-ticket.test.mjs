// The Telegram ticket (node step 832-6): `node lib/auth/telegram-ticket.test.mjs`, part of the prebuild. Each case has its negative control.
import assert from 'node:assert/strict'
import { checkInit, mintTicket, readTicket, signInit, ticketOfCookie } from './telegram-ticket.mjs'

const BOT = '123456:TEST-token'
const now = Date.UTC(2026, 10, 21, 20, 0, 0)
const launch = (user, { bot = BOT, at = now / 1000 - 60, extra = {} } = {}) => {
  const fields = { auth_date: String(Math.floor(at)), query_id: 'AAE', user: JSON.stringify({ id: user, first_name: 'Roma' }), ...extra }
  return new URLSearchParams({ ...fields, hash: signInit(fields, bot) }).toString()
}
let n = 0
const t = (name, fn) => { fn(); n++; console.log(`  ✓ ${name}`) }

t('a launch signed by this bot for an admitted person passes', () => assert.deepEqual(checkInit(launch(90413601), BOT, { allow: ['90413601'], now }), { ok: true, user: '90413601' }))
t('negative: a person the bot did not admit', () => assert.equal(checkInit(launch(777), BOT, { allow: ['90413601'], now }).reason, 'not-allowed'))
t('negative: signed by another bot', () => assert.equal(checkInit(launch(90413601, { bot: '999:other' }), BOT, { allow: ['90413601'], now }).reason, 'forged'))
t('negative: a field changed after signing', () => assert.equal(checkInit(launch(90413601).replace('Roma', 'Mallory'), BOT, { allow: ['90413601'], now }).reason, 'forged'))
t('negative: a launch older than a day', () => assert.equal(checkInit(launch(90413601, { at: now / 1000 - 2 * 86400 }), BOT, { allow: ['90413601'], now }).reason, 'stale'))
t('negative: no hash, no data', () => { assert.equal(checkInit('user=1', BOT, { now }).reason, 'no-hash'); assert.equal(checkInit('', BOT, { now }).reason, 'no-data') })
t('the signature field: checked without it when the hash was made without it', () => {
  const fields = { auth_date: String(now / 1000 - 5), user: JSON.stringify({ id: 5 }) }
  const q = new URLSearchParams({ ...fields, signature: 'abc', hash: signInit(fields, BOT) }).toString()
  assert.equal(checkInit(q, BOT, { allow: ['5'], now }).ok, true)
})
t('a ticket reads back its id under the same key', () => assert.equal(readTicket(mintTicket('90413601', 'k1', now), 'k1', now), '90413601'))
t('negative: another element\'s key, an expired ticket, a tampered id', () => {
  const tk = mintTicket('90413601', 'k1', now)
  assert.equal(readTicket(tk, 'k2', now), null)
  assert.equal(readTicket(tk, 'k1', now + 25 * 3600_000), null)
  assert.equal(readTicket(tk.replace(/^90413601/, '90413602'), 'k1', now), null)
  assert.equal(mintTicket('90413601', '', now), null)
})
t('the cookie header gives the ticket', () => assert.equal(ticketOfCookie('a=1; fractera-telegram=1.2.3; b=2'), '1.2.3'))
console.log(`telegram-ticket: ${n} ✓`)
