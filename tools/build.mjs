// Сборка многостраничного сайта duo: node tools/build.mjs
// Шапка, подвал и <head> — здесь, в одном месте; содержимое страниц — ниже, в PAGES.
// Готовые страницы (index.html, uslugi/index.html …) кладутся в корень репозитория — их раздаёт GitHub Pages.
// Цены — из прайса проекта DUO: src/products/site/pricing.config.ts и src/products/bot/pricing.config.ts.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = p => readFileSync(join(ROOT, p), 'utf8');
// версия файлов в адресе — чтобы после выкладки у всех открывалась свежая версия
const VER = createHash('sha1').update(read('assets/site.css') + read('assets/site.js')).digest('hex').slice(0, 8);
const FORM = read('tools/parts/form.html');

const ARROW = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4 12 12 4M6 4h6v6"/></svg>';
const NEXT = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M3 8h10M9 4l4 4-4 4"/></svg>';
const ext = (href, text, cls = 'btn glass') => `<a class="${cls}" href="${href}" target="_blank" rel="noopener">${text} ${ARROW}</a>`;
const rub = n => n.toLocaleString('ru-RU').replace(/\s/g, ' ') + ' ₽';

// ── прайс (копия утверждённых цен; при смене прайса — поменять и здесь, и в assets/site.js) ──
const SITE = { base: 10000, extraPage: 3000, support: 1500 };
const BOT = {
  base: 10000, support: 1500, server: '300–700 ₽',
  features: [
    ['Запись на дату и время', 6000], ['Напоминания клиентам', 2000], ['Каталог товаров или услуг', 5000],
    ['Оплата в боте', 6000], ['Промокоды и бонусы', 3000], ['Рассылки по клиентам', 3000],
    ['База клиентов (Google-таблица или CRM)', 3000], ['Связь с amoCRM, Битрикс24, 1С', 8000],
    ['Платный доступ в канал или чат', 6000], ['Модерация чата', 4000], ['Ответы нейросетью', 10000, true],
    ['Распознавание голосовых', 4000], ['Админка прямо в боте', 8000], ['Статистика', 3000],
    ['Мини-приложение внутри бота', 10000, true],
  ],
};

