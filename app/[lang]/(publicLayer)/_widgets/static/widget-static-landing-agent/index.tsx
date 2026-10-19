import "@fontsource/barlow-condensed/500.css"
import "@fontsource/barlow-condensed/600.css"
import "@fontsource/barlow-condensed/700.css"
import "@fontsource/barlow/400.css"
import "@fontsource/barlow/500.css"
import "@fontsource/barlow/600.css"
import "@fontsource-variable/jetbrains-mono"
import { ArrowDown, ArrowRight, ArrowUp, Check, Code, Footprints, MessagesSquare, Ticket, TrainFront } from "lucide-react"
import { landingWords, type LandingExtra } from "./words"
import { AgentChat } from "./agent-chat.client"
import { StaticImage } from "@/components/media/static-image.server"
import s from "./landing-agent.module.css"
import { SplitFlap } from "./split-flap.client"
import { TransitMap } from "./transit-map.client"
import { LostRoute } from "./lost-route"
import { Walkers } from "./walkers.client"
import { VersusTabs } from "./versus-tabs.client"
import { PortalStation } from "./portal-station.client"
import { HelpDesk } from "./help-desk.client"
import { WaitingRoom } from "./waiting-room"
import { voiceStrings } from "@/lib/i18n/voice-field.i18n"
import { Button } from "@/components/ui/button"

// Штрихкод корешка билета: постоянный рисунок (ширины полос и промежутков), а не код чего-либо.
const BARS: [number, number][] = (() => {
  const w = [3, 1, 2, 1, 1, 3, 2, 1, 1, 2, 3, 1, 2, 2, 1, 1, 3, 1, 1, 2, 2, 1, 3, 2, 1, 1, 2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 2, 1, 1, 3]
  const out: [number, number][] = []
  let x = 0
  for (let i = 0; i < w.length && x < 160; i += 2) { out.push([x, w[i] * 1.6]); x += (w[i] + (w[i + 1] ?? 1)) * 1.6 }
  return out
})()

// Чат агентов главной (333-12) — тот же островок, свой вид: классы этого виджета вместо классов главной.
const chatClasses = {
  chat: s.chat, chatHead: s.chatHead, chatDot: s.chatDot, chatLog: s.chatLog, chatContent: s.chatContent,
  chatMsg: s.chatMsg, msgMeta: s.msgMeta, msgMetaRight: s.msgMetaRight, msgWho: s.msgWho, msgAvatar: s.msgAvatar,
  contract: s.contract, msgText: s.msgText, msgTextRight: s.msgTextRight, aeBlock: s.aeBlock, typing: s.typing,
  typingRight: s.typingRight, system: s.system, systemStamp: s.systemStamp, systemBadge: s.systemBadge, endCta: s.endCta,
}

// «ДИЗАЙН АГЕНТА» — ЛЕНДИНГ ГЛАВНОЙ, ПЕРЕРИСОВАННЫЙ АГЕНТОМ ЭЛЕМЕНТА ПО НАВЫКУ impeccable НА ЭТАЛОННОМ МАКЕТЕ
// (`components/landing-impeccable/`, правило «The reference maquette comes first» в `impeccable-on-design.md`). Мир тот же —
// швейцарское табло отправлений, та же композиция и тот же контраст; цвета — отношения к `--primary` (README.md). Табло
// висит на стене и не двигается; движутся только флапы: каждое слово табло — барабаны split-flap (островок
// `split-flap.client.tsx`, набор флапов — `drum.ts`), главное окно перебирает три назначения, и строка назначения зажигает
// свою платформу (`data-shown` на табло). Слова — данные главной через `landingWords`; для чтения экраном и поиска слово
// стоит рядом обычным текстом, барабаны скрыты.

