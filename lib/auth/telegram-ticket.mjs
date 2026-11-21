// THE TELEGRAM TICKET — the element's Mini App opens without e-mail and password (node step 832-6).
// The owner of the node, Telegram 628, 2026-11-21 (a screenshot of an element's Mini App stuck on «Вход…»): «непонятно зачем ты придумал
// здесь авторизацию … если пользователь авторизовался в Telegram значит это либо администратор либо архитектор … Telegram сам защищает.
// Убрать это всё».
// 🔒 WHO GETS IN: Telegram signs every launch of a Mini App with the bot's token (core.telegram.org/bots/webapps, «Validating data
// received via the Mini App»): HMAC-SHA256 of the sorted fields with the key HMAC-SHA256("WebAppData", <bot token>). Only this element's
// bot can produce it, and only a person on its bot's list (`access.json` → `allowFrom`, the people the bot admitted) is let in — the
// same rule the core's own Pult keeps (`lib/node/telegram-webapp.cjs` of the core, word for word).
// 🔒 WHAT THEY GET: a cookie of this element only — `<telegram id>.<expiry s>.<HMAC-SHA256(SETTINGS_SECRET, label + id + "." + expiry)>`,
// HttpOnly, 24 h; `getSession` reads it as this element's own admin (lib/roles.ts → OWN_ADMIN_ROLE). Never the architect, never another
// element: the key is this element's own (SETTINGS_SECRET is its own key since core step 818-7c), the label is versioned.
import { createHmac, timingSafeEqual } from 'node:crypto'

export const TG_COOKIE = 'fractera-telegram'
export const TG_TICKET_TTL_S = 24 * 3600
const INIT_MAX_AGE_S = 24 * 3600
const LABEL = 'fractera-telegram-ticket:v1:'

const hex = (key, text) => createHmac('sha256', key).update(text).digest('hex')
const same = (a, b) => typeof a === 'string' && typeof b === 'string' && a.length === b.length && a.length > 0 && timingSafeEqual(Buffer.from(a), Buffer.from(b))

/** The hash Telegram would put on these fields for this bot. */
export function signInit(fields, botToken) {
  const check = Object.keys(fields).sort().map((k) => `${k}=${fields[k]}`).join('\n')
  const secret = createHmac('sha256', 'WebAppData').update(botToken).digest()
  return hex(secret, check)
}

/**
 * Telegram's launch data checked: `{ ok: true, user }` (the Telegram id as a string) or `{ ok: false, reason }` —
 * no-data · no-hash · forged · stale · no-user · not-allowed.
 * @param {string} initData @param {string} botToken @param {{ allow?: string[], maxAgeS?: number, now?: number }} [o]
 */
export function checkInit(initData, botToken, { allow = [], maxAgeS = INIT_MAX_AGE_S, now = Date.now() } = {}) {
  if (typeof initData !== 'string' || !initData || initData.length > 8192 || !botToken) return { ok: false, reason: 'no-data' }
  const p = new URLSearchParams(initData)
  const hash = p.get('hash') ?? ''
  if (!/^[a-f0-9]{64}$/.test(hash)) return { ok: false, reason: 'no-hash' }
  const fields = {}
  for (const [k, v] of p) if (k !== 'hash') fields[k] = v
  // newer launch data also carries `signature` (for third parties): the bot-token hash is checked with it and, failing that, without it
  let good = same(signInit(fields, botToken), hash)
  if (!good && 'signature' in fields) { const { signature, ...rest } = fields; void signature; good = same(signInit(rest, botToken), hash) }
  if (!good) return { ok: false, reason: 'forged' }
  const at = Number(fields.auth_date)
  if (!(at > 0) || now / 1000 - at > maxAgeS || at - now / 1000 > 300) return { ok: false, reason: 'stale' }
  let user = null
  try { user = JSON.parse(fields.user ?? 'null') } catch { /* below */ }
  if (!user || !Number.isInteger(user.id)) return { ok: false, reason: 'no-user' }
  if (!allow.map(String).includes(String(user.id))) return { ok: false, reason: 'not-allowed' }
  return { ok: true, user: String(user.id) }
}

/** A ticket for this Telegram id, signed with this element's own key. */
export function mintTicket(user, secret, now = Date.now(), ttlS = TG_TICKET_TTL_S) {
  if (!/^\d{1,20}$/.test(String(user)) || !secret) return null
  const exp = Math.floor(now / 1000) + ttlS
  return `${user}.${exp}.${hex(secret, `${LABEL}${user}.${exp}`)}`
}

/** The Telegram id of a ticket that is this element's own and not expired, else null. */
export function readTicket(value, secret, now = Date.now()) {
  if (typeof value !== 'string' || !secret) return null
  const m = /^(\d{1,20})\.(\d{1,12})\.([a-f0-9]{64})$/.exec(value)
  if (!m) return null
  const [, user, exp, mac] = m
  if (Number(exp) * 1000 <= now) return null
  return same(hex(secret, `${LABEL}${user}.${exp}`), mac) ? user : null
}

/** The ticket from a Cookie header. */
export function ticketOfCookie(cookieHeader) {
  const m = String(cookieHeader ?? '').match(/(?:^|;\s*)fractera-telegram=([^;]+)/)
  return m ? decodeURIComponent(m[1]) : null
}
