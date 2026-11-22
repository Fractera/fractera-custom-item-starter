// WHERE THE AGENT KIT'S PAGES KNOCK — AN ELEMENT'S OWN COPY (node step 836). Written into the element by `npm run agent-kit:template`
// in place of the core's `core/client/kit-place.ts`; every other file of the kit is the core's, as it is (the owner, 2026-11-22:
// «пере используй их как есть»).
// Here the pages live in the element's own admin branch, behind its own sign-in; every door is the element's ONE door
// `/api/agent-kit/…`, which checks this element's person and calls the core on loopback with the element's own key. The core is on
// another host, so the socket's address comes with the ticket.

/** The base of the four kit doors — the element's door knows which element it is. */
export function kitApi(_lang: string, _service: string): string {
  return "/api/agent-kit/agent-api"
}

/** A door of the core (`/api/transcribe?item=…`, `/api/node/update?tail=1`) — through the element's door; it lets through only a few. */
export function kitDoor(path: string): string {
  return `/api/agent-kit/core${path}`
}

/** The terminal socket — named by the element's ticket door (the core's public address). */
export function kitSocket(service: string, named?: string | null): string {
  if (named) return named
  const scheme = window.location.protocol === "https:" ? "wss" : "ws"
  return `${scheme}://${window.location.host}/pty/${service}`
}

/** Where the kit's own pages are in the element: its admin branch. */
export function kitPage(lang: string, _service: string, page: "terminal" | "telegram" | "claude-code"): string {
  return `/${lang}/admin/agent/${page === "claude-code" ? "subscription" : page}`
}
