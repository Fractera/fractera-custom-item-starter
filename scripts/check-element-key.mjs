// THE KEYS' TEST VECTORS (node step 818-7): `lib/element-key.mjs` must give the same keys as the core's `lib/element-key.cjs` and the
// stores' copies — the vectors below are the core's `scripts/check-element-key.mjs`, word for word. A copy that drifts would refuse every
// element of the node, or let a wrong key in: this guard stops the build first. Part of `prebuild`; the same file in both templates.
import { elementKeyOf, elementOf, isElementId, pairCallerOf, pairKeyOf, sameKey } from '../lib/element-key.mjs'

const SECRET = 'fractera-test-secret'
const ROOT = 'root.J4UAgJ_XnToPRyXPKaG5TB69cVHfiWh8FomI5RRQNHI'
const PAIR = 'shop.RC4iWl7CFXQjhqxT-kLwO1s0vhuPjg5-ow2YQPTwjE4'
const fails = []
const ok = (cond, what) => { if (!cond) fails.push(what) }

ok(elementKeyOf('root', SECRET) === ROOT, 'the test vector changed (root)')
ok(elementOf(ROOT, SECRET) === 'root', 'a good key is not read')
ok(elementOf(`third.${ROOT.slice('root.'.length)}`, SECRET) === null, 'a key with a swapped id passes')
ok(elementOf(ROOT.slice(0, -1), SECRET) === null, 'a key with a cut mac passes')
ok(elementOf(ROOT, '') === null && elementOf(ROOT, undefined) === null, 'a key passes with no node secret')
ok(elementOf(ROOT, 'another-node-secret') === null, 'a key of another node passes')
ok(elementOf('root', SECRET) === null && elementOf('.x', SECRET) === null && elementOf(42, SECRET) === null, 'a key without a mac passes')
ok(!isElementId('../x') && !isElementId('Root') && !isElementId('a.b') && !isElementId('-a') && !isElementId(''), 'a bad element id is taken')
ok(elementKeyOf('../x', SECRET) === null, 'a key is made for a bad id')
ok(pairKeyOf('shop', ROOT) === PAIR, 'the pair key\'s test vector changed (shop → root)')
ok(pairCallerOf(PAIR, ROOT) === 'shop', 'a good pair key is not read')
ok(pairCallerOf(PAIR, elementKeyOf('third', SECRET)) === null, 'a pair key for root opens another element')
ok(pairCallerOf(`third.${PAIR.slice('shop.'.length)}`, ROOT) === null, 'a pair key with a swapped caller passes')
ok(pairCallerOf(elementKeyOf('shop', SECRET), ROOT) === null, 'the caller\'s own key passes as a pair key')
ok(elementOf(PAIR, SECRET) === null, 'a pair key passes as an element key')
ok(pairCallerOf(PAIR, '') === null && pairKeyOf('../x', ROOT) === null && pairKeyOf('shop', '') === null, 'a pair key without a callee key or for a bad id')
ok(sameKey(ROOT, ROOT) && !sameKey(ROOT, ROOT.slice(0, -2)) && !sameKey('', '') && !sameKey(null, null), 'the comparison of keys')

if (fails.length) {
  console.error(`✗ check-element-key (818-7; the templates' copy of the core's lib/element-key.cjs):\n  ${fails.join('\n  ')}`)
  process.exit(1)
}
console.log('✓ check-element-key: the element key and the pair key match the core\'s test vectors and refuse 15 bad forms (818-7)')
