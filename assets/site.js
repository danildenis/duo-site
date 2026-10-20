// duo · общий скрипт всех страниц. Каждая часть включается, только если её блок есть на странице.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // плавная прокрутка колёсиком и тачпадом, как на greymac.com (Lenis, lerp .1). На телефоне — родная прокрутка
  if (!reduce && window.Lenis && matchMedia('(hover:hover) and (pointer:fine)').matches) {
    window.lenis = new Lenis({ lerp: .1, anchors: true, autoRaf: true });
  }

  // знак duo на главной: из-под строки поднимаются du и o, потом сверху падают и отскакивают точки
  const hero = document.querySelector('.hero'), mark = hero && hero.querySelector('.mark');
  if (hero && mark) {
    const playMark = () => {
      const q = c => mark.querySelector(c), soft = 'cubic-bezier(.16,1,.3,1)', fall = 'cubic-bezier(.55,0,1,.45)', up = 'cubic-bezier(0,.55,.45,1)';
      const rise = (el, delay) => el.animate([{ transform: 'translateY(1250px)', opacity: 0 }, { opacity: 1, offset: .35 }, { transform: 'translateY(0)', opacity: 1 }], { delay, duration: 1150, easing: soft, fill: 'both' });
      const drop = (el, delay, h) => el.animate([
        { transform: `translateY(${-h}px) scale(1,1)`, opacity: 0, offset: 0, easing: fall },
        { opacity: 1, offset: .12 },
        { transform: 'translateY(0) scale(1.14,.82)', opacity: 1, offset: .4, easing: 'ease-out' },
        { transform: 'translateY(0) scale(1,1)', offset: .46, easing: up },
        { transform: 'translateY(-210px) scale(.97,1.04)', offset: .62, easing: fall },
        { transform: 'translateY(0) scale(1.07,.92)', offset: .78, easing: 'ease-out' },
        { transform: 'translateY(0) scale(1,1)', offset: .82, easing: up },
        { transform: 'translateY(-58px) scale(1,1)', offset: .9, easing: fall },
        { transform: 'translateY(0) scale(1.02,.98)', offset: .97 },
        { transform: 'translateY(0) scale(1,1)', opacity: 1, offset: 1 }], { delay, duration: 1150, fill: 'both' });
      rise(q('.rDu'), 120); rise(q('.rO'), 260); drop(q('.dL'), 860, 1100); drop(q('.dR'), 1120, 1200);
    };
    let go = false;
    const start = () => { if (go) return; go = true; if (!reduce) playMark(); hero.classList.remove('wait'); document.body.classList.remove('wait'); };
    if (document.readyState === 'complete') requestAnimationFrame(start); else addEventListener('load', () => requestAnimationFrame(start), { once: true });
    setTimeout(start, 1500);
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
  const wideMQ = matchMedia('(min-width:861px)');
  cases.forEach(c => c.insertAdjacentHTML('beforeend', '<i class="dim" aria-hidden="true"></i>'));
  const photo = document.querySelector('.photo img');
  const work = document.querySelector('.work');
  // на компьютере карточки одной высоты и встают под вырезом. На телефоне высота — по содержимому: если карточка
  // выше экрана, она встаёт так, чтобы был виден её низ (иначе скриншот сайта спрятался бы под следующей)
  let stick = [], caseH = [];
  const measure = () => {
    cases.forEach(c => {
      c.style.top = '';
      if (!wideMQ.matches) { const base = parseFloat(getComputedStyle(c).top); c.style.top = Math.min(base, innerHeight - c.offsetHeight - 12) + 'px'; }
    });
    stick = cases.map(c => parseFloat(getComputedStyle(c).top)); caseH = cases.map(c => c.offsetHeight);
  };
  measure();

  // вопросы на главной: таблетки проявляются из размытия по одной, в перемешанном порядке, пока блок закреплён
  const faq = document.querySelector('.faq');
  let pills = [], faqOut = null, faqWin = [];
  if (faq) {
    pills = [...faq.querySelectorAll('.pill')]; faqOut = faq.querySelector('.faq-a');
    const src = [...faq.querySelectorAll('.faq-src > div')], hint = faqOut.innerHTML;
    pills.forEach(b => b.dataset.i && b.addEventListener('click', () => {
      const on = b.getAttribute('aria-expanded') !== 'true';
      pills.forEach(o => o.dataset.i && o.setAttribute('aria-expanded', 'false'));
      if (on) b.setAttribute('aria-expanded', 'true');
      faqOut.innerHTML = on ? `<div class="ans">${src[b.dataset.i].innerHTML}</div>` : hint;
    }));
    if (!reduce) {
      faq.classList.add('scrub');
      // порядок появления: перемешан, но одинаковый при каждом заходе; «свой вопрос» — последним
      const n = pills.length - 1, order = [...Array(n).keys()].sort((a, b) => ((a * 7 + 3) % n) - ((b * 7 + 3) % n));
      faqWin = pills.map((_, i) => (i < n ? order.indexOf(i) : n) / n * .5);
      faqOut.style.opacity = 0;
      // пришли по ссылке «Вопросы» с другой страницы: браузер встал в начало блока ещё до закрепления — встаём туда, где все таблетки видны
      if (location.hash === '#faq') requestAnimationFrame(() => {
        const a = document.getElementById('faq');
        window.lenis ? lenis.scrollTo(a, { immediate: true, force: true }) : scrollTo(0, a.getBoundingClientRect().top + scrollY);
      });
    }
  }

  // что сейчас на экране: считаем только видимое
  const live = new Set();
  const liveIO = new IntersectionObserver(es => { es.forEach(e => e.isIntersecting ? live.add(e.target) : live.delete(e.target)); if (!reduce) onScroll(); }, { rootMargin: '20% 0px' });
  [rv, work, photo && photo.parentElement, faq].forEach(el => el && liveIO.observe(el));
  let lastP = -1;

  let ticking = false, lastK = -1, heroHidden = false;
  function frame() {
    ticking = false;
    const H = innerHeight, y = scrollY;
    if (rv && live.has(rv)) {
      const r = rv.getBoundingClientRect(), p = Math.min(1, Math.max(0, (H * .82 - r.top) / (r.height + H * .35)));
      const k = Math.round(p * words.length);
      if (k !== lastK) { words.forEach((w, i) => w.classList.toggle('on', i < k)); lastK = k; }
    }
    if (cases.length > 1 && live.has(work)) {
      const tops = cases.map(c => c.getBoundingClientRect().top);
      for (let i = 0; i < cases.length - 1; i++) {
        const q = Math.min(1, Math.max(0, 1 - (tops[i + 1] - stick[i + 1]) / caseH[i]));
        cases[i].style.transform = `scale(${(1 - q * .06).toFixed(4)})`; cases[i].lastElementChild.style.opacity = (q * .55).toFixed(3);
      }
    }
    if (faqWin.length && live.has(faq)) {
      const r = faq.getBoundingClientRect(), p = Math.min(1, Math.max(0, -r.top / (r.height - H)));
      if (Math.abs(p - lastP) > .002) {
        lastP = p;
        pills.forEach((el, i) => {
          const o = Math.min(1, Math.max(0, (p - faqWin[i]) / .13));
          // сначала проступает размытая копия, потом её сменяет чёткая таблетка
          el.style.opacity = Math.min(1, o / .35).toFixed(3);
          const sharp = Math.min(1, Math.max(0, (o - .4) / .6)), soft = 1 - Math.min(1, Math.max(0, (o - .6) / .4));
          el.firstChild.style.opacity = (sharp * sharp * (3 - 2 * sharp)).toFixed(3);
          el.lastChild.style.opacity = soft.toFixed(3); el.lastChild.style.visibility = o >= 1 ? 'hidden' : '';
        });
        faqOut.style.opacity = Math.min(1, Math.max(0, (p - .56) / .08)).toFixed(3);
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
  if (!reduce) { addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', () => { measure(); onScroll(); }); addEventListener('load', measure, { once: true }); frame(); }
  else words.forEach(w => w.classList.add('on'));

  // видео кейсов: играют, только пока видны; при «меньше движения» остаётся картинка
  if (!reduce) {
    const vio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting && e.target.offsetParent) e.target.play().catch(() => {}); else e.target.pause(); }), { threshold: .25 });
    document.querySelectorAll('video[data-play]').forEach(el => vio.observe(el));
  }

  // кейс: переключатель «Компьютер / Телефон» — видно одно видео, второе на паузе
  document.querySelectorAll('.viewer').forEach(vw => {
    const set = v => {
      vw.dataset.view = v;
      vw.querySelectorAll('[data-v]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === v)));
      vw.querySelectorAll('video').forEach(el => {
        const on = el.closest(v === 'phone' ? '.phone' : '.shot');
        if (on && !reduce) { el.currentTime = 0; el.play().catch(() => {}); } else el.pause();
      });
    };
    vw.querySelectorAll('[data-v]').forEach(b => b.addEventListener('click', () => set(b.dataset.v)));
    if (matchMedia('(max-width:600px)').matches) set('phone');
  });

  // вопросы: открыт только один (для браузеров без <details name>)
  document.querySelectorAll('details[name]').forEach(d => d.addEventListener('toggle', () => {
    if (d.open) document.querySelectorAll(`details[name="${d.getAttribute('name')}"]`).forEach(o => { if (o !== d) o.open = false; });
  }));

  // заголовки и плашки появляются снизу
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -12% 0px' });
  document.querySelectorAll('.up').forEach(el => io.observe(el));

  // ── бесплатный разбор сайта (/razbor/): ссылка и контакт → сервер бота → чат менеджеров ──
  const audit = document.getElementById('auditForm');
  if (audit) {
    const box = document.getElementById('audit'), err = document.getElementById('auditErr'), btn = audit.querySelector('button[type=submit]');
    audit.addEventListener('input', e => { e.target.classList.remove('bad'); e.target.closest('.f')?.classList.remove('bad'); });
    audit.addEventListener('change', e => e.target.closest('.f')?.classList.remove('bad'));
    audit.addEventListener('submit', async e => {
      e.preventDefault();
      let ok = true;
      audit.querySelectorAll('[required]').forEach(el => { if (!el.value.trim()) { ok = false; el.classList.add('bad'); el.closest('.f')?.classList.add('bad'); } });
      const c = audit.querySelector('[data-need]'); if (!c.querySelector('input:checked')) { ok = false; c.classList.add('bad'); }
      if (!ok) return audit.querySelector('.bad .inp, .bad input')?.focus();
      const d = Object.fromEntries(new FormData(audit));
      btn.disabled = true; err.classList.remove('on');
      try {
        const res = await fetch('https://77-110-111-44.sslip.io/api/site-audit', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(d) });
        const out = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(out.error || 'Заявка не отправилась');
        box.classList.add('sent');
      } catch (x) {
        err.textContent = `${x instanceof TypeError ? 'Нет связи с сервером' : x.message}. Попробуйте ещё раз или напишите нам в Telegram.`;
        err.classList.add('on');
      } finally { btn.disabled = false; }
    });
  }

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
