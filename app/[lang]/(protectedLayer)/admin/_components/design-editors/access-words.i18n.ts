// 579-1: что редактор своего оформления говорит вместо полей. Общие для четырёх страниц `admin/design/*`; выбирает сервер.
import type { AccessWords } from './settings-access'

const EN: AccessWords = {
  loading: 'Loading the design…',
  signin: 'Sign in as the architect to see and change the design of this element.',
  signinLink: 'Sign in',
  forbidden: 'You are signed in, but only the architect can see and change the design of this element.',
  unavailable: 'The sign-in service is not answering right now. Try again in a minute.',
  error: 'The design could not be read. Nothing was changed.',
  linked: 'This element takes its design from the shared Design element of the node, so it is changed there. To keep a design of its own, turn off the link to Design in the element’s settings in the core; then this page edits it.',
  linkedDesign: 'Open the shared Design',
  linkedSettings: 'Links of this element',
}

const RU: AccessWords = {
  loading: 'Загружаю оформление…',
  signin: 'Войдите как архитектор, чтобы видеть и менять оформление этого элемента.',
  signinLink: 'Войти',
  forbidden: 'Вы вошли, но видеть и менять оформление этого элемента может только архитектор.',
  unavailable: 'Служба входа сейчас не отвечает. Попробуйте через минуту.',
  error: 'Оформление не удалось прочитать. Ничего не изменено.',
  linked: 'Этот элемент берёт оформление из общего элемента «Дизайн» узла, поэтому меняют его там. Чтобы вести своё оформление, выключите связь с «Дизайном» в настройках элемента в ядре; тогда его меняют на этой странице.',
  linkedDesign: 'Открыть общий «Дизайн»',
  linkedSettings: 'Связи этого элемента',
}

export const designAccessWords = (lang: string): AccessWords => (lang === 'ru' ? RU : EN)
