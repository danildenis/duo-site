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
// мини-приложение DUO в Telegram: открывается сразу, без чата с ботом
const TG_APP = 'https://t.me/duodevops_bot?startapp';
const SITE_URL = 'https://danildenis.github.io/duo-site/';
const TG = '<svg class="tgi" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21.4 4.2 18.3 19c-.2 1-.9 1.3-1.7.8l-4.7-3.5-2.3 2.2c-.3.3-.5.5-1 .5l.3-4.8 8.8-8c.4-.3-.1-.5-.6-.2L6.3 12.8l-4.7-1.5c-1-.3-1-1 .2-1.5L20.1 2.7c.8-.3 1.6.2 1.3 1.5Z"/></svg>';
const tgBtn = (cls = 'btn line', text = 'Открыть в Telegram') => `<a class="${cls}" href="${TG_APP}" target="_blank" rel="noopener">${TG} ${text}</a>`;
const ext = (href, text, cls = 'btn glass') => `<a class="${cls}" href="${href}" target="_blank" rel="noopener">${text} ${ARROW}</a>`;
// значки строки состояния iPhone: сеть, Wi-Fi, батарея
const STATUS_ICONS = '<svg viewBox="0 0 18 12" aria-hidden="true"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5.5" width="3" height="6.5" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg><svg viewBox="0 0 16 12" aria-hidden="true"><path d="M8 2.6c2.3 0 4.4.9 6 2.4l1.1-1.2A10.3 10.3 0 0 0 8 1 10.3 10.3 0 0 0 .9 3.8L2 5c1.6-1.5 3.7-2.4 6-2.4Zm0 3.2c1.4 0 2.7.5 3.7 1.4l1.1-1.2A7.1 7.1 0 0 0 8 4.2 7.1 7.1 0 0 0 3.2 6l1.1 1.2c1-.9 2.3-1.4 3.7-1.4Zm0 3.2c.6 0 1.1.2 1.5.6L8 11.2 6.5 9.6c.4-.4.9-.6 1.5-.6Z"/></svg><span class="tg-bat"><i></i></span>';
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
      ['Как проходит сделка', 'Пять шагов: от первого сообщения до растаможки и передачи автомобиля'],
      ['Один призыв', 'На каждом экране главное действие одно — написать в Telegram или позвонить'],
    ],
  },
  {
    slug: 'ksenia', n: '02', tint: 'rgba(220,200,170,.6)', img: 'ksenia',
    client: 'Ксения Субботина', sphere: 'обучение', kind: 'Сайт школы',
    title: 'Школа <em>Permanent</em>', name: 'Школа Permanent', url: 'https://subbotina-perm.ru', host: 'subbotina-perm.ru',
    text: 'Сайт мастер-классов и курсов: выбор зон с пересчётом цены, тарифы и запись в личные сообщения с готовым текстом.',
    items: [
      ['Мастер-классы по зонам', 'Брови, губы, веки: выбираете зоны — итог пересчитывается сразу'],
      ['Обучение с нуля', 'Два тарифа курса и пример сертификата'],
      ['Запись в Telegram', 'Кнопка открывает чат с уже готовым текстом — человеку остаётся нажать «Отправить»'],
    ],
  },
  {
    slug: 'vkusny', n: '03', tint: 'rgba(255,150,80,.65)', img: 'vkusny',
    client: 'Вкусный компромисс', sphere: 'десерты', kind: 'Многостраничный',
    title: 'Вкусный <em>компромисс</em>', name: 'Вкусный компромисс', url: null,
    text: 'Каталог десертов в виде фруктов: при прокрутке десерт «разрезается» и показывает слои, корзина и заказ в Telegram.',
    items: [
      ['Десерты как фрукты', 'Каждый десерт выглядит как настоящий фрукт — так он и показан на сайте'],
      ['Разрез при прокрутке', 'Десерт «разрезается» на глазах и показывает слои начинки'],
      ['Корзина и заказ', 'Собираете заказ на сайте и отправляете его в Telegram'],
    ],
  },
];

