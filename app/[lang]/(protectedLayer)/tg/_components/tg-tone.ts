// The tile tones of this element's Mini App (node step 840-4; the owner's mock A–D, Telegram 942 and 968 «разве я не просил … другим цветовым
// дизайном»): every row's icon stands white on a saturated tile, like Telegram's own settings. A row names its tone; without one the icon's
// name chooses it — the same icon always the same colour. The colours themselves are tokens (`--tg-tile-*`, styles/globals.css).

export type TgTone = "blue" | "orange" | "purple" | "green" | "pink" | "teal" | "indigo" | "red" | "gray"

/** Whole class strings, so Tailwind sees each one. */
export const TILE: Record<TgTone, string> = {
  blue: "bg-(--tg-tile-blue)",
  orange: "bg-(--tg-tile-orange)",
  purple: "bg-(--tg-tile-purple)",
  green: "bg-(--tg-tile-green)",
  pink: "bg-(--tg-tile-pink)",
  teal: "bg-(--tg-tile-teal)",
  indigo: "bg-(--tg-tile-indigo)",
  red: "bg-(--tg-tile-red)",
  gray: "bg-(--tg-tile-gray)",
}

/** The mock's colours for the screens' own rows (A: Проекты blue, Cron orange, Элемент purple, Настройки grey; D: the element's rows). */
const BY_ICON: Record<string, TgTone> = {
  home: "blue", grid: "blue", "layout-grid": "blue", clock: "orange", "calendar-days": "orange", "calendar-clock": "red", calendar: "orange",
  element: "purple", boxes: "purple", settings: "gray", help: "teal", globe: "blue", palette: "purple", "sliders-horizontal": "gray",
  users: "green", hammer: "gray", rocket: "green", "scroll-text": "indigo", "user-round": "teal", briefcase: "orange", sparkles: "orange",
  "credit-card": "green", plug: "gray", bot: "blue", gauge: "teal", hourglass: "orange", "calendar-range": "indigo", send: "blue",
  network: "indigo",
}
const ROUND: TgTone[] = ["blue", "green", "purple", "orange", "pink", "teal", "indigo", "red"]

export function toneOf(icon: string | null | undefined): TgTone {
  if (!icon) return "gray"
  if (BY_ICON[icon]) return BY_ICON[icon]
  let n = 0
  for (let i = 0; i < icon.length; i++) n = (n * 31 + icon.charCodeAt(i)) >>> 0
  return ROUND[n % ROUND.length]
}
