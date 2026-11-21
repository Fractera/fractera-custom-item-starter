// Samples of the element's own memory per project (node step 825-3; npm run test:project-memory): exit code 1 on any miss.
import assert from 'node:assert/strict'
import { memoryBody, parseArgs, projectOf } from './project-memory.mjs'

let failures = 0
const t = (label, fn) => { try { fn(); console.log(`ok   ${label}`) } catch (e) { failures++; console.log(`FAIL ${label}\n     ${e.message}`) } }

t('remember with a project: the project travels in the words, this element is the only «from»', () => {
  const a = parseArgs(['remember', 'Пост', 'про', 'запуск', '--project', 'social/twitter'])
  assert.deepEqual(memoryBody(a, 'diana'), { text: '[project social/twitter] Пост про запуск', from: ['diana'] })
})
t('recall with a project and a language', () => {
  const a = parseArgs(['recall', 'что мы публиковали', '--project', 'social', '--lang', 'ru'])
  assert.deepEqual(memoryBody(a, 'diana'), { text: 'что мы публиковали (project social)', from: ['diana'], lang: 'ru' })
})
t('recall without a project asks the whole own space', () => {
  assert.deepEqual(memoryBody(parseArgs(['recall', 'тренировки']), 'diana'), { text: 'тренировки', from: ['diana'] })
})
t('negative: a project outside the map\'s shape is refused', () => {
  assert.match(parseArgs(['remember', 'x', '--project', '../core']).error, /project/)
  assert.equal(projectOf('Social/Instagram'), null)
  assert.equal(projectOf('a/b/c'), null)
})
t('negative: another verb or no words', () => {
  assert.match(parseArgs(['forget', 'x']).error, /remember or recall/)
  assert.match(parseArgs(['recall', '--project', 'social']).error, /no words/)
})

if (failures) { console.error(`===TEST_PROJECT_MEMORY_FAILED=== ${failures}`); process.exit(1) }
console.log('===TEST_PROJECT_MEMORY_OK===')
