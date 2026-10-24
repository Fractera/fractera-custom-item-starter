// Слова виджета «учётные записи этого приложения» (узел, шаг 580-3). `en` основа, `ru` перевод. Словарь серверный: страница зовёт
// `usersTableUi(lang)` и передаёт островку пропсом, клиент импортирует только тип.
//
// 🔒 ПЕРЕНЕСЕНЫ ИЗ ВКЛАДКИ «ПОЛЬЗОВАТЕЛИ» ЭЛЕМЕНТА ВХОДА (ядро, `components/node-users/node-users.i18n.ts`, шаг 559) — без слов
// об организациях: владелец 2026-10-24, «здесь нельзя будет переключить пользователя в организации а в остальном этой таблице
// пользователей будет редактироваться также как и таблица пользователей нативном элементе авторизации». Слова таблицы — из
// `sections/table.i18n.ts` ядра; кнопка раскрытия и подсказка — прежние слова этой страницы.
//
// 🔒 ДВА ЯЗЫКА ВМЕСТО ДЕСЯТИ — ЗАПИСАННЫЙ ДОЛГ (решение владельца 2026-08-21): недостающие стоят в
// `development-docs/TRANSLATION-DEBT.md`.

export type TableUi = {
  search: string
  searchDo: string
  reset: string
  empty: string
  /** `{from}`, `{to}`, `{total}` */
  shown: string
  perPage: string
  first: string
  prev: string
  next: string
  last: string
  /** `{n}`, `{of}` */
  page: string
}

export type UsersTableUi = {
  tableTitle: string
  reveal: string
  revealHint: string
  loading: string
  forbidden: string
  unreachable: string
  failed: string
  cols: { user: string; email: string; roles: string; methods: string; status: string; created: string; lastSeen: string; edit: string; select: string; selectPage: string }
  filterRole: string
  any: string
  sortNewest: string
  sortOldest: string
  status: { active: string; blocked: string; anonymized: string }
  methods: Record<string, string>
  guest: string
  noName: string
  anonymizedName: string
  lastSeenNever: string
  editTitle: string
  fields: { nickname: string; firstName: string; lastName: string; email: string; avatar: string; roles: string; blocked: string; tracking: string; marketing: string; wallet: string }
  avatarUpload: string
  avatarRemove: string
  avatarUploading: string
  tri: { unset: string; yes: string; no: string }
  trackingHint: string
  save: string
  cancel: string
  confirm: string
  confirmSaveTitle: string
  confirmSaveText: string
  historyLink: string
  history: { roles: string; methods: string; marketing: string; tracking: string; log: string; messenger: string }
  historyCols: { at: string; who: string; what: string }
  historyEmpty: string
  messengerEmpty: string
  actions: { block: string; unblock: string; addRole: string; removeRole: string; noMarketing: string; noTracking: string; anonymize: string }
  selected: string
  clear: string
  pickRole: string
  confirmBatchTitle: string
  /** `{action}`, `{n}` */
  confirmBatchText: string
  marketingBatchNote: string
  /** `{done}`, `{skipped}` */
  result: string
  reasons: Record<string, string>
  anonymizeTitle: string
  anonymizeErased: string
  anonymizeKept: string
  /** `{nickname}` */
  anonymizeNickname: string
  anonymizeDo: string
  logActions: Record<string, string>
  walletBad: string
  table: TableUi
}

