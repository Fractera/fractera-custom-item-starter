import type { Access, AccessWords } from './settings-access'

// Что показать вместо редактора, когда дверь его не отдала. Состояние названо словами — не пустым экраном.
// 579-2: `linked` — настройки этого элемента ведёт общий CONFIG; две ссылки: туда и к выключателю связи в ядре.
export function AccessNotice({ access, words, loginHref, configHref, settingsHref }: {
  access: Access
  words: AccessWords
  loginHref?: string
  configHref?: string
  settingsHref?: string
}) {
  if (access === 'ok') return null
  const text =
    access === 'loading' ? words.loading
    : access === 'linked' ? words.linked
    : access === 'signin' ? words.signin
    : access === 'forbidden' ? words.forbidden
    : access === 'unavailable' ? words.unavailable
    : words.error
  return (
    <div data-block="v1b33" className="flex flex-col gap-2 rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground" role="status">
      <p data-block="l46xs">
        {text}{' '}
        {access === 'signin' && loginHref && (
          <a href={loginHref} className="font-medium text-primary hover:underline">{words.signinLink}</a>
        )}
      </p>
      {access === 'linked' && (configHref || settingsHref) && (
        <p data-block="dog6v" className="flex flex-wrap gap-4">
          {configHref && <a href={configHref} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">{words.linkedConfig}</a>}
          {settingsHref && <a href={settingsHref} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">{words.linkedSettings}</a>}
        </p>
      )}
    </div>
  )
}
