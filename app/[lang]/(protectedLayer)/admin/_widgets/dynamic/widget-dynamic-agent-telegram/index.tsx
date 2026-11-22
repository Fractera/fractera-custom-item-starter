// @local — this element's Telegram bot page: the core's kit widgets as they are (node step 836-2)
import { TelegramAppNeeded } from "@/components/agent-kit/agent-links"
import { TelegramChannel } from "@/components/agent-kit/client/telegram-channel.client"
import { agentLinksWords } from "@/components/agent-kit/words/agent-links.i18n"
import { telegramChannelWords } from "@/components/agent-kit/words/telegram-channel.i18n"
import { appDialogUi } from "@/components/dialog/app-dialog.i18n"
import { ownId } from "@/lib/own-id"

// This element's own bot (H2A), set up behind this element's own sign-in (836): the same steps as the core's page of this element.
export function Widget({ lang }: { lang: string }) {
  return (
    <>
      <TelegramAppNeeded words={agentLinksWords(lang)} />
      <TelegramChannel service={ownId() ?? ""} lang={lang} words={telegramChannelWords(lang)} dialogUi={appDialogUi(lang)} />
    </>
  )
}
