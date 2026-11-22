# The agent kit — a copy of the core's (node step 836)

Copied by `npm run agent-kit:template` from the core of Fractera/web4-node-starter-kit at `e9919463`. Never edit these files
here: a fix goes into the core's kit (`app/[lang]/(architectLayer)/architect/kits/_agent-kit`) and comes back by the same command.
Only `client/kit-place.ts` is the element's own (the core's `element/kit-place.ts`): the doors of this element and the socket.

| file | from the core | sha |
|---|---|---|
| `_tools/terminal-paste/client/terminal-paste-dialog.client.tsx` | `_tools/terminal-paste/client/terminal-paste-dialog.client.tsx` | 1d89ebc2689e |
| `_tools/terminal-paste/types/terminal-paste.ts` | `_tools/terminal-paste/types/terminal-paste.ts` | e073810a0cb3 |
| `_tools/voice-input/client/use-voice-recorder.ts` | `_tools/voice-input/client/use-voice-recorder.ts` | ca026ec9901e |
| `_tools/voice-input/client/voice-input-i18n.ts` | `_tools/voice-input/client/voice-input-i18n.ts` | d8fc25b6c646 |
| `_tools/voice-input/client/voice-input.client.tsx` | `_tools/voice-input/client/voice-input.client.tsx` | 4e1c6012787e |
| `_tools/voice-input/types/voice-input.ts` | `_tools/voice-input/types/voice-input.ts` | 796db01f195a |
| `app/[lang]/(architectLayer)/_components/live-log.client.tsx` | `app/[lang]/(architectLayer)/_components/live-log.client.tsx` | a9f71f13be25 |
| `components/agent-kit/agent-links.tsx` | `app/[lang]/(architectLayer)/architect/kits/_agent-kit/core/agent-links.tsx` | 493f2ec84066 |
| `components/agent-kit/client/agent-terminal.client.tsx` | `app/[lang]/(architectLayer)/architect/kits/_agent-kit/core/client/agent-terminal.client.tsx` | ab9f1675ef98 |
| `components/agent-kit/client/claude-own-login.client.tsx` | `app/[lang]/(architectLayer)/architect/kits/_agent-kit/core/client/claude-own-login.client.tsx` | 2e550bdb289a |
| `components/agent-kit/client/claude-subscription.client.tsx` | `app/[lang]/(architectLayer)/architect/kits/_agent-kit/core/client/claude-subscription.client.tsx` | 8b1b662f5cfc |
| `components/agent-kit/client/core-build-watch.client.tsx` | `app/[lang]/(architectLayer)/architect/kits/_agent-kit/core/client/core-build-watch.client.tsx` | d9bcad9d21b3 |
| `components/agent-kit/client/kit-place.ts` | `app/[lang]/(architectLayer)/architect/kits/_agent-kit/core/client/kit-place.ts` | 016aa9fbb993 |
| `components/agent-kit/client/mouse-filter.mjs` | `app/[lang]/(architectLayer)/architect/kits/_agent-kit/core/client/mouse-filter.mjs` | 245f1f2bfb0b |
| `components/agent-kit/client/sleeping-card.client.tsx` | `app/[lang]/(architectLayer)/architect/kits/_agent-kit/core/client/sleeping-card.client.tsx` | 695ebd7f1503 |
| `components/agent-kit/client/telegram-channel.client.tsx` | `app/[lang]/(architectLayer)/architect/kits/_agent-kit/core/client/telegram-channel.client.tsx` | 1b77bf2cf28d |
| `components/agent-kit/client/telegram-remove.client.tsx` | `app/[lang]/(architectLayer)/architect/kits/_agent-kit/core/client/telegram-remove.client.tsx` | 07f61cf72db1 |
| `components/agent-kit/client/terminal-auth.mjs` | `app/[lang]/(architectLayer)/architect/kits/_agent-kit/core/client/terminal-auth.mjs` | 94174f03376b |
| `components/agent-kit/client/terminal-paste.mjs` | `app/[lang]/(architectLayer)/architect/kits/_agent-kit/core/client/terminal-paste.mjs` | f49eef9f360a |
| `components/agent-kit/client/xterm-terminal.client.tsx` | `app/[lang]/(architectLayer)/architect/kits/_agent-kit/core/client/xterm-terminal.client.tsx` | beca33ebd444 |
| `components/agent-kit/words/agent-links.i18n.ts` | `app/[lang]/(architectLayer)/architect/kits/_agent-kit/core/words/agent-links.i18n.ts` | aa55a910d8a4 |
| `components/agent-kit/words/agent-terminal.i18n.ts` | `app/[lang]/(architectLayer)/architect/kits/_agent-kit/core/words/agent-terminal.i18n.ts` | 734d3aa84ef1 |
| `components/agent-kit/words/claude-subscription.i18n.ts` | `app/[lang]/(architectLayer)/architect/kits/_agent-kit/core/words/claude-subscription.i18n.ts` | 1e438d19a2e4 |
| `components/agent-kit/words/telegram-channel.i18n.ts` | `app/[lang]/(architectLayer)/architect/kits/_agent-kit/core/words/telegram-channel.i18n.ts` | cb6a51ee52cd |
| `components/deploy/core-terminal.client.tsx` | `components/deploy/core-terminal.client.tsx` | 753da96ee5bb |
| `components/deploy/failure-note.client.tsx` | `components/deploy/failure-note.client.tsx` | a3815ad06dcf |
| `components/form/mic-icon.tsx` | `components/form/mic-icon.tsx` | bdd6cec4b764 |
| `components/form/voice-control.client.tsx` | `components/form/voice-control.client.tsx` | d7ddea300e56 |
| `components/node-state/open-on-this-computer.client.tsx` | `components/node-state/open-on-this-computer.client.tsx` | 011f45c1cca1 |
| `components/node-state/use-node-place.client.ts` | `components/node-state/use-node-place.client.ts` | 866ca3af47a6 |
| `lib/deploy/core-silence.mjs` | `lib/deploy/core-silence.mjs` | 7da01c958c52 |