// ── вопросы и ответы (только то, что есть в прайсе и в процессе) ──
const FAQ = [
  ['Сколько стоит сайт?', R => `<p>База — ${rub(SITE.base)}: до трёх страниц, адаптив под телефон, настройка домена и хостинга и форма заявки в Telegram. Дальше добавляете только нужное: страницы, дизайн, анимации, тексты, оплату, админку, SEO.</p><p>Все опции с ценами — на странице <a href="${R}ceny/">Цены</a>, итог считается в <a href="${R}zayavka/">заявке</a>.</p>`],
  ['Сколько длится работа?', () => `<p>Обычно до 10 дней, без доплаты. Если нужно быстрее — сайт за 5–9 дней, это +25% к разработке.</p>`],
  ['Нужно ли платить за домен и хостинг?', () => `<p>Да, они оплачиваются отдельно — напрямую, на ваше имя. Подключение и настройку берём на себя.</p>`],
  ['Смогу ли я сам менять тексты и фото?', () => `<p>Да, если добавить админку (+8 000 ₽): тексты, фото и цены меняете сами. Без неё правки делаем мы — в рамках поддержки за ${rub(SITE.support)} в месяц.</p>`],
  ['Что если дизайн не понравится?', R => `<p>Сначала показываем первый экран. Остальное рисуем только после того, как вы его согласуете — так результат не станет сюрпризом. Как проходит работа — на странице <a href="${R}process/">Процесс</a>.</p>`],
  ['Вы пишете тексты для сайта?', () => `<p>Да, по желанию: +500 ₽ за страницу. Если тексты есть у вас — используем их.</p>`],
  ['Сколько стоит Telegram-бот?', R => `<p>База — ${rub(BOT.base)}: меню и кнопки, ответы на частые вопросы, заявки вам в Telegram и запуск на сервере. Запись, каталог, оплата, рассылки и другие функции — по прайсу на странице <a href="${R}ceny/#bots">Цены</a>. Сервер для бота — ${BOT.server} в месяц, отдельно.</p>`],
  ['Почему не конструктор?', () => `<p>За готовый сайт платите один раз, без ежемесячной подписки за конструктор. И сайт выглядит как ваш бренд, а не как шаблон из каталога.</p>`],
  ['Как начать?', R => `<p>Оставьте <a href="${R}zayavka/">заявку</a> на сайте или откройте <a href="${TG_APP}" target="_blank" rel="noopener">приложение DUO в Telegram</a>. Ответим сами, без менеджеров, и подскажем, с чего начать.</p>`],
];
const faq = (R, list = FAQ) => `<div class="qa up">
      ${list.map(([q, a]) => `<details name="qa"><summary>${q}<i aria-hidden="true"></i></summary><div class="a">${a(R)}</div></details>`).join('\n      ')}
    </div>`;

// ── демо-сайты: бренды и данные вымышлены (копии из репозитория duo-portfolio) ──
const DEMOS = [
  { slug: 'coffee', label: 'Демо · кафе', name: 'Кофейня «Зерно»', text: 'Меню с вкладками, корзина и онлайн-оплата заказа с собой.', tags: ['Онлайн-оплата', 'Анимации', 'Появление блоков'] },
  { slug: 'beauty', label: 'Демо · услуги', name: 'Студия «Линия»', text: 'Прайс с длительностью, онлайн-запись по дню и времени, работы мастеров.', tags: ['Онлайн-запись', 'Уникальный дизайн', 'Анимации'] },
  { slug: 'school', label: 'Демо · обучение', name: 'Школа «Talky»', text: 'Калькулятор тарифа, программа, частые вопросы и заявка на пробный урок.', tags: ['Калькулятор цены', 'Тарифы', 'Заявки'] },
];
const demos = R => `<div class="demos">
      ${DEMOS.map(d => `<a class="demo up" href="${R}demo/${d.slug}/" target="_blank" rel="noopener"><div class="pic"><img src="${R}img/demo/${d.slug}.jpg" alt="Демо-сайт: ${d.name}" loading="lazy"></div><div class="body"><span class="label">${d.label}</span><h3>${d.name}</h3><p>${d.text}</p><div class="tags">${d.tags.map(t => `<span>${t}</span>`).join('')}</div><span class="go">Открыть демо ${ARROW}</span></div></a>`).join('\n      ')}
    </div>`;

