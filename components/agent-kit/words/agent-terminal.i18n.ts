// СЛОВА ТЕРМИНАЛА АГЕНТА — рядом с самим островком (267-1).
//
// 🔒 ПЕРЕНОС СМЫСЛА МАСТЕРСКОЙ ПАМЯТИ, А НЕ ЕЁ ТЕКСТА: там терминал строит службу памяти, здесь — службу
// входа узла. Предупреждение о риске и слова «спит / работает / остановлен» — те же по смыслу, потому что
// те же по поведению.

export type AgentTerminalWords = {
  folderLabel: string
  noFolder: string
  /** 552-4б: у элемента без групп навыков нет отдельной сессии рабочего процесса */
  noModes: string
  /** подсказка первого запуска: выбор по умолчанию в вопросе о доверии — «No, exit» (владелец нажал Enter и вышел) */
  firstRun: string
  warnTitle: string
  warnBody: string
  warnPoints: string[]
  sleepingTitle: string
  sleepingBody: string
  start: string
  /** 708-2: продолжить записанный разговор, начать новый и почему кнопка такая (как кончилась прошлая сессия, полнота окна). */
  resumeContinue: string
  resumeNew: string
  resumeWhy: Record<"stopped" | "exited" | "channel-failed" | "lost" | "closed", string>
  resumeFill: string
  resumeFull: string
  starting: string
  running: string
  keepsRunning: string
  clear: string
  stop: string
  stopped: string
  exited: string
  offline: string
  forbidden: string
  /** 372-2: выход из отказа на временном адресе. */
  exitWhy: string
  exitOpen: string
  /** Окно вставки (шаг 316). */
  paste: string
  pasteTitle: string
  pasteText: string
  pastePlaceholder: string
  pasteInsert: string
  pasteInsertSend: string
  pasteNeedsRun: string
  pasteCancel: string
  pasteKeyLink: string
  /** 551-7: задача из ссылки ушла спящему терминалу вместе с запуском. */
  taskAtStart: string
  /** 675-2: идёт сборка ядра — вместо карточки запуска */
  buildRunning: string
  buildNoStart: string
  buildEnded: string
  /** голая `serve:rebuild`: конец без вердикта */
  buildBack: string
  /** 675-4: молчат и ядро, и чтец */
  buildSilent: string
  coreSilent: string
  coreSilentText: string
  buildCloseStart: string
  buildClose: string
  buildWoke: string
}

