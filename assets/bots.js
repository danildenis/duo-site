// Демо-боты на сайте: чат в стиле Telegram, посетитель жмёт кнопки — бот отвечает.
// Бренды и данные вымышлены (те же, что в демо-сайтах). Ничего никуда не отправляется.
(() => {
  const root = document.getElementById('bots');
  if (!root) return;
  const rub = n => n.toLocaleString('ru-RU').replace(/\s/g, ' ') + ' ₽';

  // ── сценарии: узел = (состояние) => { text, buttons: [[[надпись, следующий узел, действие?]]] } ──
  const LINE_S = [['Архитектура бровей', '60 мин', 1800], ['Ламинирование бровей', '75 мин', 2400], ['Ламинирование ресниц', '60 мин', 2600], ['Окрашивание ресниц', '20 мин', 700]];
  const DAYS = ['Сегодня', 'Завтра', 'Пятница'];
  const TIMES = ['11:30', '14:30', '17:30', '19:00'];
  const MENU = [['Капучино', 260], ['Флэт уайт', 280], ['Фильтр-кофе', 230], ['Круассан', 190], ['Чизкейк', 320]];

  const BOTS = {
    line: {
      name: 'Линия · запись', letter: 'Л', color: '#C9A28C', tg: 'https://t.me/fgfgfgfgfg76_bot',
      start: 'hi',
      nodes: {
        hi: () => ({ text: 'Здравствуйте! Я бот студии бровей и ресниц «Линия» 🌿\nЗапишу вас за минуту — без звонков и переписок.', buttons: [[['Записаться', 'svc']], [['Цены', 'price'], ['Адрес', 'addr']]] }),
        price: () => ({ text: '<b>Цены</b>\n' + LINE_S.map(s => `${s[0]} — ${rub(s[2])} · ${s[1]}`).join('\n'), buttons: [[['Записаться', 'svc']]] }),
        addr: () => ({ text: '📍 ул. Образцовая, 5\nЕжедневно 10:00–21:00', buttons: [[['Записаться', 'svc']]] }),
        svc: () => ({ text: 'На какую процедуру?', buttons: LINE_S.map((s, i) => [[`${s[0]} · ${rub(s[2])}`, 'master', st => (st.svc = i)]]) }),
        master: () => ({ text: 'К какому мастеру?', buttons: [[['Анна · 6 лет опыта', 'day', st => (st.m = 'Анна')]], [['Мария · 4 года опыта', 'day', st => (st.m = 'Мария')]], [['Любой свободный', 'day', st => (st.m = 'любой мастер')]]] }),
        day: () => ({ text: 'Выберите день:', buttons: [DAYS.map((d, i) => [d, 'time', st => (st.d = i)])] }),
        time: st => ({ text: `${DAYS[st.d]} свободно:`, buttons: [TIMES.slice(0, 2).map(t => [t, 'ok', s => (s.t = t)]), TIMES.slice(2).map(t => [t, 'ok', s => (s.t = t)])] }),
        ok: st => ({ text: `<b>Записала вас ✅</b>\n${LINE_S[st.svc][0]}, ${DAYS[st.d].toLowerCase()} в ${st.t}\nМастер: ${st.m}\nСтоимость: ${rub(LINE_S[st.svc][2])}\n\nНапомню за день и за 2 часа до визита.`, buttons: [[['Перенести', 'day'], ['Отменить', 'cancel']]] }),
        cancel: () => ({ text: 'Запись отменена. Будем рады видеть вас в другой раз!', buttons: [[['Записаться снова', 'svc']]] }),
      },
      features: [['Запись на дату и время', 6000], ['Напоминания клиентам', 2000]],
    },
    coffee: {
      name: 'Зерно · заказ с собой', letter: 'З', color: '#B98B5E', tg: 'https://t.me/gkgkgkgk76_bot',
      start: 'hi',
      nodes: {
        hi: st => ((st.cart = st.cart || {}), { text: 'Привет! Это кофейня «Зерно» ☕\nЗакажите здесь — заберёте без очереди через 5 минут.', buttons: [[['Меню', 'menu']], [['Где вы?', 'addr']]] }),
        addr: () => ({ text: '📍 ул. Примерная, 12', buttons: [[['Меню', 'menu']]] }),
        menu: st => {
          const n = Object.values(st.cart || {}).reduce((a, b) => a + b, 0);
          return { text: n ? `В корзине: ${n} шт. Добавить ещё?` : 'Что вам приготовить?', buttons: [...MENU.map((m, i) => [[`${m[0]} · ${rub(m[1])}`, 'menu', s => (s.cart[i] = (s.cart[i] || 0) + 1)]]), ...(n ? [[['🧺 Корзина', 'cart']]] : [])] };
        },
        cart: st => {
          const items = Object.entries(st.cart).filter(([, q]) => q);
          st.sum = items.reduce((a, [i, q]) => a + MENU[i][1] * q, 0);
          return { text: '<b>Ваш заказ</b>\n' + items.map(([i, q]) => `${MENU[i][0]} × ${q} — ${rub(MENU[i][1] * q)}`).join('\n') + `\n\nИтого: <b>${rub(st.sum)}</b>`, buttons: [[[`Оплатить ${rub(st.sum)}`, 'paid']], [['Добавить ещё', 'menu'], ['Очистить', 'hi', s => (s.cart = {})]]] };
        },
        paid: st => ((st.cart = {}), { text: `<b>Оплачено ✅</b>\nЗаказ № 128 будет готов через 5 минут.\nПокажите этот номер бариста.\n\n<i>Это демо: деньги не списываются.</i>`, buttons: [[['Заказать ещё', 'menu']]] }),
      },
      features: [['Каталог товаров или услуг', 5000], ['Оплата в боте', 6000]],
    },
    talky: {
      name: 'Talky · английский', letter: 'T', color: '#E9C640',
      start: 'hi',
      nodes: {
        hi: () => ({ text: 'Hi! 👋 Это онлайн-школа английского «Talky».\nДавайте за минуту узнаем ваш уровень — и подберём первый урок.', buttons: [[['Пройти тест', 'q1']], [['Тарифы', 'price']]] }),
        price: () => ({ text: '<b>Тарифы</b>\n4 урока в группе — 4 900 ₽\n8 уроков в группе — 7 200 ₽\n8 индивидуальных — 12 800 ₽\n\nПервый пробный урок — бесплатно.', buttons: [[['Пройти тест', 'q1']]] }),
        q1: st => ((st.score = 0), { text: 'Вопрос 1 из 3\nI ___ to work every day.', buttons: [[['go', 'q2', s => s.score++], ['goes', 'q2'], ['going', 'q2']]] }),
        q2: () => ({ text: 'Вопрос 2 из 3\nShe has lived here ___ 2019.', buttons: [[['for', 'q3'], ['since', 'q3', s => s.score++], ['from', 'q3']]] }),
        q3: () => ({ text: 'Вопрос 3 из 3\nIf I ___ more time, I would travel.', buttons: [[['have', 'res'], ['had', 'res', s => s.score++], ['will have', 'res']]] }),
        res: st => {
          const lvl = ['A1', 'A2', 'B1', 'B2'][st.score];
          return { text: `Ваш уровень примерно <b>${lvl}</b> 🎯\nПреподаватель уточнит его на бесплатном пробном уроке — 15 минут.`, buttons: [[['Записаться на пробный', 'when', s => (s.lvl = lvl)]]] };
        },
        when: () => ({ text: 'Когда удобно?', buttons: [[['Будни утром', 'done'], ['Будни вечером', 'done']], [['Выходные', 'done']]] }),
        done: st => ({ text: `<b>Готово ✅</b>\nЗаявка на пробный урок (уровень ${st.lvl}) у менеджера — он напишет вам в течение часа и пришлёт ссылку на урок.`, buttons: [[['Пройти тест ещё раз', 'q1']]] }),
      },
      features: [['Заявки вам в Telegram', 0], ['База клиентов (Google-таблица или CRM)', 3000]],
    },
  };

  const chat = root.querySelector('.tg-msgs'), head = root.querySelector('.tg-head'), feats = root.querySelector('.bot-feats'), live = root.querySelector('.bot-live');
  let bot, st, timer;

  function bubble(html, who) {
    const el = document.createElement('div');
    el.className = 'tg-msg ' + who;
    el.innerHTML = html.replace(/\n/g, '<br>');
    chat.appendChild(el);
    chat.scrollTop = chat.scrollHeight;
    return el;
  }
  function say(node) {
    const { text, buttons } = bot.nodes[node](st);
    const typing = bubble('<i class="dots"><b></b><b></b><b></b></i>', 'bot typing');
    clearTimeout(timer);
    timer = setTimeout(() => {
      typing.remove();
      const m = bubble(text, 'bot');
      const kb = document.createElement('div');
      kb.className = 'tg-kb';
      buttons.forEach(row => {
        const r = document.createElement('div');
        row.forEach(([label, next, act]) => {
          const b = document.createElement('button');
          b.type = 'button'; b.textContent = label;
          b.addEventListener('click', () => {
            chat.querySelectorAll('.tg-kb button').forEach(x => (x.disabled = true));
            bubble(label.replace(/</g, '&lt;'), 'me');
            if (act) act(st);
            say(next);
          });
          r.appendChild(b);
        });
        kb.appendChild(r);
      });
      m.after(kb);
      chat.scrollTop = chat.scrollHeight;
    }, 550);
  }
  function open(id) {
    bot = BOTS[id]; st = {};
    root.querySelectorAll('[data-bot]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.bot === id)));
    head.querySelector('.av').textContent = bot.letter;
    head.querySelector('.av').style.background = bot.color;
    head.querySelector('.nm').textContent = bot.name;
    if (live) { live.hidden = !bot.tg; if (bot.tg) live.href = bot.tg; }
    feats.innerHTML = bot.features.map(([n, p]) => `<li><span>${n}</span><b>${p ? '+' + rub(p) : 'в базе'}</b></li>`).join('');
    chat.innerHTML = '<div class="tg-day">Демо · бренд вымышлен</div>';
    say(bot.start);
  }
  root.querySelectorAll('[data-bot]').forEach(b => b.addEventListener('click', () => open(b.dataset.bot)));
  root.querySelector('.tg-restart').addEventListener('click', () => open(Object.keys(BOTS).find(k => BOTS[k] === bot)));
  open('line');
})();