// ── общие куски ──
const NAV_L = [['raboty/', 'Работы'], ['uslugi/', 'Услуги'], ['ceny/', 'Цены']];
const NAV_R = [['process/', 'Процесс'], ['voprosy/', 'Вопросы'], ['o-nas/', 'О нас']];
const nav = (R, cur, list) => list.map(([h, t]) => `<a href="${R}${h}"${h === cur ? ' aria-current="page"' : ''}>${t}</a>`).join('');

const header = (R, cur) => `<header class="notch" id="notch">
  <span class="side l" aria-hidden="true"><span class="wing"><i class="ear"></i></span></span>
  <span class="side r" aria-hidden="true"><span class="wing"><i class="ear"></i></span></span>
  <span class="hit" aria-hidden="true"></span>
  <nav class="l" aria-label="Разделы">${nav(R, cur, NAV_L)}</nav>
  <a class="home" href="${R}" aria-label="duo — на главную"></a>
  <nav class="r" aria-label="Разделы">${nav(R, cur, NAV_R)}</nav>
  <button class="burger" type="button" aria-label="Меню" aria-expanded="false"><i></i><i></i></button>
  <div class="menu-m">${nav(R, cur, [['', 'Главная'], ...NAV_L, ...NAV_R])}<a class="tg-link" href="${TG_APP}" target="_blank" rel="noopener">${TG} Открыть в Telegram</a><a class="btn white" href="${R}zayavka/">Оставить заявку</a></div>
</header>`;

