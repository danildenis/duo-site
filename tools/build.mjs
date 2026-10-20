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

// ── работы ── (sb — цвет строки состояния телефона: фон и текст, как верх сайта)
const CASES = [
  {
    slug: 'car-export', sb: ['#0e0f13', '#fff'], n: '01', tint: 'rgba(230,60,70,.7)', img: 'carexport',
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
    slug: 'ksenia', sb: ['#fff', '#111'], n: '02', tint: 'rgba(220,200,170,.6)', img: 'ksenia',
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
    slug: 'vkusny', sb: ['#f0dac5', '#3b1f1a'], n: '03', tint: 'rgba(255,150,80,.65)', img: 'vkusny',
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
// Вопросы на главной: облако «таблеток». Блок закреплён на экране, таблетки проявляются из размытия по одной,
// пока его прокручиваешь (как на 13322566869.com). Нажали — ответ под облаком. #faq стоит там, где все уже видны.
const faq = R => `<section class="faq dark" aria-labelledby="faqT">
  <i class="faq-anchor" id="faq" aria-hidden="true"></i>
  <div class="faq-pin">
    <div class="wrap">
      <h2 class="label" id="faqT">Частые вопросы</h2>
      <div class="pills">
        ${FAQ.map(([q], i) => `<button class="pill" type="button" data-i="${i}" aria-expanded="false" aria-controls="faqA">${q}</button>`).join('\n        ')}
        <a class="pill ask" href="${TG_APP}" target="_blank" rel="noopener">${TG} Свой вопрос — в Telegram</a>
      </div>
      <div class="faq-a" id="faqA" aria-live="polite"><p class="hint">Нажмите на вопрос — ответ появится здесь</p></div>
    </div>
  </div>
  <div class="faq-src" hidden>${FAQ.map(([, a]) => `<div>${a(R)}</div>`).join('')}</div>
</section>`;

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
const NAV_R = [['process/', 'Процесс'], ['#faq', 'Вопросы'], ['o-nas/', 'О нас']];
// ссылка на якорь главной: на самой главной — просто #…, чтобы прокрутка шла плавно, без перехода
const href = (R, h) => (h[0] === '#' && R === './' ? h : R + h);
const nav = (R, cur, list) => list.map(([h, t]) => `<a href="${href(R, h)}"${h === cur ? ' aria-current="page"' : ''}>${t}</a>`).join('');

const header = (R, cur) => `<header class="notch" id="notch">
  <span class="side l" aria-hidden="true"><span class="wing"><i class="ear"></i></span></span>
  <span class="side r" aria-hidden="true"><span class="wing"><i class="ear"></i></span></span>
  <span class="hit" aria-hidden="true"></span>
  <nav class="l" aria-label="Разделы">${nav(R, cur, NAV_L)}</nav>
  <a class="home" href="${R}" aria-label="duo — на главную"></a>
  <nav class="r" aria-label="Разделы">${nav(R, cur, NAV_R)}</nav>
  <button class="burger" type="button" aria-label="Меню" aria-expanded="false"><i></i><i></i></button>
  <div class="menu-m">${nav(R, cur, [['', 'Главная'], ...NAV_L, ...NAV_R])}<a class="tg-link" href="${TG_APP}" target="_blank" rel="noopener">${TG} Открыть в Telegram</a><a class="btn white" href="${R}zayavka/">${CTA}</a></div>
</header>`;

const footer = R => `<footer class="foot dark" id="contacts">
  <div class="wrap foot-grid">
    <div>
      <div class="mk" aria-hidden="true"></div>
      <p>Делаем сайты и Telegram-ботов для бизнеса. Напишите нам в Telegram или посчитайте стоимость в боте — ответим и подскажем, с чего начать.</p>
      <p class="legal"><a href="${R}privacy/">Политика обработки персональных данных</a></p>
    </div>
    <div><h4>Разделы</h4><ul>${[['raboty/', 'Работы'], ['uslugi/', 'Услуги'], ['ceny/', 'Цены'], ['process/', 'Процесс'], ['#faq', 'Вопросы'], ['razbor/', 'Разбор сайта'], ['o-nas/', 'О нас'], ['zayavka/', 'Заявка']].map(([h, t]) => `<li><a href="${href(R, h)}">${t}</a></li>`).join('')}</ul></div>
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
<script src="${R}assets/lenis.min.js?v=1.3.26" defer></script>
<script src="${R}assets/site.js?v=${VER}" defer></script>
</head>
<body class="${home ? 'wait' : 'inner'}">${home ? '\n<script>document.documentElement.classList.add("js")</script>' : ''}
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
// Финальная плашка страницы — одно главное действие. Telegram — тихой ссылкой под текстом, не второй кнопкой.
// Внутри разделов вместо плашек — ссылка step() с уже выбранным типом проекта.
const CTA = 'Рассчитать стоимость';
const TG_ALT = `Удобнее в Telegram? <a href="${TG_APP}" target="_blank" rel="noopener">Откройте приложение DUO</a> — там тот же расчёт`;
const bar = (R, text, { btn = CTA, href = `${R}zayavka/`, alt = TG_ALT, out = false } = {}) =>
  `<div class="bar up"><span>${text}<em class="alt">${alt}</em></span><div class="acts"><a class="btn" href="${href}"${out ? ' target="_blank" rel="noopener"' : ''}>${btn} ${ARROW}</a></div></div>`;
const step = (href, text) => `<div class="step-link up">${more(href, text)}</div>`;
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
      <svg class="mark" viewBox="155 152 2744 1404" aria-hidden="true"><defs><clipPath id="markBase" clipPathUnits="userSpaceOnUse"><rect x="-400" y="-1400" width="3800" height="2962"/></clipPath></defs><g clip-path="url(#markBase)"><g class="rise rDu"><path fill="#F2F3F5" fill-rule="evenodd" d="M 1020.500 483.082 C 993 485.887, 961.157 497.430, 940 512.262 C 927.376 521.111, 908.965 539.346, 901.187 550.703 C 896.988 556.833, 888.544 572.685, 886.379 578.500 C 882.758 588.229, 881.518 592.168, 879.195 601.330 L 876.616 611.500 876.307 858 C 876.003 1100.146, 875.962 1104.747, 873.955 1118.500 C 870.927 1139.249, 866.105 1160.472, 861.617 1172.804 C 847.661 1211.147, 828.266 1241.304, 800.533 1267.782 C 787.753 1279.984, 772.110 1291.880, 754.480 1302.803 C 744.431 1309.029, 722.107 1318.956, 705.500 1324.582 C 674.945 1334.934, 665.302 1336.377, 626.500 1336.399 C 596.583 1336.416, 596.460 1336.408, 582 1333.276 C 565.895 1329.788, 546.944 1324.264, 537.613 1320.338 C 467.917 1291.012, 419.007 1235.202, 401.917 1165.500 C 392.539 1127.250, 392.626 1089.205, 402.180 1051.500 C 407.819 1029.241, 413.210 1016.990, 428.801 991 C 455.669 946.211, 505.001 908.768, 556.500 894.078 C 582.670 886.613, 598.221 884.500, 627 884.500 C 650.056 884.500, 655.615 885.066, 682 890.097 C 711.132 895.652, 741.784 907.711, 771.551 925.327 C 790.167 936.344, 827.622 967.391, 837.298 979.824 C 838.287 981.095, 839.637 981.954, 840.298 981.734 C 841.711 981.263, 843.078 708.385, 841.690 703.858 C 840.776 700.878, 839.387 700.173, 816.500 691.079 C 802.207 685.400, 798.475 684, 797.632 684 C 797.176 684, 795.384 683.328, 793.651 682.507 C 791.918 681.685, 788.250 680.369, 785.500 679.582 C 782.750 678.795, 777.350 677.220, 773.500 676.082 C 727.336 662.430, 688.876 657.658, 625 657.657 C 568.979 657.655, 540.886 661.266, 486.500 675.456 C 475.122 678.425, 453.934 686.124, 431.500 695.440 C 418.519 700.832, 394.324 712.965, 383.340 719.593 C 381.602 720.642, 377.591 723.008, 374.425 724.852 C 333.879 748.464, 292.389 784.629, 254.367 829.500 C 234.997 852.359, 206.153 899.047, 193.822 927.500 C 172.941 975.684, 160.675 1021.317, 156.996 1064.500 C 152.479 1117.518, 156.711 1178.699, 167.683 1219 C 186.848 1289.398, 223.161 1353.852, 274.376 1408.373 C 298.300 1433.842, 337.052 1466.025, 362.673 1481.703 C 371.773 1487.271, 385.294 1495.127, 387.500 1496.127 C 388.600 1496.625, 391.525 1498.190, 394 1499.603 C 403.458 1505.004, 425.728 1515.970, 434.500 1519.547 C 436.150 1520.219, 440.425 1521.974, 444 1523.445 C 457.580 1529.034, 495.763 1541.079, 505 1542.687 C 506.375 1542.927, 511.550 1543.983, 516.500 1545.033 C 558.845 1554.022, 573.414 1555.375, 628.500 1555.434 C 670.870 1555.480, 675.881 1555.303, 692 1553.191 C 722.009 1549.260, 752.202 1542.965, 770 1536.929 C 793.340 1529.013, 818.037 1519.374, 832.330 1512.604 C 838.837 1509.522, 844.313 1507, 844.499 1507 C 845.639 1507, 882.059 1485.677, 889.500 1480.653 C 926.067 1455.964, 960.946 1425.175, 986.567 1394.968 C 999.916 1379.230, 1019.300 1352.919, 1021.598 1347.420 C 1023.848 1342.034, 1026.085 1342.939, 1032.300 1351.750 C 1056.713 1386.359, 1110.219 1437.847, 1144.308 1459.533 C 1148.602 1462.265, 1154.002 1465.709, 1156.308 1467.186 C 1158.613 1468.664, 1163.200 1471.493, 1166.500 1473.473 C 1169.800 1475.453, 1175.875 1479.128, 1180 1481.640 C 1189.941 1487.693, 1220.556 1503, 1222.721 1503 C 1223.029 1503, 1225.130 1503.875, 1227.390 1504.945 C 1243.175 1512.418, 1263.779 1520.050, 1284 1525.915 C 1288.125 1527.111, 1293.525 1528.706, 1296 1529.460 C 1305.968 1532.494, 1334.257 1538.563, 1343 1539.543 C 1346.025 1539.882, 1350.156 1540.582, 1352.180 1541.099 C 1360.942 1543.338, 1398.622 1546.982, 1423.593 1548.008 C 1498.747 1551.093, 1573.358 1540.580, 1635.500 1518.150 C 1656.292 1510.645, 1657.995 1509.982, 1665.441 1506.496 C 1669.548 1504.573, 1673.160 1503, 1673.469 1503 C 1674.786 1503, 1705.264 1487.337, 1711.500 1483.455 C 1713.700 1482.086, 1716.410 1480.573, 1717.523 1480.094 C 1721.412 1478.418, 1750.698 1458.245, 1761.992 1449.462 C 1795.683 1423.261, 1831.877 1383.773, 1854.531 1348.500 C 1857.710 1343.550, 1862.069 1336.800, 1864.218 1333.500 C 1866.367 1330.200, 1872.604 1318.405, 1878.078 1307.289 C 1902.791 1257.099, 1914.717 1215.546, 1922.709 1151.787 C 1924.375 1138.497, 1924.500 1123.964, 1924.500 943.500 L 1924.500 749.500 1922.149 737.500 C 1916.115 706.701, 1903.756 683.695, 1881.034 660.962 C 1848.373 628.287, 1796.116 611.957, 1745 618.452 C 1733.062 619.969, 1718.318 623.341, 1712.500 625.886 C 1711.400 626.367, 1707.175 628.036, 1703.110 629.595 C 1658.829 646.583, 1626.272 685.999, 1614.811 736.500 L 1612.541 746.500 1611.981 941.500 C 1611.423 1135.762, 1611.413 1136.540, 1609.279 1147 C 1597.167 1206.384, 1576.617 1241.349, 1533.305 1276.264 C 1502.575 1301.036, 1461.700 1314.335, 1417.066 1314.083 C 1358.563 1313.753, 1309.892 1294.154, 1270 1254.861 C 1238.184 1223.523, 1218.978 1185.948, 1208.735 1135 C 1206.630 1124.529, 1206.622 1123.793, 1206.005 867.500 C 1205.331 587.438, 1205.789 608.576, 1199.971 588.822 C 1195.601 573.983, 1182.550 550.756, 1170.833 536.963 C 1147.762 509.807, 1104.551 487.776, 1065.026 483.020 C 1055.311 481.851, 1032.257 481.883, 1020.500 483.082"/></g><g class="rise rO"><path fill="#F2F3F5" fill-rule="evenodd" d="M 2377 658.619 C 2355.840 659.904, 2328.015 663.402, 2314.500 666.479 C 2311.200 667.230, 2304.225 668.794, 2299 669.955 C 2277.086 674.826, 2249.517 683.611, 2234.349 690.557 C 2232.616 691.351, 2230.816 692.002, 2230.349 692.003 C 2227.093 692.017, 2197.294 706.056, 2183 714.311 C 2178.325 717.011, 2173.600 719.613, 2172.500 720.093 C 2171.400 720.573, 2168.854 721.986, 2166.843 723.233 C 2164.832 724.480, 2160.557 727.024, 2157.343 728.886 C 2149.990 733.148, 2135.065 743.430, 2124 751.857 C 2078.788 786.289, 2038.840 829.852, 2011.852 874.154 C 2010.396 876.544, 2007.080 881.875, 2004.483 886 C 1995.388 900.447, 1981.404 929.628, 1970.937 956 C 1967.388 964.940, 1957.275 997.292, 1954.586 1008.303 C 1944.568 1049.337, 1941.032 1110.069, 1945.963 1156.412 C 1947.128 1167.363, 1948.256 1176.605, 1948.468 1176.949 C 1948.681 1177.293, 1949.586 1182.507, 1950.480 1188.537 C 1955.578 1222.934, 1971.132 1267.995, 1991.887 1308.500 C 2024.188 1371.539, 2073.734 1427.056, 2138.695 1473 C 2149.277 1480.484, 2167.236 1491.285, 2184.500 1500.549 C 2188.350 1502.615, 2193.750 1505.518, 2196.500 1507.001 C 2209.220 1513.858, 2245.254 1528.547, 2256.500 1531.460 C 2259.250 1532.173, 2262.625 1533.219, 2264 1533.786 C 2279.977 1540.372, 2315.797 1547.938, 2356 1553.218 C 2370.883 1555.173, 2376.960 1555.382, 2418 1555.354 C 2464.895 1555.322, 2485.155 1554.032, 2509 1549.558 C 2513.125 1548.784, 2518.525 1547.850, 2521 1547.483 C 2544.208 1544.038, 2596.509 1528.165, 2622 1516.830 C 2624.475 1515.729, 2628.279 1514.080, 2630.454 1513.164 C 2641.652 1508.450, 2673.892 1491.506, 2683 1485.548 C 2684.925 1484.288, 2691.900 1479.726, 2698.500 1475.409 C 2718.371 1462.412, 2729.434 1453.741, 2754.244 1431.719 C 2786.008 1403.523, 2810.691 1374.057, 2835.259 1335 C 2868.369 1282.364, 2888.437 1225.973, 2896.646 1162.500 C 2899.570 1139.891, 2899.278 1075.426, 2896.149 1053 C 2888.791 1000.250, 2877.770 964.197, 2854.322 916.164 C 2832.287 871.025, 2802.544 829.463, 2767.872 795.365 C 2729.606 757.731, 2697.179 734.423, 2646 707.764 C 2631.114 700.010, 2606.026 689.579, 2585.500 682.610 C 2579.042 680.417, 2575.023 679.210, 2557 674.049 C 2545.144 670.655, 2520.704 665.595, 2506 663.492 C 2500.225 662.666, 2492.575 661.565, 2489 661.045 C 2479.065 659.600, 2428.201 656.976, 2413 657.123 C 2405.575 657.195, 2389.375 657.869, 2377 658.619 M 2391.500 884.956 C 2362.792 888.601, 2340.819 894.420, 2317.222 904.627 C 2285.603 918.305, 2252.746 943.153, 2232.123 968.983 C 2218.804 985.665, 2215.959 990.016, 2205.956 1009 C 2192.926 1033.727, 2184.668 1064.793, 2183.025 1095.259 C 2181.322 1126.825, 2184.461 1151.182, 2194.202 1182 C 2208.817 1228.234, 2241.945 1271.332, 2283.500 1298.172 C 2330.976 1328.837, 2381.427 1340.993, 2440.328 1335.960 C 2485.531 1332.098, 2532.216 1312.521, 2566.464 1283.069 C 2613.151 1242.917, 2638.125 1195.540, 2645.569 1133 C 2647.821 1114.082, 2646.707 1086.520, 2642.948 1068.129 C 2642.428 1065.583, 2641.523 1061.025, 2640.938 1058 C 2637.090 1038.120, 2623.701 1006.062, 2611.493 987.500 C 2598.075 967.098, 2580.875 948.709, 2558.164 930.485 C 2537.017 913.515, 2500.604 896.280, 2476.765 891.957 C 2473.488 891.363, 2469.684 890.450, 2468.313 889.929 C 2458.083 886.039, 2408.336 882.819, 2391.500 884.956"/></g></g><path class="dot dL" fill="#F2F3F5" d="M 1023 153.017 C 1006.614 155.710, 996.970 158.657, 982.728 165.327 C 953.908 178.822, 931.193 199.219, 916.829 224.500 C 900.607 253.052, 894.850 276.220, 896.951 304.500 C 898.507 325.448, 903.395 343.639, 911.729 359.500 C 916.656 368.877, 918.200 371.500, 920.850 374.996 C 922.308 376.919, 924.543 380.021, 925.817 381.889 C 939.093 401.353, 969.782 423.126, 997 432.392 C 1020.254 440.309, 1057.279 441.293, 1083 434.678 C 1111.365 427.383, 1130.008 416.605, 1152.369 394.572 C 1169.550 377.641, 1179.945 359.531, 1189.013 330.727 C 1195.270 310.852, 1193.884 275.725, 1185.899 251.837 C 1172.721 212.409, 1142.707 180.236, 1103.500 163.511 C 1084.174 155.267, 1072.131 152.844, 1048.500 152.449 C 1037.500 152.264, 1026.025 152.520, 1023 153.017"/><path class="dot dR" fill="#F2F3F5" d="M 1740 288.116 C 1706.948 291.892, 1676.452 306.919, 1650.940 332 C 1638.180 344.545, 1629.392 358.496, 1618.660 383.246 C 1615.800 389.843, 1612.151 406.158, 1610.913 417.889 C 1606.459 460.069, 1621.227 501.502, 1651.362 531.374 C 1674.146 553.959, 1695.957 565.561, 1729 572.671 C 1741.316 575.321, 1776.254 575.304, 1787 572.642 C 1821.513 564.095, 1838.205 555.292, 1862 533.091 C 1893.200 503.981, 1908.846 462.643, 1905.192 418.978 C 1901.127 370.400, 1871.410 326.639, 1826.802 303.542 C 1800.513 289.931, 1770.620 284.618, 1740 288.116"/></svg>
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
    <p class="note up">Как проходит работа — <a href="${R}process/" style="text-decoration:underline;text-underline-offset:3px">пять шагов от заявки до запуска</a>.</p>
  </section>
</div>

${faq(R)}

<div class="sheet">
  <section class="wrap sec" id="about">
    ${team(R, false)}
    ${bar(R, 'Узнайте цену <em>своего проекта</em>')}
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
    ${step(`${R}zayavka/?type=site`, 'Рассчитать стоимость сайта')}
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
    ${step(`${R}zayavka/?type=bot`, 'Рассчитать стоимость бота')}
  </section>

  <section class="wrap sec" id="support">
    ${head('03 · Поддержка', 'Остаёмся <em>на связи</em>', 'После запуска не пропадаем: правим, обновляем и помогаем. Поддержка — по желанию, отдельным платежом.')}
    <div class="rows">
      ${row('Поддержка сайта или бота', 'Правки, обновления и помощь после запуска', `${rub(SITE.support)}<small>в месяц</small>`)}
    </div>
    ${bar(R, 'Соберите свой проект <em>и узнайте итог</em>')}
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
    ${bar(R, 'Хотите сайт или бота <em>под свою задачу?</em>')}
    ${nextp(R, 'ceny/', 'Цены')}
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
        <div class="phone iph" style="--sb:${c.sb[0]};--sbt:${c.sb[1]}"><div class="fr"><i class="ib act"></i><i class="ib v1"></i><i class="ib v2"></i><i class="ib pw"></i>
          <div class="scr"><div class="sb"><span>9:41</span><i class="isl"></i><span class="ic">${STATUS_ICONS}</span></div><video src="${R}media/cases/${c.slug}-m.mp4" poster="${R}img/work/${c.img}-m.jpg" muted loop playsinline preload="none" data-play aria-label="Прокрутка сайта ${c.name} на телефоне"></video><i class="hb"></i></div>
        </div></div>
      </div>
    </div>`,
    })}

