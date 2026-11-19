import { ticketFrom, whoByTicket } from '@/lib/auth/ticket';
import { authUrl as nodeAuthUrl } from '@/lib/microservices/urls';
import { NextRequest } from "next/server"
import { shouldBypassAuth } from "@/lib/auth/auth-bypass"
import { isOwnerAtMachine } from "@/lib/auth/owner-at-machine"
import { isTemporaryPublicAddress } from "@/lib/auth/temporary-address"
import { ownId } from "@/lib/own-id"

export type AppSession = {
  userId: string
  email: string
  roles: string[]
  /**
   * Права выданы не входом, а тем, что человек сидит за этой машиной
   * (2026-09-19). Интерфейс обязан сказать об этом вслух: человек должен
   * понимать, ПОЧЕМУ его пустили без пароля, иначе он решит, что сайт открыт
   * всем подряд.
   */
  viaMachine?: true
}

export async function getSession(req?: NextRequest): Promise<AppSession | null> {
  const agentId = req?.headers.get('x-agent-identity')
  if (agentId) {
    return { userId: `${agentId}@agent`, email: `${agentId}@agent`, roles: ['agent'] }
  }

  if (shouldBypassAuth()) {
    return { userId: 'demo@local', email: 'demo@local', roles: ['architect'] }
  }

  // 🔒 ХОЗЯИН ЗА КЛАВИАТУРОЙ ЭТОЙ МАШИНЫ — решение владельца 2026-09-19. Признак
  // и причина, по которой он безопасен, — в `owner-at-machine.ts`; там же замер,
  // доказавший, что туннель не подменяет `Host`.
  //
  // 🛑 СТОИТ ПОСЛЕ ОБХОДА РАЗРАБОТКИ, НО ДО ЧТЕНИЯ КУКИ — и порядок важен: это
  // не «ещё один способ войти», а ответ на вопрос «кто спрашивает». Человеку с
  // машины кука не нужна; всем остальным она обязательна.
  if (isOwnerAtMachine(req)) {
    return { userId: 'owner@machine', email: 'owner@machine', roles: ['architect'], viaMachine: true }
  }

  // 🔒 ВРЕМЕННЫЙ АДРЕС УЗЛА — ВТОРОЕ МЕСТО ТОГО ЖЕ ПРАВИЛА (243). Решение
  // владельца 2026-09-19: на временном домене защиту игнорируем, иначе человек не
  // может пользоваться собственными вкладками даже для тестирования.
  //
  // ✗ ПОЧЕМУ ОДНИХ ВОРОТ СТРАНИЦ НЕ ХВАТИЛО — УВИДЕНО ГЛАЗАМИ В БРАУЗЕРЕ, А НЕ
  // `curl`: страницы слоя открылись и отдавали 200, а человек всё равно упирался
  // в окно «Эта страница вам недоступна. Требуется одна из этих ролей: architect».
  // Замок там клиентский (`components/auth/access-gate.client.tsx`), он спрашивает
  // `/api/me`, а ответ приходит отсюда: ролей нет — значит отказ. Ровно тот закон
  // проекта, что обход обязан быть двухслойным: страница и дверь решают отдельно,
  // и открытая страница с закрытой дверью выглядит как поломка продукта.
  //
  // 🛑 ЦЕНА ТА ЖЕ, ЧТО У ВОРОТ: пока туннель открыт, всякий, кто знает ссылку,
  // получает роль архитектора этого узла. Это сознательный размен владельца, а не
  // умолчание, и на постоянном домене он не действует.
  if (isTemporaryPublicAddress(req)) {
    return { userId: 'owner@temporary', email: 'owner@temporary', roles: ['architect'], viaMachine: true }
  }

  // 🪦 Здесь стояла ветка «витрины Fractera» (256-2): на имени fractera.ai любой запрос чтения получал сессию
  // демо-посетителя со всеми ролями. Убрана по слову владельца 2026-11-19 (шаг ядра 800): его настоящий сервер встал
  // на fractera.ai, и витрина подменила вход («Личный кабинет» вместо «Войти», выход не работал), а имя бралось из
  // `X-Forwarded-Host`, который присылает кто угодно. Теперь fractera.ai — обычное имя, как любое другое.

  // 🔒 `||`, А НЕ `??`, И ЭТО НЕ ВКУСОВЩИНА — ОПЛАЧЕНО ПОТЕРЕЙ ВХОДА НА ЖИВОМ
  // САЙТЕ (2026-09-01).
  //
  // `??` заменяет только `null` и `undefined`. `NEXT_PUBLIC_AUTH_URL` в слоте —
  // ПУСТАЯ СТРОКА, и она запекается в бандл при сборке: выражение возвращало
  // `""`, дальше шёл `fetch("/api/session")` — относительный адрес, который на
  // сервере падает молча в `catch`. Наружу это выглядело как честный `401`:
  // человек вошёл, служба сессию признавала, а сайт показывал кнопку «войти».
  //
  // 🛑 ДЕФЕКТ БЫЛ НЕВИДИМ, ПОКА СЕРВЕР РАБОТАЛ ПО IP: там `shouldBypassAuth()`
  // отвечал раньше, и до этой строки дело не доходило. Перевод на домен включил
  // настоящий путь — и сломанным он был всё это время.
  const authUrl =
    nodeAuthUrl() ?? ''
  const cookie = req?.headers.get('cookie') ?? ''
  // 🔒 328-3: БИЛЕТ ЕДИНОГО ВХОДА — на собственном домене элемента кука службы входа не живёт; человека знает центр по
  // билету, который `/api/auth/callback` поставил своей кукой. Погашенный билет (выход в центре) — дальше обычный путь.
  const ticket = ticketFrom(cookie)
  if (ticket) {
    const who = await whoByTicket(ticket)
    if (who) return { userId: who.userId, email: who.email ?? '', roles: who.roles }
  }
  // 🔒 580: САЙТ НАЗЫВАЕТ СЕБЯ (`x-fractera-element`). На сайте приложения завода служба входа признаёт запись узла только у
  // архитектора и гостя — администратор узла не администратор чужого приложения (закон 580, владелец 2026-10-24).
  try {
    const res = await fetch(`${authUrl}/api/session`, { headers: { cookie, "x-fractera-element": ownId() ?? "" } })
    if (!res.ok) return null
    return res.json() as Promise<AppSession>
  } catch {
    return null
  }
}