export function LandingAgent({ lang }: { lang: string }) {
  const w = landingWords(lang)
  if (!w) return null
  const { hero, can, hood, x } = w
  const b = x.board
  const outcomes = x.outcomes.slice(0, 3)
  const openSource = (x as LandingExtra & { openSource?: string }).openSource
  const TitleTag = openSource ? "p" : "h1"

  return (
    <div data-block="cjguc" className={s.page}>
      {/* Первый экран (слово владельца, 333-16): на широком — две колонки во всю высоту первого экрана; слева табличка
          «Открытый код» в верхнем левом углу, название и подзаголовок; справа чат агентов прямо на фоне таблички. */}
      <section data-block="adzil" className={s.sign}>
        <div data-block="d0prw" className={`${s.wrap} ${s.signGrid}`}>
          <div data-block="b4u43" className={s.signMain}>
            <div data-block="r9ng5" className={s.signRow}>
              {/* Длинный заголовок (слово владельца 2026-09-29, ~200 знаков) — меньший кегль, чтобы первый экран его вместил. */}
              {/* «ты приглашен» (слово владельца 2026-09-29) — белая эмалевая плашка с внутренней рамкой и бликом, как табличка;
                  слова берутся из данных (`landing.titleMark`), первое вхождение в заголовке. */}
              {/* SEO (владелец 2026-09-30, ТЗ от Google): H1 — бейдж «Open-source фреймворк AI-агентов для Web3-разработки», манифест —
                  абзац; классы и data-block те же. Нет бейджа — H1 остаётся на манифесте, страница без H1 не бывает. */}
              <TitleTag data-block="akqbz" className={s.signTitle} data-long={hero.title.length > 60 ? "" : undefined}>
                {x.titleMark && hero.title.includes(x.titleMark) ? (
                  <>
                    {hero.title.slice(0, hero.title.indexOf(x.titleMark))}
                    <span className={s.titleMark}>{x.titleMark}</span>
                    {hero.title.slice(hero.title.indexOf(x.titleMark) + x.titleMark.length)}
                  </>
                ) : hero.title}
              </TitleTag>
              {openSource && (
                // Эмалевая табличка на стене вокзала: белая эмаль, кант цвета табло, квадрат-«платформа» со знаком кода.
                <h1 data-block="eehho" className={s.plate}>
                  <span className={s.plateMark} aria-hidden="true"><Code className="size-4" strokeWidth={2.5} /></span>
                  {/* Слово владельца 2026-09-29: главные слова (в данных — между звёздочками: Open-source, AI, Web3) —
                      основным шрифтом и крупнее, остальное — мельче: эффект выделения, а не занижения. */}
                  <span className={s.plateText}>
                    {openSource.split(/\*([^*]+)\*/).map((part, i) => (i % 2 ? <strong key={i} className={s.plateKey}>{part}</strong> : part))}
                  </span>
                </h1>
              )}
            </div>
            <p data-block="fh05d" className={s.signSub}>
              {x.titleSub}
              {/* Слово владельца 2026-09-30: [?] у подзаголовка — как у «От идеи до enterprise-продукта…» на табло. */}
              {x.titleSubHint && (
                <span className={`${s.hintWrap} ${s.subHint}`}>
                  <Button variant="bare" size="bare" type="button" className={s.hintBtn} aria-label={x.titleSubHintLabel} aria-describedby="agent-sub-hint">?</Button>
                  <span role="tooltip" id="agent-sub-hint" className={s.hint}>
                    {x.titleSubHint.split("\n\n").map((t) => <span key={t} className={s.hintPara}>{t}</span>)}
                  </span>
                </span>
              )}
            </p>
            {/* 342 (владелец 2026-09-30): «add CTA to first screen as another red button» — та же кнопка, что под табло
                (слова и адрес подписки — `hero.cta`), на первом экране. */}
            {hero.cta && (
              <a data-block="p342c" href={hero.cta.href} className={`${s.go} ${s.signGo}`}>
                {hero.cta.label}
                <ArrowRight className="size-5" strokeWidth={2} aria-hidden="true" />
              </a>
            )}
          </div>
          {/* Указатель к чату (владелец 2026-09-30): табло прохода к гейтам в аэропорту — висит на двух цепочках. Широкий экран:
              под первым экраном, правая часть ровно под колонкой чата, стрелка вверх. Телефон: между заголовками и чатом, стрелка
              вниз, короче. Табличка — ссылка на чат. */}
          {x.gate && x.chat && (
            <a data-block="g8x2k" href="#agent-chat" className={s.gate} title={x.gate.label}>
              <span className={s.gateRods} aria-hidden="true" />
              <span className={s.gateBar}>
                <span className={s.gateRoutes}>
                  <span className={s.gateIcon} aria-hidden="true"><MessagesSquare className="size-5" strokeWidth={2.4} /></span>
                  {x.gate.routes.map((r) => <span key={r} className={s.gateRoute}>{r}</span>)}
                  {/* Владелец 2026-09-30: как на указателе в аэропорту — время пути. */}
                  {x.gate.longWay && <span className={s.gateWalk}><Footprints className="size-4" aria-hidden="true" />{x.gate.longWay}</span>}
                </span>
                <span className={s.gateExit}>
                  <span className={s.gateWords}>
                    <span className={s.gateAsk}>{x.gate.ask}</span>
                    <span className={s.gateAnswer}>{x.gate.answer}</span>
                    <span className={s.gateAnswerMobile}>{x.gate.answerMobile}</span>
                  </span>
                  {x.gate.exitTime && <span className={s.gateTime}><Footprints className="size-4" aria-hidden="true" />{x.gate.exitTime}</span>}
                  {/* Владелец 2026-09-30: стрелка — справа от текста, в конце таблички. */}
                  <span className={s.gateArrow} aria-hidden="true">
                    <ArrowUp className={s.gateUp} strokeWidth={3} />
                    <ArrowDown className={s.gateDown} strokeWidth={3} />
                  </span>
                </span>
              </span>
            </a>
          )}
          {x.chat && (
            <div data-block="hs2dv" id="agent-chat" className={s.signChat}>
              <AgentChat label={x.chat.label} items={x.chat.items} contractLabels={x.chat.contractLabels} endCta={x.chat.endCta} classes={chatClasses} />
            </div>
          )}
        </div>
      </section>

      <section data-block="hbbfq" className={s.hall}>
        <div data-block="rkprp" className={s.wrap}>
            <div data-block="qvj57" className={s.board} data-board data-shown="0">
              <div data-block="n0hnr" className={s.boardTop}>
                <span className={s.boardLabel}>{b.from}</span>
                <span className={s.origin}>
                  <span className={s.srOnly}>{b.fromValue}</span>
                  <SplitFlap words={[b.fromValue]} className={s.flapWord} />
                </span>
              </div>
              <div data-block="jm9w0" className={s.display} aria-hidden="true">
                <span className={s.displayLabel}>{b.destination}</span>
                <SplitFlap words={outcomes.map((o) => o.name)} className={s.displayField} announce />
              </div>
              <div data-block="nmzw1" className={s.boardHead} aria-hidden="true">
                <span>{b.destination}</span>
                <span className={s.colPlatform}>{b.platform}</span>
                <span className={s.colDeparts}>{b.departs}</span>
              </div>
              <ol data-block="d6ywe" className={s.rows}>
                {outcomes.map((o, i) => (
                  <li data-block="mpdyz" key={o.name} className={s.row}>
                    <div data-block="n5go1" className={s.dest}>
                      <span className={s.srOnly}>{o.name}</span>
                      <SplitFlap words={[o.name]} className={s.flapWord} />
                      <span className={s.via}>{o.text}</span>
                    </div>
                    <span className={s.platform} aria-label={`${b.platform} ${i + 1}`}>{i + 1}</span>
                    <span className={s.departs}>
                      <span className={s.lamp} aria-hidden="true" />
                      {b.when}
                    </span>
                  </li>
                ))}
              </ol>
              <div data-block="mdkza" className={s.ticker}>
                <span>{x.claim}</span>
                <span className={s.hintWrap}>
                  <Button variant="bare" size="bare" type="button" className={s.hintBtn} aria-label={x.claimHintLabel} aria-describedby="agent-claim-hint">?</Button>
                  <span role="tooltip" id="agent-claim-hint" className={s.hint}>{x.claimHint}</span>
                </span>
              </div>
            </div>

          <div data-block="b5dcb" className={s.actions}>
            {hero.cta && (
              <a href={hero.cta.href} className={s.go}>
                {hero.cta.label}
                <ArrowRight className="size-5" strokeWidth={2} aria-hidden="true" />
              </a>
            )}
            {hero.secondary && <a href={hero.secondary.href} className={s.alt}>{hero.secondary.label}</a>}
          </div>
          <p data-block="selaf" className={s.lead}>{hero.description}</p>
        </div>
      </section>

      {/* Зал ожидания (владелец 2026-10-01): под табло, над «Оркестрацией AI-агентов…». Слова — `landing.waiting`. */}
      {x.waiting && (
        <section data-block="r5g32" className={s.waiting}>
          <div data-block="v3rdu" className={s.wrap}>
            {/* Владелец 2026-10-01: «текст зал ожидания оформи в виде таблички висящей на цепочке» — цепочки как у жёлтой вывески. */}
            <div data-block="w8sgn" className={s.waitingSign}>
              <span className={s.gateRods} aria-hidden="true" />
              <div data-block="w8plt" className={s.waitingPlate}>
                <h2 data-block="tcd2c" className={s.waitingTitle}>{x.waiting.title}</h2>
                <p data-block="j17ba" className={s.waitingText}>{x.waiting.text}</p>
              </div>
            </div>
            <WaitingRoom on={x.waiting.on} off={x.waiting.off} tv={x.waiting.tv} scene={x.waiting.scene} />
          </div>
        </section>
      )}

      <section data-block="n4m2k" className={s.poster}>
        <div data-block="b2qaq" className={s.wrap}>
          <h2 data-block="va2hr" className={s.posterTitle}>{can.title}</h2>
          <p data-block="zil1z" className={s.posterSub}>{b.connections}</p>
          <ol data-block="rd7fv" className={s.timetable}>
            {can.texts.map((t, i) => (
              <li data-block="xuoap" key={i} className={s.tRow}>
                <h3 data-block="uqv08"><span className={s.tName}>{x.cards[i]}</span></h3>
                <span className={s.tText}>{t}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section data-block="hedd3" className={s.hall}>
        <div data-block="c1jfw" className={s.wrap}>
          <div data-block="xud3c" className={s.ticket}>
            <div data-block="jc5dc" className={s.ticketMain}>
              {/* Билет (владелец 2026-09-30): шапка билета через всю основную часть — часть анатомии билета, а не надпись над заголовком. */}
              {x.ticket && (
                <p data-block="weu9w" className={s.ticketBand}>
                  <span className={s.ticketKicker}><Ticket className="size-4" strokeWidth={2.4} aria-hidden="true" />{x.ticket.kicker}</span>
                  <span className={s.ticketSerial}>{x.ticket.serial}</span>
                </p>
              )}
              <h2 data-block="lm51s" className={s.ticketTitle}>{hood.title}</h2>
              {hood.texts.map((t, i) => <p data-block="zw1b0" key={i} className={s.ticketText}>{t}</p>)}
              {x.ticket && (
                <dl className={s.ticketFields}>
                  {x.ticket.fields.map((fd) => (
                    <div data-block="imdak" key={fd.label}>
                      <dt>{fd.label}</dt>
                      <dd>{fd.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
            <div data-block="o8d2u" className={s.ticketStub}>
              <p data-block="znlj8" className={s.stubHead}>{b.included}</p>
              <ul data-block="va0ro" className={s.stubList}>
                {x.chips.map((c) => <li data-block="tzbzi" key={c}>{c}</li>)}
              </ul>
              {/* Корешок (владелец 2026-09-30): «сохраняется до конца поездки» и штрихкод — рисунок, не данные. */}
              {/* Печать на корешке (владелец 2026-09-30): «open source, стоимость к оплате ноль». */}
              {x.ticket?.stamp && (
                <p data-block="fzs05" className={s.stamp}>
                  <span>{x.ticket.stamp.top}</span>
                  <span className={s.stampSum}>{x.ticket.stamp.bottom}</span>
                </p>
              )}
              {x.ticket && (
                <div data-block="gra3c" className={s.stubKeep}>
                  <svg className={s.barcode} viewBox="0 0 160 36" preserveAspectRatio="none" aria-hidden="true">
                    {BARS.map(([bx, bw]) => <rect key={bx} x={bx} y={0} width={bw} height={36} />)}
                  </svg>
                  <span>{x.ticket.keep}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* «Fractera vs LLM» (владелец 2026-09-30, выбор «Карта магистрали»): предпоследняя секция — два экрана на стене вокзала.
          Слева неподвижный «пеший маршрут», справа схема магистрали — островок, прорисовывается при въезде в экран. */}
      {x.compare && (
        <section data-block="l6kqq" className={s.versus}>
          <div data-block="x066g" className={s.wrap}>
            <h2 data-block="co2y3" className={s.versusTitle}>{x.compare.title}</h2>
            {x.compare.sub && <p data-block="oysml" className={s.versusSub}>{x.compare.sub}</p>}
            {/* Телефон: переключатель вместо двух карточек подряд (владелец 2026-09-30). */}
            <VersusTabs labels={[x.compare.left.who, x.compare.right.who]}>
            {/* Владелец 2026-09-30: бейджи одной ширины — по самому длинному ярлыку обеих карточек (моноширинный: ширина в ch точна). */}
            <div data-block="cu99c" className={s.versusGrid} style={{ ["--tagn" as string]: Math.max(...[...x.compare.left.items, ...x.compare.right.items].map((it) => it.tag.length)) }}>
              {([["off", x.compare.left], ["on", x.compare.right]] as const).map(([tone, side]) => (
                <article data-block="si7i8" key={tone} className={s.screen} data-tone={tone}>
                  <div data-block="od4wq" className={s.screenHead}>
                    <span className={s.screenWho}>
                      {tone === "off" ? <Footprints className="size-5" aria-hidden="true" /> : <TrainFront className="size-5" aria-hidden="true" />}
                      {side.who}
                    </span>
                    <h3 data-block="mwwfh" className={s.screenLabel}>
                      <span className={s.lamp} aria-hidden="true" />
                      {side.label}
                    </h3>
                  </div>
                  <div data-block="ryu19" className={s.screenArt}>
                    {tone === "off"
                      ? <LostRoute stations={x.compare!.left.stations} deadEnd={x.compare!.left.deadEnd} products={x.compare!.left.products} label={x.compare!.left.label} />
                      : <TransitMap hub={x.compare!.right.hub} here={x.compare!.right.here} stations={x.compare!.right.stations} ring={x.compare!.right.ring} label={x.compare!.mapLabel} />}
                  </div>
                  <p data-block="txccg" className={s.screenText}>{side.text}</p>
                  <ul data-block="ufewp" className={s.screenList}>
                    {side.items.map((it) => (
                      <li data-block="i0dvi" key={it.tag}>
                        <span className={s.status}>{it.tag}</span>
                        <span>{it.text}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
            </VersusTabs>
          </div>
        </section>
      )}

      {/* 348–349 (владелец 2026-09-30): справочное бюро — третья секция снизу, над «Конвейером децентрализованной разработки»
          («конвейер … должен быть под новой секцией справочного бюро»). */}
      {x.helpDesk && (
        <section data-block="xbxoz" id="help-desk" className={s.desk}>
          <div data-block="ql52w" className={s.wrap}>
            <HelpDesk w={x.helpDesk} lang={lang} voiceWords={(({ micDenied, micNoDevice, frame, failed, nothing, noKey }) => ({ micDenied, micNoDevice, frame, failed, nothing, noKey }))(voiceStrings(lang))} />
          </div>
        </section>
      )}

      <section data-block="xsind" className={s.depart}>
        {x.closingImage && (
          // Как на главной (333-11): на широком экране картинка справа во всю высоту экрана, ширина — по её пропорции;
          // правая половина видна целиком, левая уходит в цвет табло. Размытое превью (base64) и webp/avif — StaticImage.
          <div data-block="do4s8" className={s.departArt}>
            <StaticImage src={x.closingImage.src} alt={x.closingImage.alt} fill sizes="(min-width: 1024px) 180vh, 1px" className={s.departImg} />
          </div>
        )}
        <div data-block="j6lny" className={s.wrap}>
          <h2 data-block="cxgfo" className={s.departTitle}>{b.closing}</h2>
          {/* Владелец 2026-09-30, «очень аккуратно»: назначение маршрута — узкая строка табло между заголовком и текстом. */}
          {x.route && (
            <p data-block="krxcw" className={s.routeTo}>
              <span className={s.routeLine} aria-hidden="true" />
              <span className={s.routeLabel}>{x.route.label}</span>
              <span className={s.routeValue}>{x.route.value}</span>
            </p>
          )}
          <p data-block="tanth" className={s.departText}>{x.closingText}</p>
          {hero.cta && (
            <a href={hero.cta.href} className={s.go}>
              {hero.cta.label}
              <ArrowRight className="size-5" strokeWidth={2} aria-hidden="true" />
            </a>
          )}
        </div>
      </section>
      {/* «Маршрут построен» (владелец 2026-09-30): последняя строка страницы — линия метро от станции отправления к станции
          назначения; между ними — пересадка (станций три). */}
      {x.routeBuilt && (
        <section data-block="hpza2" className={s.built}>
          <div data-block="fhxaj" className={s.wrap}>
            <h2 data-block="gmpb7" className={s.builtTitle}>
              <span className={s.builtLamp} aria-hidden="true"><Check className="size-4" strokeWidth={3} /></span>
              {x.routeBuilt.title}
            </h2>
            <ol data-block="k2j60" className={s.builtLine}>
              {[x.routeBuilt.from, x.routeBuilt.via, x.routeBuilt.to].filter((st) => st !== undefined).map((st, i, all) => (
                <li
                  data-block="q2iyo" key={st.label} className={s.builtStop}
                  data-pos={i === 0 ? "start" : i === all.length - 1 ? "end" : "mid"}
                >
                  {/* 342: на станции пересадки — пульс и портал с кнопкой «Жми» (островок); без слов кнопки — прежняя точка. */}
                  {st === x.routeBuilt?.via && x.routeBuilt.via.go && hero.cta ? (
                    <span className={s.builtDot}>
                      <PortalStation href={hero.cta.href} label={x.routeBuilt.via.go.label} aria={x.routeBuilt.via.go.aria} />
                    </span>
                  ) : (
                    <span className={s.builtDot} aria-hidden="true" />
                  )}
                  <span className={s.builtLabel}>{st.label}</span>
                  <span className={s.builtStation}>{st.station}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}
      {/* Пассажиры у нижней кромки окна (владелец 2026-09-30) — только в браузере, после 10 с покоя. */}
      <Walkers />
    </div>
  )
}