const footer = R => `<footer class="foot dark" id="contacts">
  <div class="wrap foot-grid">
    <div>
      <div class="mk" aria-hidden="true"></div>
      <p>Делаем сайты и Telegram-ботов для бизнеса. Напишите нам в Telegram или посчитайте стоимость в боте — ответим и подскажем, с чего начать.</p>
      <p class="legal"><a href="${R}privacy/">Политика обработки персональных данных</a></p>
    </div>
    <div><h4>Разделы</h4><ul>${[['raboty/', 'Работы'], ['uslugi/', 'Услуги'], ['ceny/', 'Цены'], ['process/', 'Процесс'], ['voprosy/', 'Вопросы'], ['razbor/', 'Разбор сайта'], ['o-nas/', 'О нас'], ['zayavka/', 'Заявка']].map(([h, t]) => `<li><a href="${R}${h}">${t}</a></li>`).join('')}</ul></div>
    <div><h4>Связь</h4><ul><li><a href="${TG_APP}" target="_blank" rel="noopener">Приложение в Telegram</a></li><li><a href="https://t.me/duodevops_bot" target="_blank" rel="noopener">Бот @duodevops_bot</a></li><li><a href="https://t.me/duodevops" target="_blank" rel="noopener">Telegram-канал</a></li><li><a href="https://instagram.com/duo_devops" target="_blank" rel="noopener">Instagram</a></li></ul></div>
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
<link rel="icon" type="image/png" sizes="32x32" href="${R}img/favicon-32.png?v=2">
<link rel="icon" type="image/png" sizes="192x192" href="${R}img/favicon-192.png?v=2">
<link rel="icon" href="${R}img/favicon.svg?v=2" type="image/svg+xml">
<link rel="apple-touch-icon" href="${R}img/apple-touch-icon.png?v=2">
<meta property="og:type" content="website">
<meta property="og:site_name" content="duo">
<meta property="og:locale" content="ru_RU">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:url" content="${SITE_URL}${path === '404' ? '' : path}">
<meta property="og:image" content="${SITE_URL}img/og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600&display=swap">
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
  `<div class="bar up"><span>${text}<em class="alt">или посчитайте в приложении DUO — оно откроется прямо в Telegram</em></span><div class="acts"><a class="btn" href="${R}${href}">${btn} ${ARROW}</a>${tgBtn()}</div></div>`;
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
      <div class="shot"><img src="${R}img/work/${c.img}.jpg" alt="Первый экран сайта ${c.name}" loading="lazy"></div>
    </article>`).join('\n')}
  </div>`;

const STEPS = [
  ['01', 'Расчёт', 'Выбираете страницы и опции в боте или в заявке на сайте и сразу видите стоимость', 'в боте или на сайте'],
  ['02', 'Бриф', 'Отвечаете на короткие вопросы: о бизнесе, клиентах и сайтах, которые нравятся', 'в Telegram'],
  ['03', 'Дизайн', 'Показываем первый экран, после согласования рисуем остальное', 'согласуем с вами'],
  ['04', 'Сборка', 'Вёрстка, анимации, адаптив и форма заявки в Telegram', 'проверяем на телефоне'],
  ['05', 'Запуск', 'Подключаем домен и хостинг, передаём сайт и остаёмся на связи', 'поддержка по желанию'],
];
const stepRows = () => STEPS.map(([n, t, d, p]) => row(t, d, p)).join('\n      ');

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
  <p class="hero-foot"><b>Сайты и Telegram-боты под ключ</b><span class="sub">Websites · Products · Automation</span></p>
</section>

<div class="sheet">
  <section class="wrap intro">
    <span class="label">Кто мы</span>
    <p class="reveal">Мы duo — Данил и Денис. Делаем сайты и Telegram-ботов для бизнеса под ключ: от дизайна до домена, хостинга и заявок, которые приходят прямо в ваш Telegram.</p>
  </section>

  <section class="wrap sec" id="services">
    ${head('Услуги', 'Что мы делаем <em>для вашего бизнеса</em>', 'Базу и каждую опцию видно заранее, без скрытых платежей.')}
    <div class="tiles">
      <a class="tile up" href="${R}uslugi/#sites"><h3>Сайты под ключ</h3><p>Дизайн под ваш бренд, адаптив под телефон, домен, хостинг и заявки в Telegram</p><span class="p">от ${rub(SITE.base)} ${ARROW}</span></a>
      <a class="tile up" href="${R}uslugi/#bots"><h3>Telegram-боты</h3><p>Заявки, запись, каталог, оплата и рассылки — собираем из нужных функций</p><span class="p">от ${rub(BOT.base)} ${ARROW}</span></a>
      <a class="tile up" href="${R}uslugi/#support"><h3>Поддержка</h3><p>Правки, обновления и помощь после запуска — для сайтов и ботов</p><span class="p">${rub(SITE.support)} в месяц ${ARROW}</span></a>
    </div>
    <a class="teaser up" href="${R}razbor/"><div><b>Уже есть сайт? Бесплатно разберём его</b><span>Пришлите ссылку — ответим тремя конкретными улучшениями</span></div><span class="btn white">Получить разбор ${ARROW}</span></a>
    ${bar(R, 'Хотите узнать точную цену?', 'Посчитать стоимость')}
  </section>
</div>

<section class="work dark" id="work">
  <div class="wrap">${head('Работы', 'Сайты, которые <em>мы сделали</em>', 'Каждый собран под конкретную задачу клиента: свой стиль, своя структура и понятный путь к заявке.')}</div>
  ${caseCards(R)}
  <div class="wrap" style="margin-top:clamp(28px,3vw,44px)">${more(`${R}raboty/#demo`, 'Ещё три демо-сайта: кофейня, студия, школа')}</div>
</section>

