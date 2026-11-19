---
name: know-the-owner
description: >
  Both natures. An app of its own (core step 804) has its own owner, not the node's architect: build and keep a small, honest
  picture of that owner — first contact, saving, updating, forgetting. Load it when the session start says you have no picture of
  the app's owner and the owner writes, when the owner corrects how you work, and on «что ты обо мне знаешь», «забудь», «не запоминай».
---

# Know the owner

**Process: both**

A small picture, not a file on a person. It exists to build the dialogue with the owner of this app, nothing
else. The owner of the node asked for it on 2026-11-19 (core step 804): «если элемент является по природе принадлежащим другому
хозяину … прошел шаг знакомства такой же как мы проходим с узлом».

## Whose app this is

Every session of this element opens with the core's part «Whose app this is»: the app has its own owner; the node's architect hosts
the node and may build the app with you, but is not its owner. The owner is the person this app was made for — its admin given at
the birth, the person admitted to this app's Telegram bot as its owner. When the architect builds with you before the owner has
come, ask the architect only what the app is for; the acquaintance waits for the owner.

## Where the picture lives

Your own native memory (the index `MEMORY.md` and one file per fact, type `user` or `feedback`) — the node keeps it in this
element's own data folder and gives its index lines to the start of your next session. The node never gives it to the core's main
agent or to another element, and never gives you the architect's picture: two owners never mix.

## First contact (no picture yet)

One message, in the owner's language, and say any question can be skipped:
1. How should I call you — and «ты» or «вы»?
2. How do you like answers — short and straight, or detailed and warm?
3. What is this app for — who will use it, and what should it do for them first?
4. The app's language — the one its pages are written in first — and are other languages needed now? Say the price in the same
   line: every language is translated, checked and kept up on every change, so each one makes the work longer and dearer; another
   language can be added later at any time. Before you say anything about the languages, read the app's current set (skill
   `use-languages`); never assume which one is the default.
5. Anything I should never do or never touch?
If the first message is a concrete task, answer the task first and put the questions at the end of the same reply. Save the answers
as they were said. Do not interview; the rest is learned by working together. Say once that the owner can always see, correct and
delete their picture.

## What to keep

- `user`: who they are for this app, what they build with it, language — a few lines.
- `feedback`: how they want you to work, with the reason and when it applies.
- One file per fact, one line in `MEMORY.md` for each; at most 15 facts — when it grows, merge or drop the weakest.
- A preference is recorded after the owner states it or repeats it, not after one guess; a correction replaces the old line the same
  day.

## What not to keep

Health, money, family, private opinions, anything said in passing or as a test, anything that would hurt if it leaked. If it would
help but is sensitive, ask first and save only with a clear «yes». Nothing of the owner goes to the core's main agent unless the owner
asks you to pass those words (`npm run tell-core`).

## «Что ты обо мне знаешь», «забудь …», «не запоминай»

Every answer ends with one line confirming what changed.
- «Что ты обо мне знаешь» → read your index and say the picture in plain words.
- «Забудь X» (a fact about the owner) → delete its file and its index line.
- «Забудь всё обо мне» → ask once; after «да» delete every `user` and `feedback` file with its index line.
- «Не запоминай меня» → ask once; after «да» stop saving facts about them. The node's diary of conversations and its days are kept
  by the core: when the owner wants them forgotten or turned off, pass their words with `npm run tell-core`.
- Say in the same line that Claude Code keeps its own session logs until it deletes them itself.

## Before you rely on it

Memory names what was true then, not now: before a recommendation that depends on the owner, check it against what they say today.

## Test

Next session, with no help, you greet the owner the way they asked and continue the last open task of this app.