// ── работы ──
const CASES = [
  {
    slug: 'car-export', n: '01', tint: 'rgba(230,60,70,.7)', img: 'carexport',
    client: 'Car Export', sphere: 'авто из Кореи и Китая', kind: 'Лендинг',
    title: 'Car <em>Export</em>', name: 'Car Export', url: 'https://carrexport.ru', host: 'carrexport.ru',
    text: 'Лендинг посредника: пять шагов сделки, цифры доверия, отзывы и один главный призыв — написать в Telegram.',
    items: [
      ['Два направления', 'Южная Корея и Китай — у каждого свой блок и кнопка «Уточнить» в Telegram'],
      ['Кто ведёт заказ', 'Владимир лично сопровождает каждую сделку — его история и цифры на отдельном экране'],
      ['Как проходит сделка', 'Пять шагов: от первого сообщения до растаможки и передачи автомобиля'],
      ['Отзывы', 'Фото и видео клиентов собраны в Telegram-чате, с сайта — одна кнопка'],
      ['Частые вопросы', 'Шесть ответов: безопасность оплаты, цена, Китай, доставка, опыт, связь'],
      ['Один призыв', 'На каждом экране главное действие одно — написать в Telegram или позвонить'],
    ],
    facts: [['1', 'страница-лендинг'], ['5', 'шагов сделки на сайте'], ['6', 'ответов на частые вопросы']],
  },
  {
    slug: 'ksenia', n: '02', tint: 'rgba(220,200,170,.6)', img: 'ksenia',
    client: 'Ксения Субботина', sphere: 'обучение', kind: 'Сайт школы',
    title: 'Школа <em>Permanent</em>', name: 'Школа Permanent', url: 'https://subbotina-perm.ru', host: 'subbotina-perm.ru',
    text: 'Сайт мастер-классов и курсов: выбор зон с пересчётом цены, тарифы и запись в личные сообщения с готовым текстом.',
    items: [
      ['Мастер-классы по зонам', 'Брови, губы, веки: выбираете зоны — итог пересчитывается сразу'],
      ['Сравнение форматов', 'Одна, две или три зоны: длительность, практика на моделях и цена рядом'],
      ['Обучение с нуля', 'Два тарифа курса и пример сертификата'],
      ['Запись в Telegram', 'Кнопка открывает чат с уже готовым текстом — человеку остаётся нажать «Отправить»'],
      ['Модели и пробный урок', 'Набор моделей и бесплатное занятие для тех, кто пока не уверен'],
      ['Адрес и документы', 'Карта и как пройти, оферты, политика и согласие на cookies'],
    ],
    facts: [['3', 'зоны с пересчётом цены'], ['2', 'тарифа обучения с нуля'], ['1', 'кнопка — запись с готовым текстом']],
  },
  {
    slug: 'vkusny', n: '03', tint: 'rgba(255,150,80,.65)', img: 'vkusny',
    client: 'Вкусный компромисс', sphere: 'десерты', kind: 'Многостраничный',
    title: 'Вкусный <em>компромисс</em>', name: 'Вкусный компромисс', url: null,
    text: 'Каталог десертов в виде фруктов: при прокрутке десерт «разрезается» и показывает слои, корзина и заказ в Telegram.',
    items: [
      ['Десерты как фрукты', 'Каждый десерт выглядит как настоящий фрукт — так он и показан на сайте'],
      ['Разрез при прокрутке', 'Десерт «разрезается» на глазах и показывает слои начинки'],
      ['Каталог', 'Девять вкусов, у каждого — свой состав и вид в разрезе'],
      ['Корзина и заказ', 'Собираете заказ на сайте и отправляете его в Telegram'],
    ],
    facts: [['9', 'вкусов в каталоге'], ['Слои', 'анимация разреза при прокрутке'], ['Telegram', 'заказ прямо из корзины']],
  },
];

// ── общие куски ──
const NAV_L = [['raboty/', 'Работы'], ['uslugi/', 'Услуги'], ['ceny/', 'Цены']];
const NAV_R = [['process/', 'Процесс'], ['o-nas/', 'О нас'], ['zayavka/', 'Заявка']];
const nav = (R, cur, list) => list.map(([h, t]) => `<a href="${R}${h}"${h === cur ? ' aria-current="page"' : ''}>${t}</a>`).join('');

const header = (R, cur) => `<header class="notch" id="notch">
  <span class="side l" aria-hidden="true"><span class="wing"><i class="ear"></i></span></span>
  <span class="side r" aria-hidden="true"><span class="wing"><i class="ear"></i></span></span>
  <span class="hit" aria-hidden="true"></span>
  <nav class="l" aria-label="Разделы">${nav(R, cur, NAV_L)}</nav>
  <a class="home" href="${R}" aria-label="duo — на главную"></a>
  <nav class="r" aria-label="Разделы">${nav(R, cur, NAV_R)}</nav>
  <button class="burger" type="button" aria-label="Меню" aria-expanded="false"><i></i><i></i></button>
  <div class="menu-m">${nav(R, cur, [['', 'Главная'], ...NAV_L, ...NAV_R.slice(0, 2)])}<a class="btn white" href="${R}zayavka/">Оставить заявку</a></div>
</header>`;