<div class="sheet">
  <section class="wrap sec" id="prices">
    ${head('Цены', 'Цена известна <em>до начала работы</em>', 'Платите один раз за готовый сайт, без подписки за конструктор.', more(`${R}ceny/`, 'Все цены на сайты и ботов'))}
    ${siteBase}
    <p class="note up">Как проходит работа — <a href="${R}process/" style="text-decoration:underline;text-underline-offset:3px">пять шагов от заявки до запуска</a>. Частые вопросы — <a href="${R}voprosy/" style="text-decoration:underline;text-underline-offset:3px">сроки, домен, правки</a>.</p>
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
    <p class="note">Сервер для бота оплачивается отдельно: ${BOT.server} в месяц. ${more(`${R}raboty/#bots`, 'Попробовать демо-бота')}</p>
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
  <section class="wrap sec" id="demo">
    ${head('Демо-сайты', 'Как может выглядеть <em>ваш сайт</em>', 'Три демо в разных стилях и сферах. Бренды и данные в них вымышлены — это показ возможностей.')}
    ${demos(R)}
  </section>

  <section class="wrap sec" id="bots">
    <div class="bots">
      <div>
        ${head('Демо-бот', 'Запись в студию <em>за минуту</em>', 'Так клиенты записываются к вам в Telegram: бот открывает мини-приложение — процедура, мастер, день и время. Подтверждение и напоминание приходят в чат. Студия «Линия» вымышлена, запись никуда не уходит.')}
        <span class="label" style="color:var(--ink3)">Что внутри этого бота</span>
        <ul class="bot-feats">
          <li><span>Запись на дату и время</span><b>+${rub(6000)}</b></li>
          <li><span>Напоминания клиентам</span><b>+${rub(2000)}</b></li>
          <li><span>Мини-приложение внутри бота</span><b>от +${rub(10000)}</b></li>
        </ul>
        <p class="note">База любого бота — ${rub(BOT.base)}: меню, ответы на вопросы, заявки вам в Telegram. Функции добавляются по <a href="${R}ceny/#bots" style="text-decoration:underline;text-underline-offset:3px">прайсу</a>.</p>
        <a class="btn" href="https://t.me/fgfgfgfgfg76_bot" target="_blank" rel="noopener" style="margin-top:22px">${TG} Попробовать в Telegram</a>
      </div>
      <div class="tg-wrap up">
        <div class="tg">
          <i class="tg-btn tg-act"></i><i class="tg-btn tg-vol1"></i><i class="tg-btn tg-vol2"></i><i class="tg-btn tg-pwr"></i>
          <div class="tg-in tg-app">
            <div class="tg-status light"><span class="tg-time">9:41</span><i class="tg-island"></i><span class="tg-ic">${STATUS_ICONS}</span></div>
            <div class="tg-apphead"><span>Закрыть</span><b>Линия · запись</b><span>⋯</span></div>
            <iframe src="${R}demo/linia/" title="Мини-приложение записи «Линия»" loading="lazy"></iframe>
            <i class="tg-home dark"></i>
          </div>
        </div>
        <span class="tg-hint">Это работает: выберите процедуру и время прямо здесь</span>
      </div>
    </div>
  </section>

  <section class="wrap sec">
    ${bar(R, 'Хотите сайт или бота под свою задачу?')}
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
      extra: `<div class="acts">${c.url ? ext(c.url, c.host, 'btn white') : ''}<a class="btn glass" href="${R}raboty/">Все работы</a></div>
    <div class="viewer up" data-view="desktop">
      <div class="seg" role="group" aria-label="Как показать сайт">
        <button type="button" data-v="desktop" aria-pressed="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg>Компьютер</button>
        <button type="button" data-v="phone" aria-pressed="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/></svg>Телефон</button>
      </div>
      <div class="stage">
        <div class="shot"><video src="${R}media/cases/${c.slug}.mp4" poster="${R}img/work/${c.img}.jpg" muted loop playsinline preload="none" data-play aria-label="Прокрутка сайта ${c.name} на компьютере"></video></div>
        <div class="phone iph"><i class="ib act"></i><i class="ib v1"></i><i class="ib v2"></i><i class="ib pw"></i>
          <div class="scr"><div class="sb"><span>9:41</span><i class="isl"></i><span class="ic">${STATUS_ICONS}</span></div><video src="${R}media/cases/${c.slug}-m.mp4" poster="${R}img/work/${c.img}-m.jpg" muted loop playsinline preload="none" data-play aria-label="Прокрутка сайта ${c.name} на телефоне"></video><i class="hb"></i></div>
        </div>
      </div>
    </div>`,
    })}