const EN: UsersTableUi = {
  tableTitle: "Accounts",
  reveal: "Show accounts",
  revealHint: "Nothing is requested until you ask — the page opens instantly and costs the service nothing.",
  loading: "Loading accounts…",
  forbidden: "This table is open to the architect and to the administrator of this application.",
  unreachable: "The sign-in element did not answer.",
  failed: "Could not load the accounts.",
  cols: { user: "User", email: "Email", roles: "Roles", methods: "Sign-in", status: "Status", created: "Registered", lastSeen: "Last seen", edit: "Edit", select: "Select", selectPage: "Select the page" },
  filterRole: "Role",
  any: "All",
  sortNewest: "Newest first",
  sortOldest: "Oldest first",
  status: { active: "Active", blocked: "Blocked", anonymized: "Deleted (anonymized)" },
  methods: { password: "Password", guest: "Guest", google: "Google", "email-link": "Email link" },
  guest: "guest",
  noName: "—",
  anonymizedName: "Deleted user",
  lastSeenNever: "Never",
  editTitle: "Edit the user",
  fields: { nickname: "Pseudonym", firstName: "First name", lastName: "Last name", email: "Email", avatar: "Avatar", roles: "Roles", blocked: "Blocked", tracking: "Refused tracking", marketing: "Allowed marketing emails", wallet: "Wallet" },
  avatarUpload: "Upload",
  avatarRemove: "Remove",
  avatarUploading: "Uploading…",
  tri: { unset: "Not stated", yes: "Yes", no: "No" },
  trackingHint: "Recorded with its history. Analytics and mailings will read it; nothing reads it yet.",
  save: "Save",
  cancel: "Cancel",
  confirm: "Confirm",
  confirmSaveTitle: "Save the changes?",
  confirmSaveText: "The changes of one user are written at once and land in their history.",
  historyLink: "table",
  history: { roles: "Role history", methods: "Sign-in methods", marketing: "Marketing consent history", tracking: "Tracking history", log: "Log", messenger: "Messenger Web4" },
  historyCols: { at: "When", who: "Who", what: "What" },
  historyEmpty: "No records yet.",
  messengerEmpty: "No records yet: they appear when the Web4 messenger pays this user for their contact.",
  actions: { block: "Block", unblock: "Unblock", addRole: "Add a role", removeRole: "Remove a role", noMarketing: "Refuse marketing emails", noTracking: "Refuse tracking", anonymize: "Delete (anonymize)" },
  selected: "Selected: {n}",
  clear: "Clear",
  pickRole: "Role",
  confirmBatchTitle: "Apply to the selected users?",
  confirmBatchText: "«{action}» for {n} users — one request, written at once.",
  marketingBatchNote: "Consent to marketing is given by the person; it is set one user at a time in their card.",
  result: "Done: {done}. Skipped: {skipped}.",
  reasons: {
    self: "your own account", "only-architect": "only the architect of the node may change an architect or the architect role",
    already: "already so", "last-role": "the last role cannot be removed", anonymized: "already deleted", "not-found": "not found",
    "not-in-app": "the person belongs to another application", "org-locked": "organizations are not changed here",
    "bad-wallet": "the wallet is not an address 0x…", "bad-email": "the email is not valid", "email-taken": "the email belongs to another user",
    "bad-roles": "unknown role", Forbidden: "this action is open to the architect and to the administrator of this application",
  },
  anonymizeTitle: "Delete by anonymizing?",
  anonymizeErased: "Erased: first and last name, avatar and its file, password, Google link and sign-in methods, email (replaced by a service address), wallet. The person can no longer sign in.",
  anonymizeKept: "Kept: the identifier, the pseudonym, the log and the histories of roles and consents.",
  anonymizeNickname: "The pseudonym «{nickname}» stays. If it is a real name (Google puts the name there), change it before deleting.",
  anonymizeDo: "Delete",
  logActions: { created: "created", signed_in: "signed in", roles_changed: "roles changed", blocked: "blocked", unblocked: "unblocked", anonymized: "anonymized", profile_changed: "profile changed", method_linked: "sign-in method linked", org_added: "added to an organization", org_removed: "removed from an organization", consent_changed: "consent changed", messenger_contact: "Messenger contact" },
  walletBad: "An address 0x followed by 40 hex characters.",
  table: {
    search: "Search the table", searchDo: "Search", reset: "Reset filters", empty: "Nothing matches this filter.", shown: "Showing {from}-{to} of {total}",
    perPage: "Per page", first: "First page", prev: "Back", next: "Forward", last: "Last page", page: "Page {n} of {of}",
  },
}

