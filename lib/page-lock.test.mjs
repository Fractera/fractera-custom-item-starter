// The lock of a data-folder page (lib/page-lock.mjs). ✗ 805 and ✗ 2026-11-21 (the Mini App of j58fl): the element's own admin, let in
// by a branch's lock, was shut out again by the branch's child pages. `npm run test:page-lock`.
import assert from 'node:assert/strict'
import { BRANCH_GROUP, pageLock } from './page-lock.mjs'

let passed = 0
const t = (name, fn) => { try { fn(); passed++; console.log(`  ✓ ${name}`) } catch (e) { process.exitCode = 1; console.log(`  ✗ ${name}\n    ${e.message}`) } }
const OWN = 'elementAdmin002'
const groups = { account: ['user', 'architect'], staff: ['manager', 'architect', OWN], finance: ['finance', 'architect', OWN], admin: ['architect', OWN] }
const rolesThatSee = (r) => (r === 'buyer' ? ['buyer', 'vip_user'] : [r])
const lock = (branch, metaRoles, own = null) => pageLock({ own, metaRoles, branch, rolesThatSee, groups })

t('830: a Mini App screen (branch tg, meta.roles ["admin"]) opens to the element\'s own admin and the architect', () => {
  const roles = lock('tg', ['admin'])
  assert.ok(roles.includes(OWN), roles.join(', '))
  assert.ok(roles.includes('architect'))
})

t('805: the child pages of admin, staff and finance keep letting the element\'s admin in', () => {
  for (const b of ['admin', 'staff', 'finance']) assert.ok(lock(b, ['manager']).includes(OWN), b)
})

t('negative: the visitor\'s cabinet and the public layer never let the element\'s admin in by this rule', () => {
  assert.ok(!lock('account', ['buyer']).includes(OWN))
  assert.ok(!lock('', ['buyer']).includes(OWN))
  assert.deepEqual(lock('account', ['buyer']).sort(), ['architect', 'buyer', 'vip_user'], 'inheritance and the architect only')
})

t('negative: a page with no role folder and no meta.roles has no lock at all (null), in any branch', () => {
  assert.equal(lock('tg', []), null)
  assert.equal(lock('admin', []), null)
})

t('a branch name that is an Object key never reaches a group (no prototype lookup)', () => {
  assert.deepEqual(lock('constructor', ['user']).sort(), ['architect', 'user'])
  assert.equal(BRANCH_GROUP.tg, 'admin', 'the tg layout stands behind the admin group\'s lock')
})

console.log(process.exitCode ? `===PAGE_LOCK_FAILED=== ${passed} passed` : `===PAGE_LOCK_OK=== ${passed} passed`)