const footer = R => `<footer class="foot dark" id="contacts">
  <div class="wrap foot-grid">
    <div>
      <div class="mk" aria-hidden="true"></div>
      <p>Делаем сайты и Telegram-ботов для бизнеса. Напишите нам в Telegram или посчитайте стоимость в боте — ответим и подскажем, с чего начать.</p>
    </div>
    <div><h4>Разделы</h4><ul>${[['raboty/', 'Работы'], ['uslugi/', 'Услуги'], ['ceny/', 'Цены'], ['process/', 'Процесс'], ['o-nas/', 'О нас'], ['zayavka/', 'Заявка']].map(([h, t]) => `<li><a href="${R}${h}">${t}</a></li>`).join('')}</ul></div>
    <div><h4>Работы</h4><ul>${CASES.map(c => `<li><a href="${R}raboty/${c.slug}/">${c.client}</a></li>`).join('')}</ul></div>
    <div><h4>Связь</h4><ul><li><a href="https://t.me/duodevops_bot" target="_blank" rel="noopener">Бот @duodevops_bot</a></li><li><a href="https://t.me/duodevops" target="_blank" rel="noopener">Telegram-канал</a></li><li><a href="https://instagram.com/duo_devops" target="_blank" rel="noopener">Instagram</a></li></ul></div>
  </div>
  <div class="endbar"><span>Websites · Products · Automation</span><b>duo</b><span>© 2026 · Два человека. Один результат.</span></div>
</footer>`;

const layout = ({ R, path, title, desc, body, home }) => `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${title}</title>
<meta name="description" content="${desc}">
<meta name="robots" content="noindex">
<meta name="theme-color" content="#0B0C0E">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${R}assets/site.css?v=${VER}">
<script src="${R}assets/site.js?v=${VER}" defer></script>
</head>
<body class="${home ? 'wait' : 'inner'}">
<div class="frame" aria-hidden="true"></div>

${header(R, path)}

<main>
${body}
</main>

${footer(R)}
</body>
</html>
`;

const glow = '<div class="light" aria-hidden="true"><i class="a"></i><i class="b"></i></div><div class="grain" aria-hidden="true"></div>';
const ptop = ({ label, h1, lead = '', extra = '', cls = '' }) => `<section class="ptop dark${cls ? ' ' + cls : ''}">
  ${glow}
  <div class="wrap">
    <span class="label">${label}</span>
    <h1>${h1}</h1>
    ${lead ? `<p class="lead">${lead}</p>` : ''}
    ${extra}
  </div>
</section>`;
const head = (label, h2, lead = '', more = '') => `<div class="head up">
      <span class="label">${label}</span>
      <h2>${h2}</h2>
      ${lead ? `<p class="lead">${lead}</p>` : ''}${more}
    </div>`;
const more = (href, text) => `<a class="more" href="${href}">${text} ${ARROW}</a>`;
const bar = (R, text, btn = 'Оставить заявку', href = 'zayavka/') =>
  `<div class="bar up"><span>${text}<em class="alt">или напишите в бота <a href="https://t.me/duodevops_bot" target="_blank" rel="noopener">@duodevops_bot</a></em></span><a class="btn" href="${R}${href}">${btn} ${ARROW}</a></div>`;
const nextp = (R, href, text) => `<div class="nextp"><span>Дальше</span><a href="${R}${href}">${text} ${NEXT}</a></div>`;
const row = (n, d, p = '') => `<div class="row"><span class="n">${n}</span><span class="d">${d}</span>${p !== null ? `<span class="p">${p}</span>` : ''}</div>`;

const caseCards = R => `<div class="cases">
${CASES.map(c => `    <article class="case" style="--tint:${c.tint}">
      <div class="info">
        <div class="meta"><span>Клиент: <b>${c.client}</b></span><span>Сфера: <b>${c.sphere}</b></span></div>
        <h3>${c.title}</h3>
        <p>${c.text}</p>
        <div style="display:flex;flex-wrap:wrap;gap:10px"><a class="btn white open" href="${R}raboty/${c.slug}/">Смотреть кейс ${ARROW}</a>${c.url ? ext(c.url, 'Открыть сайт', 'btn glass open') : ''}</div>
      </div>
      <div class="shot"><picture><source media="(max-width:860px)" srcset="${R}img/work/${c.img}-m.jpg"><img src="${R}img/work/${c.img}.jpg" alt="Первый экран сайта ${c.name}" loading="lazy"></picture></div>
    </article>`).join('\n')}
  </div>`;