const RU: UsersTableUi = {
  tableTitle: "Записи",
  reveal: "Показать записи",
  revealHint: "Пока не попросите, ничего не запрашивается — страница открывается мгновенно и не стоит службе ничего.",
  loading: "Загружаем записи…",
  forbidden: "Эта таблица открыта архитектору и администратору этого приложения.",
  unreachable: "Элемент входа не ответил.",
  failed: "Не удалось загрузить записи.",
  cols: { user: "Пользователь", email: "Email", roles: "Роли", methods: "Способ входа", status: "Статус", created: "Регистрация", lastSeen: "Последний вход", edit: "Править", select: "Выбрать", selectPage: "Выбрать страницу" },
  filterRole: "Роль",
  any: "Все",
  sortNewest: "Сначала новые",
  sortOldest: "Сначала старые",
  status: { active: "Активен", blocked: "Заблокирован", anonymized: "Удалён (обезличен)" },
  methods: { password: "Пароль", guest: "Гость", google: "Google", "email-link": "Ссылка в письме" },
  guest: "гость",
  noName: "—",
  anonymizedName: "Удалённый пользователь",
  lastSeenNever: "Ни разу",
  editTitle: "Правка пользователя",
  fields: { nickname: "Псевдоним", firstName: "Имя", lastName: "Фамилия", email: "Email", avatar: "Аватарка", roles: "Роли", blocked: "Заблокирован", tracking: "Запретил отслеживание", marketing: "Разрешил маркетинговые рассылки", wallet: "Кошелёк" },
  avatarUpload: "Загрузить",
  avatarRemove: "Убрать",
  avatarUploading: "Загружаю…",
  tri: { unset: "Не указано", yes: "Да", no: "Нет" },
  trackingHint: "Записывается с историей. Читать отметку будут аналитика и рассылки; сейчас её не читает никто.",
  save: "Сохранить",
  cancel: "Отмена",
  confirm: "Подтвердить",
  confirmSaveTitle: "Сохранить изменения?",
  confirmSaveText: "Изменения одного пользователя записываются сразу и попадают в его историю.",
  historyLink: "таблица",
  history: { roles: "История ролей", methods: "Способы входа", marketing: "История согласий на рассылки", tracking: "История отслеживания", log: "Журнал", messenger: "Messenger Web4" },
  historyCols: { at: "Когда", who: "Кто", what: "Что" },
  historyEmpty: "Записей пока нет.",
  messengerEmpty: "Записей пока нет: они появятся, когда мессенджер Web4 заплатит этому человеку за контакт.",
  actions: { block: "Заблокировать", unblock: "Разблокировать", addRole: "Добавить роль", removeRole: "Снять роль", noMarketing: "Запретить рассылки", noTracking: "Запретить отслеживание", anonymize: "Удалить (обезличить)" },
  selected: "Выбрано: {n}",
  clear: "Снять выбор",
  pickRole: "Роль",
  confirmBatchTitle: "Применить к выбранным?",
  confirmBatchText: "«{action}» для {n} пользователей — одним запросом, запишется сразу.",
  marketingBatchNote: "Согласие на рассылки даёт сам человек — его ставят по одному, в карточке пользователя.",
  result: "Сделано: {done}. Пропущено: {skipped}.",
  reasons: {
    self: "своя учётная запись", "only-architect": "архитектора и роль архитектора меняет только архитектор узла",
    already: "уже так", "last-role": "последнюю роль снять нельзя", anonymized: "уже удалён", "not-found": "не найден",
    "not-in-app": "человек из другого приложения", "org-locked": "организации здесь не меняются",
    "bad-wallet": "кошелёк — не адрес 0x…", "bad-email": "неверный email", "email-taken": "email занят другим пользователем",
    "bad-roles": "неизвестная роль", Forbidden: "это действие открыто архитектору и администратору этого приложения",
  },
  anonymizeTitle: "Удалить обезличиванием?",
  anonymizeErased: "Стираются: имя и фамилия, аватарка и её файл, пароль, связь с Google и способы входа, email (заменяется служебным), кошелёк. Войти человек больше не сможет.",
  anonymizeKept: "Остаются: идентификатор, псевдоним, журнал, истории ролей и согласий.",
  anonymizeNickname: "Псевдоним «{nickname}» останется. Если это настоящее имя (Google кладёт туда имя), замените его до удаления.",
  anonymizeDo: "Удалить",
  logActions: { created: "создан", signed_in: "вход", roles_changed: "роли изменены", blocked: "заблокирован", unblocked: "разблокирован", anonymized: "обезличен", profile_changed: "профиль изменён", method_linked: "привязан способ входа", org_added: "добавлен в организацию", org_removed: "убран из организации", consent_changed: "согласие изменено", messenger_contact: "контакт Messenger" },
  walletBad: "Адрес 0x и 40 шестнадцатеричных знаков.",
  table: {
    search: "Поиск по таблице", searchDo: "Найти", reset: "Сбросить отбор", empty: "Под этот отбор ничего не попало.", shown: "Показано {from}-{to} из {total}",
    perPage: "На странице", first: "Первая страница", prev: "Назад", next: "Вперёд", last: "Последняя страница", page: "Страница {n} из {of}",
  },
}

export function usersTableUi(lang: string): UsersTableUi {
  return lang === "ru" ? RU : EN
}