<div class="sheet after">
  <section class="wrap sec">
    ${head('Главное', 'Что <em>сделали</em>')}
    <div class="facts points">
      ${c.items.map(([n, d]) => `<div class="fact up"><b>${n}</b><span>${d}</span></div>`).join('\n      ')}
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
    ${nextp(R, 'voprosy/', 'Вопросы и ответы')}
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
  body: R => `${ptop({ label: 'Заявка', h1: 'Расскажите <em>о проекте</em>', lead: 'Шесть коротких шагов. Цена считается сразу, ответы сохраняются в этом браузере.', extra: `<div class="acts">${tgBtn('btn glass', 'Удобнее в Telegram — открыть приложение')}</div>` })}

<div class="zwrap">
<div class="apply page" id="apply">
${FORM.replaceAll('{{R}}', R)}
</div>
</div>`,
});

page('razbor/', {
  title: 'Бесплатный разбор сайта — duo',
  desc: 'Пришлите ссылку на сайт — посмотрим его глазами клиента и ответим тремя конкретными улучшениями. Бесплатно.',
  body: R => `${ptop({ label: 'Бесплатно', h1: 'Разбор <em>вашего сайта</em>', lead: 'Пришлите ссылку — посмотрим сайт глазами вашего клиента и ответим тремя конкретными улучшениями. Бесплатно и без обязательств.' })}

<div class="sheet after">
  <section class="wrap sec">
    ${head('Что смотрим', 'Четыре вещи, <em>которые теряют заявки</em>')}
    <div class="rows desc focus">
      ${row('Первый экран', 'Понятно ли за несколько секунд, что вы предлагаете и для кого', null)}
      ${row('Путь к заявке', 'Сколько шагов от первого экрана до звонка или сообщения и где человек может уйти', null)}
      ${row('Телефон', 'Как сайт выглядит и работает на телефоне — многие заходят именно с него', null)}
      ${row('Скорость', 'Как быстро открывается первый экран и что его тормозит', null)}
    </div>

    <div class="subhead up"><h3>Как это работает</h3></div>
    <div class="rows">
      ${row('Ссылка', 'Присылаете адрес сайта и как с вами связаться', '1 минута')}
      ${row('Смотрим', 'Проходим сайт как ваш клиент — с компьютера и с телефона', 'сами')}
      ${row('Ответ', 'Пишем три улучшения: что поправить и почему это важно', 'в Telegram или звонком')}
    </div>

    <div class="audit up" id="audit" style="margin-top:clamp(48px,6vw,80px)">
      <div>
        <span class="label" style="color:var(--t3)">Заявка на разбор</span>
        <h3>Пришлите ссылку <em>на сайт</em></h3>
        <p>Разбор бесплатный и ни к чему не обязывает. Если захотите исправить сами — исправите сами.</p>
      </div>
      <form id="auditForm" novalidate>
        <p class="send-err" id="auditErr" role="alert"></p>
        <label class="hp" aria-hidden="true">Не заполняйте это поле <input name="website" tabindex="-1" autocomplete="off"></label>
        <label class="f"><span>Адрес сайта <b>*</b></span><input class="inp" name="url" inputmode="url" placeholder="example.ru" required><em class="err">Напишите адрес сайта</em></label>
        <div class="grid2">
          <label class="f"><span>Имя <b>*</b></span><input class="inp" name="name" autocomplete="name" placeholder="Как к вам обращаться" required><em class="err">Напишите имя</em></label>
          <label class="f"><span>Telegram или телефон <b>*</b></span><input class="inp" name="contact" placeholder="@username или +7…" required><em class="err">Как с вами связаться</em></label>
        </div>
        <label class="f"><span>Что беспокоит <small>— необязательно</small></span><textarea class="inp" name="comment" placeholder="Например: мало заявок, неудобно с телефона"></textarea></label>
        <div class="f" data-need="consent"><label class="check"><input type="checkbox" name="consent" value="да"> <span>Соглашаюсь на обработку персональных данных по <a href="${R}privacy/" target="_blank" rel="noopener">политике</a></span></label><em class="err">Без согласия мы не сможем принять заявку</em></div>
        <button class="btn white" type="submit">Получить разбор ${ARROW}</button>
      </form>
      <div class="ok-msg"><h3>Спасибо, <em>ссылка у нас</em></h3><p>Посмотрим сайт и напишем вам выбранным способом.</p></div>
    </div>
    ${nextp(R, 'raboty/', 'Наши работы')}
  </section>
</div>`,
});