const STEPS = [
  ['01', 'Расчёт', 'Выбираете страницы и опции в боте или в заявке на сайте и сразу видите стоимость', 'в боте или на сайте'],
  ['02', 'Бриф', 'Отвечаете на короткие вопросы: о бизнесе, клиентах и сайтах, которые нравятся', 'в Telegram'],
  ['03', 'Дизайн', 'Показываем первый экран, после согласования рисуем остальное', 'согласуем с вами'],
  ['04', 'Сборка', 'Вёрстка, анимации, адаптив и форма заявки в Telegram', 'проверяем на телефоне'],
  ['05', 'Запуск', 'Подключаем домен и хостинг, передаём сайт и остаёмся на связи', 'поддержка по желанию'],
];
const stepRows = () => STEPS.map(([n, t, d, p]) => row(`<span class="num">${n}</span>${t}`, d, p)).join('\n      ');

const team = (R, withHead = true) => `<div class="team">
      <div class="photo up"><img src="${R}img/team/duo.jpg" alt="Данил и Денис, основатели duo" loading="lazy"></div>
      <div>
        <div class="head up" style="margin-bottom:36px">
          <span class="label">О нас</span>
          <h2>Два человека. <em>Один результат.</em></h2>
          <p class="lead">Мы два друга и работаем вдвоём, без менеджеров-посредников: вы общаетесь напрямую с теми, кто делает ваш сайт.</p>
          ${withHead ? '' : more(`${R}o-nas/`, 'Подробнее о нас')}
        </div>
        <div class="rows people">
          ${row('Данил', 'Дизайн и визуал, общение с клиентами, аналитика', null)}
          ${row('Денис', 'Код и техническая часть, хостинг и домены, поддержка', null)}
        </div>
      </div>
    </div>`;

const siteBase = `<div class="base up">
      <div class="sum"><small>Сайт · база</small>${rub(SITE.base)}</div>
      <ul><li>до 3 страниц</li><li>адаптив под телефон</li><li>настройка домена и хостинга</li><li>форма заявки в Telegram</li></ul>
    </div>`;
const botBase = `<div class="base bot up">
      <div class="sum"><small>Telegram-бот · база</small>${rub(BOT.base)}</div>
      <ul><li>меню и кнопки</li><li>ответы на частые вопросы</li><li>заявки вам в Telegram</li><li>запуск на сервере</li></ul>
    </div>`;

// ── страницы ──
const PAGES = [];
const page = (path, p) => PAGES.push({ path, ...p });

