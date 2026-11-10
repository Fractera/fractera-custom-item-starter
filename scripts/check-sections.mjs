#!/usr/bin/env node
// check:sections — THE GUARD OF EVERY SET OF SECTIONS (node step 717-3), in prebuild.
//
// A set is a folder of sections with its `index.ts` (`scripts/sections-lib.mjs`): the element's `components/sections/`, and a design
// prototype's own `prototypes/_pages/<id>/sections/` until the pin (`npm run design:pin` moves the winner's into the element's set).
// Both ways, for each set: every folder `section-*` has its import and its line in `index.ts`, every line has its folder, named by its
// kind; every folder holds `index.tsx`, `markdown.ts` and `README.md`. A prototype's kind never repeats a kind of the element: a
// prototype adds sections, it never replaces one. The generated wiring of the prototypes' sets is what their folders say.
// The archive of the prototypes (`prototypes/_archive/`) is history and holds no code — not read.
import { existsSync, readdirSync } from 'node:fs'
import { ID, elementSectionsDir, pagesDir, sectionsDir, wiringFresh } from './prototype-lib.mjs'
import { readSet, repeatedKinds, setProblems } from './sections-lib.mjs'

const problems = setProblems(elementSectionsDir(), 'components/sections/')
const own = readSet(elementSectionsDir())?.lines.size ?? 0
let sets = 0
let theirs = 0
for (const n of existsSync(pagesDir()) ? readdirSync(pagesDir()).filter((x) => ID.test(x)) : []) {
  const dir = sectionsDir(n)
  if (!existsSync(dir)) continue
  const label = `app/[lang]/(protectedLayer)/prototypes/_pages/${n}/sections/`
  sets++
  theirs += readSet(dir)?.lines.size ?? 0
  problems.push(...setProblems(dir, label))
  for (const k of repeatedKinds(dir, elementSectionsDir())) problems.push(`${label}${k} repeats a section of the element — a prototype adds sections, it never replaces one: give the new look a new kind`)
}
if (!wiringFresh()) problems.push("app/[lang]/(protectedLayer)/prototypes/_components/prototype-sections.ts is not what the prototypes' folders say — npm run prototype -- index")

if (problems.length) {
  console.error(`===SECTIONS_FAILED=== ${problems.length}\n  ${problems.join('\n  ')}`)
  console.error('A section is one folder named by its kind and one line of its set (components/sections/README.md).')
  process.exit(1)
}
console.log(`===SECTIONS_OK=== the element's set: ${own}; the prototypes' own sets: ${sets} (${theirs} sections)`)
