// @local — this element's agent terminal page: the core's kit terminal as it is (node step 836-2)
import { AgentTerminal } from "@/components/agent-kit/client/agent-terminal.client"
import { agentTerminalWords } from "@/components/agent-kit/words/agent-terminal.i18n"
import { appDialogUi } from "@/components/dialog/app-dialog.i18n"
import { ownId } from "@/lib/own-id"

// The core's terminal of this element, behind this element's own sign-in (836). The ticket comes through this element's door, the
// socket goes to the core's public address the door names; the voice of the paste window — through the same door.
export function Widget({ lang }: { lang: string }) {
  return <AgentTerminal service={ownId() ?? ""} lang={lang} words={agentTerminalWords(lang)} dialogUi={appDialogUi(lang)} />
}
