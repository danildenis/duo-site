// duo · общий скрипт всех страниц. Каждая часть включается, только если её блок есть на странице.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // знак duo на главной — видео из After Effects (motion/hero-logo). Остальной экран ждёт старта видео
  const hero = document.querySelector('.hero'), v = document.getElementById('logoVideo');
  if (hero && v) {
    let go = false;
    const start = still => { if (go) return; go = true; if (still) hero.classList.add('still'); hero.classList.remove('wait'); document.body.classList.remove('wait'); };
    if (reduce) { v.removeAttribute('autoplay'); v.pause(); start(true); }
    else {
      if (!v.paused && v.currentTime > 0) start(false);
      v.addEventListener('playing', () => start(false), { once: true });
      v.querySelector('source:last-of-type').addEventListener('error', () => start(true));
      const pr = v.play(); if (pr) pr.catch(() => start(true));
      setTimeout(() => { if (v.paused) start(true); }, 1200);
    }
  }

  // меню в вырезе: на телефоне открывается по нажатию
  const notch = document.getElementById('notch'), burger = notch.querySelector('.burger');
  burger.addEventListener('click', () => { const o = notch.classList.toggle('open'); burger.setAttribute('aria-expanded', o); });
  const shut = () => { notch.classList.remove('open'); burger.setAttribute('aria-expanded', false); };
  notch.querySelectorAll('a').forEach(a => a.addEventListener('click', shut));
  document.addEventListener('pointerdown', e => { if (notch.classList.contains('open') && !notch.contains(e.target)) shut(); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && notch.classList.contains('open')) { shut(); burger.focus(); } });

  // вступление: слова проявляются по мере прокрутки
  const rv = document.querySelector('.reveal');
  let words = [];
  if (rv) { rv.innerHTML = rv.textContent.trim().split(/\s+/).map(w => `<span>${w}</span>`).join(' '); words = [...rv.children]; }

  // строки: подсвечивается та, что пересекает середину экрана
  const rowIO = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('on', e.isIntersecting)), { rootMargin: '-44% 0px -44% 0px' });
  document.querySelectorAll('.rows.focus .row').forEach(r => rowIO.observe(r));

  // работы: предыдущая карточка уходит вглубь и темнеет, когда на неё ложится следующая
  const cases = [...document.querySelectorAll('.case')];
  const stackMQ = matchMedia('(min-width:861px)');
  cases.forEach(c => c.insertAdjacentHTML('beforeend', '<i class="dim" aria-hidden="true"></i>'));
  const photo = document.querySelector('.photo img');
  const work = document.querySelector('.work');
  let caseTop = 0, caseH = 0;
  const measure = () => { if (cases[0]) { caseTop = parseFloat(getComputedStyle(cases[0]).top); caseH = cases[0].offsetHeight; } };
  measure();

  // что сейчас на экране: считаем только видимое
  const live = new Set();
  const liveIO = new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? live.add(e.target) : live.delete(e.target)), { rootMargin: '20% 0px' });
  [rv, work, photo && photo.parentElement].forEach(el => el && liveIO.observe(el));

  let ticking = false, lastK = -1, heroHidden = false;
  function frame() {
    ticking = false;
    const H = innerHeight, y = scrollY;
    if (rv && live.has(rv)) {
      const r = rv.getBoundingClientRect(), p = Math.min(1, Math.max(0, (H * .82 - r.top) / (r.height + H * .35)));
      const k = Math.round(p * words.length);
      if (k !== lastK) { words.forEach((w, i) => w.classList.toggle('on', i < k)); lastK = k; }
    }
    if (cases.length > 1 && stackMQ.matches && live.has(work)) {
      const tops = cases.map(c => c.getBoundingClientRect().top);
      for (let i = 0; i < cases.length - 1; i++) {
        const q = Math.min(1, Math.max(0, 1 - (tops[i + 1] - caseTop) / caseH));
        cases[i].style.transform = `scale(${(1 - q * .06).toFixed(4)})`; cases[i].lastElementChild.style.opacity = (q * .55).toFixed(3);
      }
    }
    if (photo && live.has(photo.parentElement)) { const b = photo.parentElement.getBoundingClientRect(); photo.style.transform = `translate3d(0,${((b.top + b.height / 2 - H / 2) / H) * -40}px,0)`; }
    // первый экран главной уходит вглубь под лист — только пока он виден
    if (hero) {
      if (y < H * 1.1) { const s = Math.min(1, y / H); hero.style.transform = `scale(${(1 - s * .06).toFixed(4)})`; hero.style.opacity = (1 - s * .75).toFixed(3); }
      const hide = y > H * 1.6;
      if (hide !== heroHidden) { heroHidden = hide; hero.style.visibility = hide ? 'hidden' : ''; }
    }
  }
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
  if (!reduce) { addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', () => { measure(); if (!stackMQ.matches) cases.forEach(c => { c.style.transform = ''; c.lastElementChild.style.opacity = ''; }); onScroll(); }); frame(); }
  else words.forEach(w => w.classList.add('on'));

  // заголовки и плашки появляются снизу
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -12% 0px' });
  document.querySelectorAll('.up').forEach(el => io.observe(el));

  // ── заявка: своя страница /zayavka/, 6 шагов и предварительный расчёт ──
  const form = document.getElementById('applyForm');
  if (!form) return;
  const steps = [...form.querySelectorAll('.step')], bars = [...form.querySelectorAll('.prog i')];
  const nextB = document.getElementById('next'), backB = document.getElementById('back');
  let cur = 0;
  const KEY = 'duo-apply-draft';
  const rub = n => n.toLocaleString('ru-RU').replace(/ /g, ' ') + ' ₽';
  const plural = n => n % 10 === 1 && n % 100 !== 11 ? 'страница' : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) ? 'страницы' : 'страниц';
  // цены — из src/products/site/pricing.config.ts и src/products/bot/pricing.config.ts проекта DUO
  const PRICE = { design: [1000, 1], appear: [500, 1], texts: [500, 1], buttons: [1000, 0], plates: [1500, 0], trans: [2000, 0], pay: [6000, 0], admin: [8000, 0], seo: [2000, 0] };
  const BOT_BASE = 10000;

  function calc() {
    const type = form.type.value, n = +form.pages.value, opts = [...form.querySelectorAll('[name=opt]:checked')].map(i => i.value);
    const site = type === 'Сайт' || type === 'Сайт и бот';
    form.querySelector('.site-only').style.display = site ? '' : 'none';
    let sum = 10000 + Math.max(0, n - 3) * 3000;
    opts.forEach(o => { if (PRICE[o]) sum += PRICE[o][0] * (PRICE[o][1] ? n : 1); });
    if (opts.includes('urgent')) sum = Math.round(sum * 1.25);
    document.getElementById('pagesOut').textContent = `${n} ${plural(n)}`;
    const sumEl = document.getElementById('estSum'), note = document.getElementById('estNote');
    if (type === 'Telegram-бот') { sumEl.textContent = 'от ' + rub(BOT_BASE); note.textContent = 'База: меню, ответы на вопросы и заявки в Telegram. Функции сверх базы — по прайсу, сервер для бота оплачивается отдельно.'; }
    else if (type === 'Пока не знаю') { sumEl.textContent = 'подскажем'; note.textContent = 'Расскажите о бизнесе, и мы предложим, что подойдёт.'; }
    else { sumEl.textContent = 'от ' + rub(sum); note.textContent = (type === 'Сайт и бот' ? `Бот — отдельно, от ${rub(BOT_BASE)}. ` : '') + (opts.includes('support') ? 'Поддержка 1 500 ₽ в месяц. ' : '') + 'Домен и хостинг оплачиваются отдельно.'; }
    return { sum: site ? sum : null, opts };
  }
  form.addEventListener('click', e => {
    const b = e.target.closest('[data-pages]'); if (!b) return;
    form.pages.value = Math.min(20, Math.max(1, +form.pages.value + +b.dataset.pages)); calc(); save();
  });
  form.addEventListener('change', e => {
    const box = e.target.closest('[data-max]');
    if (box && e.target.checked && box.querySelectorAll('input:checked').length > +box.dataset.max) e.target.checked = false;
    e.target.closest('.f')?.classList.remove('bad'); e.target.classList?.remove('bad');
    calc(); save();
  });
  form.addEventListener('input', e => { e.target.removeAttribute('aria-invalid'); e.target.classList.remove('bad'); e.target.closest('.f')?.classList.remove('bad'); save(); });

  // черновик в браузере посетителя
  function save() { try { const d = {}; new FormData(form).forEach((v, k) => { (d[k] ||= []).push(v); }); localStorage.setItem(KEY, JSON.stringify({ d, cur })); } catch (_) {} }
  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || 'null'); if (!raw) return;
      form.querySelectorAll('input,textarea').forEach(el => {
        const v = raw.d[el.name]; if (!v) { if (el.type === 'checkbox') el.checked = false; return; }
        if (el.type === 'checkbox' || el.type === 'radio') el.checked = v.includes(el.value); else el.value = v[0];
      });
      cur = Math.min(raw.cur || 0, 5);
    } catch (_) {}
  }

  function valid(step) {
    let ok = true;
    step.querySelectorAll('[required]').forEach(el => {
      let good = el.value.trim().length > 0;
      if (el.type === 'email') good = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim());
      if (el.type === 'tel') good = el.value.replace(/\D/g, '').length >= 10;
      el.setAttribute('aria-invalid', String(!good));
      if (!good) { ok = false; el.classList.add('bad'); el.closest('.f')?.classList.add('bad'); }
    });
    step.querySelectorAll('[data-need]').forEach(f => { if (!f.querySelector('input:checked')) { ok = false; f.classList.add('bad'); } });
    if (!ok) step.querySelector('.bad .inp, .bad input')?.focus();
    return ok;
  }
  let ready = false;
  function show(i) {
    cur = i; const done = i === 6;
    steps.forEach((s, k) => s.classList.toggle('on', k === i));
    bars.forEach((b, k) => b.classList.toggle('fill', k < i || done));
    document.getElementById('hint').style.visibility = done ? 'hidden' : '';
    document.getElementById('applyTitle').firstChild.textContent = done ? 'Готово' : 'Заявка · ';
    document.getElementById('stepNo').textContent = done ? '' : `${i + 1} из 6`;
    backB.style.visibility = i === 0 || done ? 'hidden' : 'visible';
    nextB.firstChild.textContent = done ? 'На главную ' : i === 5 ? 'Отправить ' : 'Дальше ';
    nextB.querySelector('svg').style.display = done ? 'none' : '';
    if (!done) save();
    // при смене шага — к началу формы и фокус на заголовок шага
    if (ready) { form.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' }); steps[i].querySelector('h3')?.focus({ preventScroll: true }); }
  }
  // заявка уходит на сервер бота DUO, оттуда — менеджерам в рабочий чат Telegram
  const API = 'https://77-110-111-44.sslip.io/api/site-form';
  const errBox = document.getElementById('sendErr');
  async function send() {
    const d = {}; new FormData(form).forEach((v, k) => { d[k] = d[k] ? [].concat(d[k], v) : v; });
    const { sum } = calc();
    const res = await fetch(API, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...d, page: location.href }) });
    const out = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(out.error || 'Заявка не отправилась');
    const card = document.getElementById('doneCard'), b = document.createElement('b');
    b.textContent = d.biz || ''; card.replaceChildren(b, ` · ${d.type}${sum ? ' · от ' + rub(sum) : ''}`, document.createElement('br'),
      `${d.name}, ${d.phone}`, document.createElement('br'), `${d.email} · связь: ${d.contact}`);
    try { localStorage.removeItem(KEY); } catch (_) {}
  }
  let sending = false;
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (sending) return;
    if (cur === 6) { location.href = form.dataset.home || '../'; return; }
    if (!valid(steps[cur])) return;
    if (cur < 5) return show(cur + 1);
    sending = true; nextB.disabled = true; nextB.firstChild.textContent = 'Отправляем… '; errBox.classList.remove('on');
    try { await send(); show(6); }
    catch (err) {
      errBox.replaceChildren(`${err instanceof TypeError ? 'Нет связи с сервером' : err.message}. Попробуйте ещё раз или напишите нам в `, Object.assign(document.createElement('a'), { href: 'https://t.me/duodevops_bot?startapp', target: '_blank', rel: 'noopener', textContent: 'приложении DUO в Telegram' }), '.');
      errBox.classList.add('on'); nextB.firstChild.textContent = 'Отправить ';
    }
    finally { sending = false; nextB.disabled = false; }
  });
  backB.addEventListener('click', () => cur > 0 && show(cur - 1));

  // ?type=bot / ?type=site — пришли со страницы услуги: сразу выбран нужный проект
  load();
  const TYPES = { site: 'Сайт', bot: 'Telegram-бот', both: 'Сайт и бот' };
  const want = TYPES[new URLSearchParams(location.search).get('type')];
  if (want) { const r = form.querySelector(`[name=type][value="${want}"]`); if (r) { r.checked = true; cur = 0; } }
  form.date.min = new Date().toISOString().slice(0, 10);
  calc(); show(cur); ready = true;
})();
