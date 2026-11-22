// The words of the Mini App's search (node step 841; the owner, Telegram 963): the line this element's own bot writes into the chat, and
// the task its own agent wakes with. Pure functions — the door `tg/api/search` uses them, a test reads them.
const LINE: Record<string, string> = {
  en: "🔎 Searching: «{q}». I answer here.",
  ru: "🔎 Ищу: «{q}». Отвечу здесь.",
}

export function searchLine(lang: string, q: string): string {
  return (LINE[lang] ?? LINE.en).replace("{q}", q)
}

/** The agent's task — English (the layer for the agent), the person's words as they said them. */
export function searchAsk(word: string, q: string, lang: string): string {
  return `${word} The person searched from your Mini App: «${q}» — they want an element or a way that does this. ` +
    "If it is in your own field, answer with its path in your Projects map («Проекты › … › …») and how to do it there. " +
    `If not, ask the core: npm run need -- "${q.replace(/"/g, "'")}" --use "the person's search from the Mini App" — the core's main agent ` +
    "climbs the node's ladder (the node's elements, the native elements, Fractera's marketplace, Lagrix, skills and memory) and answers you; " +
    "pass its answer on: the element and its path with a hint, or links to the public pages of fitting marketplace elements, or the price to buy or build. " +
    `Answer the person in Telegram (reply) in their language (${lang}). Nothing else: no plan, no build.`
}
