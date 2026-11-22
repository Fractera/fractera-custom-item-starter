// ТИПЫ микросервиса «голосовой ввод» — общий контракт клиентской и серверной половины в одном месте.
import type { RefObject } from "react";

/** The OpenAI model that turns speech into text (the owner, 2026-11-12: «gpt-4o-mini-transcribe-2025-12-15 need for transcribe»). One
 *  name for the server's call and the interface's mark, so what the field says is what runs. OpenAI marks this snapshot Deprecated. */
export const TRANSCRIBE_MODEL = "gpt-4o-mini-transcribe-2025-12-15";
/** The owner, 2026-11-12: «if this model will not available use gpt-transcribe» — once, when OpenAI no longer knows the main one. */
export const TRANSCRIBE_FALLBACK_MODEL = "gpt-transcribe";

/** Поле, принимающее речь; его курсор решает, КУДА встанет расшифровка. */
export type VoiceTargetRef =
  | RefObject<HTMLTextAreaElement | null>
  | RefObject<HTMLInputElement | null>;

/** Пропсы клиентского компонента `VoiceInput`. */
export type VoiceInputProps = {
  targetRef: VoiceTargetRef;
  value: string;
  /** Зовётся с полным новым текстом; курсор остаётся сразу после вставленных слов. */
  onChange: (next: string) => void;
  lang: string;
  disabled?: boolean;
};

/** Результат серверной расшифровки — что дверь `api/transcribe` возвращает клиенту. */
export type TranscribeResult =
  | { ok: true; text: string }
  | { ok: false; status: number; error: string; reason?: string; link?: string | null; words?: string; linkLabel?: string | null };
