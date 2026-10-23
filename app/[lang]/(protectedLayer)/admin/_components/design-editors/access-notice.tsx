import type { Access, AccessWords } from './settings-access'

// Что показать вместо редактора, когда дверь его не отдала. Состояние названо словами — не пустым экраном.
// 579-1: `linked` — оформление этого элемента ведёт общий «Дизайн»; две ссылки: туда и к выключателю связи в ядре.
export function AccessNotice({ access, words, loginHref, designHref, settingsHref }: {
  access: Access
  words: AccessWords
  loginHref?: string
  designHref?: string
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
    <div data-block="zsl0a" className="flex flex-col gap-2 rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground" role="status">
      <p data-block="d4lk1">
        {text}{' '}
        {access === 'signin' && loginHref && (
          <a href={loginHref} className="font-medium text-primary hover:underline">{words.signinLink}</a>
        )}
      </p>
      {access === 'linked' && (designHref || settingsHref) && (
        <p data-block="d4lk2" className="flex flex-wrap gap-4">
          {designHref && <a href={designHref} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">{words.linkedDesign}</a>}
          {settingsHref && <a href={settingsHref} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">{words.linkedSettings}</a>}
        </p>
      )}
    </div>
  )
}