page('', {
  home: true,
  title: 'duo — сайты и Telegram-боты под ключ',
  desc: 'duo: сайты и Telegram-боты для бизнеса. Сайт до трёх страниц от 10 000 ₽, стоимость видно до начала работы, заявки с сайта приходят в Telegram.',
  body: R => `<section class="hero wait" id="top">
  ${glow}
  <h1 class="hero-in">
    <span class="logo" role="img" aria-label="duo">
      <video id="logoVideo" muted playsinline autoplay preload="auto" aria-hidden="true">
        <source src="media/duo-logo.webm" type="video/webm">
        <source src="media/duo-logo.mp4" type="video/mp4">
      </video>
      <img src="media/duo-logo-end.jpg" alt="" aria-hidden="true">
    </span>
    <span class="tag"><span>Vibe</span><span>Coding</span><span>Company</span></span>
  </h1>
  <p class="hero-foot"><b>Сайты и Telegram-боты под ключ</b><br>Websites · Products · Automation</p>
</section>

<div class="sheet">
  <section class="wrap intro">
    <span class="label">Кто мы</span>
    <p class="reveal">Мы duo — Данил и Денис. Делаем сайты и Telegram-ботов для бизнеса под ключ: от дизайна до домена, хостинга и заявок, которые приходят прямо в ваш Telegram.</p>
  </section>

  <section class="wrap sec" id="services">
    ${head('Услуги', 'Что мы делаем <em>для вашего бизнеса</em>', 'Базу и каждую опцию видно заранее, без скрытых платежей.')}
    <div class="tiles">
      <a class="tile up" href="${R}uslugi/#sites"><span class="label">01</span><h3>Сайты под ключ</h3><p>Дизайн под ваш бренд, адаптив под телефон, домен, хостинг и заявки в Telegram</p><span class="p">от ${rub(SITE.base)} ${ARROW}</span></a>
      <a class="tile up" href="${R}uslugi/#bots"><span class="label">02</span><h3>Telegram-боты</h3><p>Заявки, запись, каталог, оплата и рассылки — собираем из нужных функций</p><span class="p">от ${rub(BOT.base)} ${ARROW}</span></a>
      <a class="tile up" href="${R}uslugi/#support"><span class="label">03</span><h3>Поддержка</h3><p>Правки, обновления и помощь после запуска — для сайтов и ботов</p><span class="p">${rub(SITE.support)} в месяц ${ARROW}</span></a>
    </div>
    ${bar(R, 'Хотите узнать точную цену?', 'Посчитать стоимость')}
  </section>
</div>

<section class="work dark" id="work">
  <div class="wrap">${head('Работы', 'Сайты, которые <em>мы сделали</em>', 'Каждый собран под конкретную задачу клиента: свой стиль, своя структура и понятный путь к заявке.')}</div>
  ${caseCards(R)}
</section>

<div class="sheet">
  <section class="wrap sec" id="process">
    ${head('Процесс', 'Как мы работаем <em>от заявки до запуска</em>', 'На каждом этапе показываем результат и согласуем с вами, прежде чем идти дальше.', more(`${R}process/`, 'Сроки и что понадобится от вас'))}
    <div class="rows focus">
      ${stepRows()}
    </div>
  </section>

  <section class="wrap sec" id="prices">
    ${head('Цены', 'Цена известна <em>до начала работы</em>', 'Платите один раз за готовый сайт, без подписки за конструктор.', more(`${R}ceny/`, 'Все цены на сайты и ботов'))}
    ${siteBase}
  </section>

  <section class="wrap sec" id="about">
    ${team(R, false)}
    ${bar(R, 'Обсудим ваш проект?')}
  </section>
</div>`,
});

