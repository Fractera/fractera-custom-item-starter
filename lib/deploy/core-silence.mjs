// A SILENT CORE IS NOT A BUILD BY ITSELF (node step 738-8). The terminal's watcher (`core-build-watch.client.tsx`, 675-4) drew any silence of
// the core as «идёт сборка ядра» — ✗ 2026-11-13 22:45 → 08:40: 737's move stopped this computer's core, and the open terminal said
// «сборка» for ten hours while nothing was built (the owner: «твой терминал находился в бесконечно процессе сборки ядра я прождал несколько
// часов»). A real build raises the build reader (`lib/deploy/build-reader.cjs`) within seconds (measured ~16 s, 675-4); a silence where
// the reader never answered is a build only for its first minutes — after them the truth is «the core does not answer».
// Plain `.mjs`: the watcher imports it, and the hosting test calls it without a browser.

export const SILENT_AFTER_MS = 3 * 60_000

/**
 * What the watcher says about a silent core.
 * @param {{ since: number, now?: number, readerSeen: boolean }} s — when the silence began, and whether the build reader answered since
 * @returns {'build' | 'silent'}
 */
export function silenceVerdict({ since, now = Date.now(), readerSeen }) {
  if (readerSeen) return 'build'
  return now - since >= SILENT_AFTER_MS ? 'silent' : 'build'
}
