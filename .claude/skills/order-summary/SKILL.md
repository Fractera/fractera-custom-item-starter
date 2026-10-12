---
name: order-summary
description: Work skill (every element). Save a short summary of an order — work this element did for another agent over A2A — when that work is closed. Use it before telling the node «done» on any task that came over A2A, whatever the work was (a page section, a picture, a service in the physical world). Not for the element's own development: that goes to development-docs/.
---

<!-- PROOF · PROVEN 2026-10-06: wrote an order summary after each live A2A task · report: development-docs/proofs/2026-10-06-wake-and-a2a-skills.md -->

# order-summary

> A hint, not a law: if you know a better way for the case in front of you, do it your way and say so.

**Process: working** — the running element does its job: data only, no commit, no push, no rebuild; answer in one or two lines.

Result: `SERVICE_DATA_DIR/orders/<order>.md` exists, has no personal data, and lets anyone find the order by kind and tags and
reach the raw conversation by its number.

## When

The A2A task is closed — accepted, refused, cancelled or failed — and you are about to report «done» to the node. One summary per
conversation (`contextId`); several tasks of one conversation go into the same summary.

## How

1. Write a JSON file in a temporary place (not in the repository):

```json
{
  "order": "<contextId of the conversation>",
  "tasks": ["<taskId>", "..."],
  "from": "<the customer's element id or agent name, never a person's name>",
  "kind": "<what kind of work, e.g. page-section, image, cleaning>",
  "tags": ["hero", "landing"],
  "terms": "<what was agreed: when, where (city and district at most), how much>",
  "iterations": 3,
  "rejected": [{ "what": "first draft with a dark background", "why": "the customer's brand is light" }],
  "result": "<what was delivered and where it lives now, e.g. block hero-v2 in the catalog>",
  "status": "done",
  "learned": "<what this order taught the element, or empty>"
}
```

2. `npm run order:save -- <file>` — it checks the form and writes the Markdown. Refused → read the reason, fix, run again.
3. Delete the temporary JSON.
4. `learned` is not empty → it is a signal for the next self-review, not a change you make now.

## Never in a summary

- Names of people, exact addresses, phone numbers, e-mails, card or account numbers, document numbers.
- Text in any language but English. Quote nobody: a quote is where personal data hides.
- Anything the customer asked to keep private.

The script refuses e-mails, phone and card numbers and Cyrillic. It cannot see a name — that rule is yours.
