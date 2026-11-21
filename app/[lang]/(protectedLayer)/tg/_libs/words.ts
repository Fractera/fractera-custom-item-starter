// Small word helpers of this element's Telegram Mini App (node step 821): a number with its plural form by the language's own rules
// (Intl.PluralRules — «1 страница · 3 страницы · 5 страниц»), and `{name}` holes filled. The words themselves live in each widget's
// `ui.i18n.ts`; this file holds no words.

/** Plural forms of one phrase: `other` is required, the rest follow Intl.PluralRules (`one`, `few`, `many`). `{n}` — the number. */
export type Plural = { other: string; one?: string; few?: string; many?: string; zero?: string }

/** `{n}` with the right form of the phrase for `n` in `lang`. */
export function plural(forms: Plural, n: number, lang: string): string {
  const rule = new Intl.PluralRules(lang).select(n) as keyof Plural
  return (forms[rule] ?? forms.other).replace("{n}", String(n))
}

/** `{key}` holes of a phrase filled with values. */
export function fill(phrase: string, values: Record<string, string | number>): string {
  return phrase.replace(/\{(\w+)\}/g, (hole, key: string) => (key in values ? String(values[key]) : hole))
}