const DICT: Record<string, AgentTerminalWords> = {
  en: {
    folderLabel: "The agent starts in:",
    noFolder: "This service is not installed on this node, so the agent has no folder to live in.",
    noModes: "This element has no separate working-process session: its skills are not split into groups yet. Its agent does all work in the Build terminal.",
    firstRun: "First start: Claude Code asks whether you trust this folder, and «No, exit» is selected by default. Press ↓ to choose «Yes, I trust this folder», then Enter.",
    warnTitle: "This is a real command line of this computer",
    warnBody:
      "Claude Code here works inside the folder of this service and can change its files. A service broken here stays broken for everyone who uses it — including you on the public address.",
    warnPoints: [
      "Your way back: run the node in development mode on this computer — sign-in is lifted there — and return to the last working state.",
      "Rebuilding or restarting the node ends this session; the agent starts again from the button.",
      "The agent uses your Claude subscription — the same limit as your work at the computer and the Telegram bot.",
    ],
    sleepingTitle: "The terminal is asleep",
    sleepingBody: "Nothing runs until you press the button: no process, no load on the computer.",
    start: "Start the agent",
    resumeContinue: "Continue the conversation",
    resumeNew: "New conversation",
    resumeWhy: {
      stopped: "The last session was stopped with the Stop button — its conversation is kept whole and can go on.",
      exited: "The last session ended by itself — its conversation is kept whole and can go on.",
      "channel-failed": "The last session stopped when its Telegram channel failed — its conversation is kept whole and can go on.",
      lost: "The last session was cut off (the computer or the node went down) — its conversation is kept whole and can go on.",
      closed: "The last session was turned off on purpose. You can still continue its conversation.",
    },
    resumeFill: "Its window is {used} % full.",
    resumeFull: "Its window is {used} % full — a new conversation is better: the agent reads its state record and goes on from there.",
    starting: "Starting…",
    running: "Running",
    keepsRunning: "Leaving this page does not stop it.",
    clear: "Clear the screen",
    stop: "Stop",
    stopped: "Stopped.",
    exited: "The agent has finished.",
    offline: "The connection to the node was lost.",
    forbidden: "The terminal is open only to the architect, and only from this computer or your own domain.",
    exitWhy: "This is closed on the temporary internet address so that nobody with the link can run commands on your computer. Open this page on the computer where the node runs, or connect your own domain.",
    exitOpen: "Open on this computer",
    paste: "Paste",
    pasteTitle: "Paste into the terminal",
    pasteText: "The text goes into the agent's input line as one paste. Nothing reaches the agent until you press a button below.",
    pastePlaceholder: "Paste or type the text for the agent…",
    pasteInsert: "Insert",
    pasteInsertSend: "Insert and send",
    pasteNeedsRun: "Start the agent first — the text is kept here.",
    pasteCancel: "Cancel",
    pasteKeyLink: "Add the OpenAI key",
    taskAtStart: "The task from the link went to the agent with the start, as its first request. If Claude Code asks whether you trust this folder, the node answers it.",
    buildRunning: "The core is building — the agent cannot start now",
    buildNoStart: "The build has stopped the node, the agent's session too. Do not start the agent until the build ends: it would be stopped again.",
    buildEnded: "The core build has ended",
    buildBack: "The core answers again.",
    buildSilent: "The core does not answer — a build or a restart is under way. The page waits for it.",
    coreSilent: "The core does not answer",
    coreSilentText: "Nothing is being built: neither the core nor the build reader has answered for over three minutes. The core is stopped or has fallen — on this computer `npm run serve:status` says what happened, `npm run serve:start` brings it up. The page goes on waiting.",
    buildCloseStart: "Close and start the agent",
    buildClose: "Close",
    buildWoke: "The agent came back by itself, in the same conversation — connecting…",
  },
  ru: {
    folderLabel: "Агент запускается в папке:",
    noFolder: "На этом узле нет этой службы, и агенту негде жить.",
    noModes: "У этого элемента нет отдельной сессии рабочего процесса: его навыки ещё не разложены по группам. Всю работу агент делает в терминале «Строительства».",
    firstRun: "Первый запуск: Claude Code спросит, доверяете ли вы этой папке, и по умолчанию выбрано «No, exit». Нажмите ↓, чтобы выбрать «Yes, I trust this folder», затем Enter.",
    warnTitle: "Это настоящая командная строка этого компьютера",
    warnBody:
      "Claude Code здесь работает в папке этой службы и может менять её файлы. Сломанная здесь служба сломана для всех, кто ею пользуется, — и для вас на публичном адресе тоже.",
    warnPoints: [
      "Путь назад: запустите узел в режиме разработки на этом компьютере — там вход снят — и вернитесь к последнему рабочему состоянию.",
      "Пересборка или перезапуск узла завершает эту сессию; агент запускается заново кнопкой.",
      "Агент тратит вашу подписку Claude — тот же лимит, что и ваша работа за компьютером и Telegram-бот.",
    ],
    sleepingTitle: "Терминал спит",
    sleepingBody: "Пока вы не нажали кнопку, ничего не запущено: ни процесса, ни нагрузки на компьютер.",
    start: "Запустить агента",
    resumeContinue: "Продолжить разговор",
    resumeNew: "Новый разговор",
    resumeWhy: {
      stopped: "Прошлую сессию остановили кнопкой «Стоп» — её разговор сохранён целиком, его можно продолжить.",
      exited: "Прошлая сессия завершилась сама — её разговор сохранён целиком, его можно продолжить.",
      "channel-failed": "Прошлая сессия остановилась, когда отказал её канал Telegram, — разговор сохранён целиком, его можно продолжить.",
      lost: "Прошлая сессия оборвалась (выключился компьютер или узел) — её разговор сохранён целиком, его можно продолжить.",
      closed: "Прошлую сессию выключили намеренно. Её разговор всё равно можно продолжить.",
    },
    resumeFill: "Её окно заполнено на {used} %.",
    resumeFull: "Её окно заполнено на {used} % — лучше новый разговор: агент прочитает свою запись состояния и продолжит с неё.",
    starting: "Запускаю…",
    running: "Работает",
    keepsRunning: "Уход с этой страницы его не останавливает.",
    clear: "Очистить экран",
    stop: "Остановить",
    stopped: "Остановлен.",
    exited: "Агент завершил работу.",
    offline: "Связь с узлом потеряна.",
    forbidden: "Терминал открыт только архитектору и только с этого компьютера или со своего домена.",
    exitWhy: "На временном адресе в интернете это закрыто, чтобы никто по ссылке не мог выполнять команды на вашем компьютере. Откройте эту страницу на компьютере, где работает узел, или подключите свой домен.",
    exitOpen: "Открыть на этом компьютере",
    paste: "Вставить",
    pasteTitle: "Вставить в терминал",
    pasteText: "Текст встанет в строку ввода агента одной вставкой. До агента ничего не дойдёт, пока вы не нажмёте кнопку ниже.",
    pastePlaceholder: "Вставьте или напишите текст для агента…",
    pasteInsert: "Вставить",
    pasteInsertSend: "Вставить и отправить",
    pasteNeedsRun: "Сначала запустите агента — текст останется здесь.",
    pasteCancel: "Отмена",
    pasteKeyLink: "Добавить ключ OpenAI",
    taskAtStart: "Задача из ссылки ушла агенту вместе с запуском — первым поручением. Если Claude Code спросит, доверяете ли вы этой папке, узел ответит сам.",
    buildRunning: "Идёт сборка ядра — агента сейчас не запустить",
    buildNoStart: "Сборка остановила узел, а вместе с ним и сессию агента. Не запускайте агента, пока сборка не закончится: она остановит его снова.",
    buildEnded: "Сборка ядра закончилась",
    buildBack: "Ядро снова отвечает.",
    buildSilent: "Ядро не отвечает — идёт сборка или перезапуск. Страница ждёт его.",
    coreSilent: "Ядро не отвечает",
    coreSilentText: "Сборки нет: ни ядро, ни чтец сборки не отвечают больше трёх минут. Ядро остановлено или упало — на этом компьютере `npm run serve:status` скажет, что с ним, а `npm run serve:start` поднимет его. Страница продолжает ждать.",
    buildCloseStart: "Закрыть и запустить агента",
    buildClose: "Закрыть",
    buildWoke: "Агент вернулся сам, в тот же разговор, — подключаюсь…",
  },
}

/** Слова на выбранном языке; незнакомый язык честно деградирует до английского. */
export function agentTerminalWords(lang: string): AgentTerminalWords {
  return DICT[lang] ?? DICT.en
}