<div class="sheet after">
  <section class="wrap sec">
    ${head('Главное', 'Что <em>сделали</em>')}
    <div class="facts points">
      ${c.items.map(([n, d]) => `<div class="fact up"><b>${n}</b><span>${d}</span></div>`).join('\n      ')}
    </div>
    ${bar(R, 'Хотите такой же сайт <em>для себя?</em>')}
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
    ${step(`${R}zayavka/?type=site`, 'Рассчитать стоимость сайта')}
  </section>

  <section class="wrap sec" id="bots">
    <div class="subhead up"><h3>Telegram-бот</h3><p>Сервер для бота оплачивается отдельно: ${BOT.server} в месяц.</p></div>
    ${botBase}
    <div class="rows two">
      ${BOT.features.map(([n, p, from]) => row(n, '', `${from ? 'от ' : ''}+${rub(p)}`).replace('<span class="d"></span>', '')).join('\n      ')}
      ${row('Срочно', '', '+25%<small>к разработке, до 5 дней</small>').replace('<span class="d"></span>', '')}
      ${row('Поддержка', '', `${rub(BOT.support)}<small>в месяц</small>`).replace('<span class="d"></span>', '')}
    </div>
    ${bar(R, 'Соберите своего бота <em>и узнайте итог</em>', { href: `${R}zayavka/?type=bot`, btn: 'Рассчитать стоимость бота' })}
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
    ${bar(R, 'Первый шаг — <em>расчёт стоимости</em>')}
    ${nextp(R, '#faq', 'Частые вопросы')}
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
    ${bar(R, 'Обсудим <em>ваш проект?</em>')}
    ${nextp(R, 'raboty/', 'Наши работы')}
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
// старый адрес /voprosy/ — вопросы теперь на главной
mkdirSync(join(ROOT, 'voprosy'), { recursive: true });
writeFileSync(join(ROOT, 'voprosy/index.html'), `<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>Вопросы — duo</title><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0; url=../#faq"><link rel="canonical" href="${SITE_URL}#faq"></head><body><a href="../#faq">Вопросы и ответы — на главной</a></body></html>\n`);
console.log('✓ voprosy/index.html → ../#faq');