page('voprosy/', {
  title: 'Вопросы и ответы — duo',
  desc: 'Сколько стоит сайт и бот, сколько длится работа, кто платит за домен и можно ли менять сайт самому.',
  body: R => `${ptop({ label: 'Вопросы', h1: 'Вопросы <em>и ответы</em>', lead: 'Собрали то, что спрашивают чаще всего. Не нашли ответ — напишите нам в Telegram.' })}

<div class="sheet after">
  <section class="wrap sec">
    ${faq(R)}
    ${bar(R, 'Остались вопросы?', 'Оставить заявку')}
    ${nextp(R, 'o-nas/', 'О нас')}
  </section>
</div>`,
});

page('privacy/', {
  title: 'Политика обработки персональных данных — duo',
  desc: 'Какие данные собирает сайт студии duo, зачем и как их удалить.',
  body: R => `${ptop({ label: 'Документ', h1: 'Политика обработки <em>персональных данных</em>', lead: 'Редакция от 20 октября 2026 года.', cls: 'short' })}

<div class="sheet after">
  <section class="wrap sec">
    <div class="doc">
      <p>Эта политика объясняет, какие данные собирает Студия DUO (далее — «мы») через форму заявки на этом сайте, зачем они нужны и как их удалить. Политика составлена в соответствии с Федеральным законом № 152-ФЗ «О персональных данных». Для бота @duodevops_bot и мини-приложения DUO действует <a href="https://danildenis.github.io/duo-app/privacy.html" target="_blank" rel="noopener">отдельная политика</a>.</p>
      <h2>Оператор</h2>
      <p>Оператор персональных данных — Студия DUO. Связаться по вопросам данных: Telegram-бот <a href="https://t.me/duodevops_bot" target="_blank" rel="noopener">@duodevops_bot</a> — в приложении DUO раздел «Задать вопрос».</p>
      <h2>Какие данные мы обрабатываем</h2>
      <ul>
        <li>имя, телефон и электронная почта, которые вы указали в заявке;</li>
        <li>удобный способ связи;</li>
        <li>ответы о бизнесе и проекте, выбранные параметры и предварительный расчёт стоимости.</li>
      </ul>
      <p>Мы не просим и не храним паспортные данные, платёжные реквизиты и пароли. Пока заявка не отправлена, черновик ответов хранится только в вашем браузере и никуда не передаётся; после отправки он удаляется.</p>
      <h2>Зачем</h2>
      <ul>
        <li>принять заявку и связаться с вами по ней выбранным способом;</li>
        <li>оценить проект и назвать стоимость и сроки.</li>
      </ul>
      <h2>Основание</h2>
      <p>Ваше согласие, которое вы даёте отметкой «Соглашаюсь на обработку персональных данных» перед отправкой заявки. Без согласия заявка не отправляется.</p>
      <h2>Кому передаём</h2>
      <p>Данные видят только менеджеры Студии DUO: заявка приходит им в рабочий чат Telegram. Мы не продаём и не передаём данные третьим лицам. Заявка проходит через сервер, который мы арендуем у хостинг-провайдера.</p>
      <h2>Сколько храним</h2>
      <p>До достижения целей обработки или до отзыва согласия — смотря что наступит раньше.</p>
      <h2>Ваши права</h2>
      <p>Вы можете узнать, какие ваши данные у нас есть, попросить исправить или удалить их, а также отозвать согласие. Напишите в бота <a href="https://t.me/duodevops_bot" target="_blank" rel="noopener">@duodevops_bot</a> — ответим в течение 10 рабочих дней.</p>
    </div>
  </section>
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