page('uslugi/', {
  title: 'Услуги — duo',
  desc: 'Сайты под ключ от 10 000 ₽, Telegram-боты от 10 000 ₽ и поддержка после запуска 1 500 ₽ в месяц.',
  body: R => `${ptop({ label: 'Услуги', h1: 'Сайты и боты <em>под ключ</em>', lead: 'Собираем из того, что нужно именно вам. Базу и каждую опцию видно заранее, без скрытых платежей.' })}

<div class="sheet after">
  <section class="wrap sec" id="sites">
    ${head('01 · Сайты', 'Сайт <em>под ключ</em>', 'От дизайна до домена и хостинга. Заявки с сайта приходят прямо в ваш Telegram.')}
    <div class="rows focus">
      ${row('Сайт под ключ', 'До 3 страниц, адаптив под телефон, настройка домена и хостинга, форма заявки в Telegram', `от ${rub(SITE.base)}`)}
      ${row('Уникальный дизайн', 'Под ваш бренд и характер, без шаблонов и конструкторов', '+1 000 ₽<small>за страницу</small>')}
      ${row('Анимации', 'Кнопки, плашки, появление блоков, переходы между экранами', 'от 500 ₽')}
      ${row('Оплата и админка', 'Приём оплаты на сайте и панель, где вы сами меняете содержимое', '+6 000 / +8 000 ₽')}
      ${row('Тексты и SEO', 'Напишем тексты за вас и настроим базовое SEO, чтобы сайт находили', 'от 500 ₽')}
    </div>
    ${bar(R, 'Нужен сайт?', 'Посчитать сайт', 'zayavka/?type=site')}
  </section>

  <section class="wrap sec" id="bots">
    ${head('02 · Telegram-боты', 'Бот, который <em>работает за вас</em>', 'Собираем бота из нужных функций: база и цена каждой функции известны заранее. Пример — наш бот <a href="https://t.me/duodevops_bot" target="_blank" rel="noopener" style="text-decoration:underline;text-underline-offset:3px">@duodevops_bot</a>: открывает приложение, где считается стоимость и принимаются заявки.', more(`${R}ceny/#bots`, 'Все функции и цены'))}
    ${botBase}
    <div class="rows focus">
      ${row('Запись и напоминания', 'Запись на дату и время, напоминания клиентам', '+6 000 / +2 000 ₽')}
      ${row('Каталог и оплата', 'Каталог товаров или услуг, оплата прямо в боте', '+5 000 / +6 000 ₽')}
      ${row('Рассылки и бонусы', 'Рассылки по клиентам, промокоды и бонусы', '+3 000 ₽')}
      ${row('Связь с CRM', 'amoCRM, Битрикс24, 1С', '+8 000 ₽')}
      ${row('Нейросеть', 'Ответы нейросетью на вопросы клиентов', 'от +10 000 ₽')}
    </div>
    <p class="note">Сервер для бота оплачивается отдельно: ${BOT.server} в месяц.</p>
    ${bar(R, 'Нужен бот?', 'Рассказать о боте', 'zayavka/?type=bot')}
  </section>

  <section class="wrap sec" id="support">
    ${head('03 · Поддержка', 'Остаёмся <em>на связи</em>', 'После запуска не пропадаем: правим, обновляем и помогаем. Поддержка — по желанию, отдельным платежом.')}
    <div class="rows">
      ${row('Поддержка сайта или бота', 'Правки, обновления и помощь после запуска', `${rub(SITE.support)}<small>в месяц</small>`)}
    </div>
    ${nextp(R, 'raboty/', 'Наши работы')}
  </section>
</div>`,
});

page('raboty/', {
  title: 'Работы — duo',
  desc: 'Сайты, которые сделала студия duo: Car Export, школа Ксении Субботиной, «Вкусный компромисс».',
  body: R => `${ptop({ label: 'Работы', h1: 'Сайты, которые <em>мы сделали</em>', lead: 'Каждый собран под конкретную задачу клиента: свой стиль, своя структура и понятный путь к заявке.', cls: 'short' })}

<section class="work dark" style="padding-top:0">
  ${caseCards(R)}
</section>

<div class="sheet">
  <section class="wrap sec">
    ${bar(R, 'Хотите сайт под свою задачу?')}
    ${nextp(R, 'uslugi/', 'Услуги')}
  </section>
</div>`,
});

CASES.forEach((c, i) => {
  const nx = CASES[(i + 1) % CASES.length];
  page(`raboty/${c.slug}/`, {
    title: `${c.name} — кейс duo`,
    desc: c.text,
    body: R => `${ptop({
      label: `Кейс ${c.n}`, h1: c.title, lead: c.text,
      extra: `<div class="cmeta"><span>Клиент: <b>${c.client}</b></span><span>Сфера: <b>${c.sphere}</b></span><span>Формат: <b>${c.kind}</b></span></div>
    <div class="acts">${c.url ? ext(c.url, c.host, 'btn white') : ''}<a class="btn glass" href="${R}raboty/">Все работы</a></div>
    <div class="cshots up" style="--tint:${c.tint}">
      <div class="shot"><img src="${R}img/work/${c.img}.jpg" alt="Сайт ${c.name} на компьютере"></div>
      <div class="phone"><img src="${R}img/work/${c.img}-m.jpg" alt="Сайт ${c.name} на телефоне" loading="lazy"></div>
    </div>`,
    })}

<div class="sheet after">
  <section class="wrap sec">
    ${head('Что на сайте', 'Как устроен <em>сайт</em>')}
    <div class="rows desc focus">
      ${c.items.map(([n, d]) => row(n, d, null)).join('\n      ')}
    </div>
    <div class="facts" style="margin-top:clamp(36px,4vw,56px)">
      ${c.facts.map(([b, s]) => `<div class="fact up"><b>${b}</b><span>${s}</span></div>`).join('\n      ')}
    </div>
    ${bar(R, 'Хотите такой же сайт для себя?')}
    ${nextp(R, `raboty/${nx.slug}/`, nx.name)}
  </section>
</div>`,
  });
});

page('ceny/', {
  title: 'Цены — duo',
  desc: 'Цены на сайты и Telegram-боты: сайт до трёх страниц от 10 000 ₽, бот от 10 000 ₽, поддержка 1 500 ₽ в месяц.',
  body: R => `${ptop({ label: 'Цены', h1: 'Цена известна <em>до начала работы</em>', lead: 'Платите один раз за готовый сайт или бота, без подписки за конструктор. Ниже — база и каждая опция.' })}

<div class="sheet after">
  <section class="wrap sec" id="sites">
    <div class="subhead up"><h3>Сайт</h3><p>Домен и хостинг оплачиваются отдельно, их настройку берём на себя.</p></div>
    ${siteBase}
    <div class="rows">
      ${row('Страница сверх трёх', 'Каждая дополнительная страница', `+${rub(SITE.extraPage)}`)}
      ${row('Анимации', 'Кнопки +1 000, плашки +1 500, переходы +2 000, появление блоков +500 за страницу', 'от 500 ₽')}
      ${row('Уникальный дизайн', 'Рисуем под ваш бренд с нуля', '+1 000 ₽<small>за страницу</small>')}
      ${row('Тексты от нас', 'Пишем тексты для страниц', '+500 ₽<small>за страницу</small>')}
      ${row('Онлайн-оплата', 'Приём оплаты прямо на сайте', '+6 000 ₽')}
      ${row('Админка', 'Сами меняете тексты, фото и цены', '+8 000 ₽')}
      ${row('Базовое SEO', 'Настройка, чтобы сайт находили в поиске', '+2 000 ₽')}
      ${row('Срочно', 'Быстрее обычных 10 дней — от 5 дней', '+25%<small>к разработке</small>')}
      ${row('Поддержка', 'Правки, обновления и помощь после запуска', `${rub(SITE.support)}<small>в месяц</small>`)}
    </div>
    ${bar(R, 'Соберите свой сайт и узнайте итог', 'Открыть калькулятор', 'zayavka/?type=site')}
  </section>

  <section class="wrap sec" id="bots">
    <div class="subhead up"><h3>Telegram-бот</h3><p>Сервер для бота оплачивается отдельно: ${BOT.server} в месяц.</p></div>
    ${botBase}
    <div class="rows two">
      ${BOT.features.map(([n, p, from]) => row(n, '', `${from ? 'от ' : ''}+${rub(p)}`).replace('<span class="d"></span>', '')).join('\n      ')}
      ${row('Срочно', '', '+25%<small>к разработке, до 5 дней</small>').replace('<span class="d"></span>', '')}
      ${row('Поддержка', '', `${rub(BOT.support)}<small>в месяц</small>`).replace('<span class="d"></span>', '')}
    </div>
    ${bar(R, 'Расскажите, что должен уметь бот', 'Оставить заявку', 'zayavka/?type=bot')}
    ${nextp(R, 'process/', 'Как мы работаем')}
  </section>
</div>`,
});

page('process/', {
  title: 'Как мы работаем — duo',
  desc: 'Пять шагов от заявки до запуска сайта, сроки и что понадобится от вас.',
  body: R => `${ptop({ label: 'Процесс', h1: 'Как мы работаем <em>от заявки до запуска</em>', lead: 'На каждом этапе показываем результат и согласуем с вами, прежде чем идти дальше.' })}

<div class="sheet after">
  <section class="wrap sec">
    <div class="subhead up"><h3>Пять шагов</h3></div>
    <div class="rows focus">
      ${stepRows()}
    </div>

    <div class="subhead up"><h3>Сроки</h3><p>Срок фиксируем до начала работы.</p></div>
    <div class="rows">
      ${row('Обычный срок', 'Сайт или бот — до 10 дней', 'без доплаты')}
      ${row('Сайт быстрее', 'От 5 до 9 дней', '+25%<small>к разработке</small>')}
      ${row('Бот срочно', 'До 5 дней', '+25%<small>к разработке</small>')}
    </div>

    <div class="subhead up"><h3>Что понадобится от вас</h3><p>Остальное предложим сами.</p></div>
    <div class="rows desc">
      ${row('О бизнесе', 'Пара фраз: чем занимаетесь и кто ваши клиенты', null)}
      ${row('Примеры', '2–3 сайта любой сферы, которые нравятся, и что именно в них нравится', null)}
      ${row('Материалы', 'Логотип и фото, если есть. Нет — подскажем, что делать', null)}
      ${row('Домен', 'Есть — подключим. Нет — поможем выбрать', null)}
    </div>
    ${bar(R, 'Готовы начать?')}
    ${nextp(R, 'o-nas/', 'О нас')}
  </section>
</div>`,
});

page('o-nas/', {
  title: 'О нас — duo',
  desc: 'duo — Данил и Денис. Работаем вдвоём, без менеджеров-посредников.',
  body: R => `${ptop({ label: 'О нас', h1: 'Два человека. <em>Один результат.</em>', lead: 'Мы duo — Данил и Денис. Делаем сайты и Telegram-ботов для бизнеса под ключ.' })}

<div class="sheet after">
  <section class="wrap sec">
    ${team(R)}
  </section>

  <section class="wrap sec" id="why">
    ${head('Почему duo', 'Не конструктор, <em>а готовый сайт</em>')}
    <div class="rows">
      ${row('Без подписки', 'Платите один раз за готовый сайт, а не каждый месяц за конструктор', 'разовая оплата')}
      ${row('Свой дизайн', 'Сайт выглядит как ваш бренд, а не как шаблон из каталога', 'под ваш бренд')}
      ${row('Цена заранее', 'Стоимость сайта видно в калькуляторе до начала работы', 'без сюрпризов')}
      ${row('Живые люди', 'Отвечаем в Telegram сами, без менеджеров. Можем взять на себя тексты, домен и хостинг', 'на связи')}
    </div>
    ${bar(R, 'Обсудим ваш проект?')}
    ${nextp(R, 'zayavka/', 'Оставить заявку')}
  </section>
</div>`,
});

page('zayavka/', {
  title: 'Заявка — duo',
  desc: 'Расскажите о проекте за шесть коротких шагов — цена считается сразу.',
  body: R => `${ptop({ label: 'Заявка', h1: 'Расскажите <em>о проекте</em>', lead: 'Шесть коротких шагов. Цена считается сразу, ответы сохраняются в этом браузере. Удобнее в Telegram — напишите в бота <a href="https://t.me/duodevops_bot" target="_blank" rel="noopener" style="text-decoration:underline;text-underline-offset:3px">@duodevops_bot</a>.' })}

<div class="zwrap">
<div class="apply page" id="apply">
${FORM.replaceAll('{{R}}', R)}
</div>
</div>`,
});

page('404', {
  file: '404.html', root: '/duo-site/',
  title: 'Страница не найдена — duo',
  desc: 'Такой страницы нет.',
  body: R => `${ptop({ label: 'Ошибка 404', h1: 'Такой страницы <em>нет</em>', lead: 'Возможно, ссылка устарела. Начните с главной или посмотрите наши работы.', extra: `<div class="acts"><a class="btn white" href="${R}">На главную ${ARROW}</a><a class="btn glass" href="${R}raboty/">Работы</a></div>` })}`,
});

// ── запись ──
for (const p of PAGES) {
  const depth = p.path ? p.path.split('/').filter(Boolean).length : 0;
  const R = p.root ?? (depth ? '../'.repeat(depth) : './');
  const file = p.file ?? join(p.path, 'index.html');
  const html = layout({ R, path: p.path, title: p.title, desc: p.desc, home: p.home, body: p.body(R) });
  mkdirSync(dirname(join(ROOT, file)), { recursive: true });
  writeFileSync(join(ROOT, file), html);
  console.log('✓', file);
}
