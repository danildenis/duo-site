# duo — сайт студии

Многостраничный статический сайт: https://danildenis.github.io/duo-site/ (GitHub Pages, ветка main).

- Страницы собираются скриптом: `node tools/build.mjs` — шапка, подвал, тексты и цены в `tools/build.mjs`, форма заявки — `tools/parts/form.html`.
- Общие стили и скрипт — `assets/site.css`, `assets/site.js`. Версия в адресе файлов меняется сама при сборке.
- Цены — копия прайса DUO (`src/products/site/pricing.config.ts`, `src/products/bot/pricing.config.ts`): при смене прайса поправить `tools/build.mjs` и `PRICE` в `assets/site.js`.
- Заявка уходит на сервер бота: `POST https://77-110-111-44.sslip.io/api/site-form` (обработчик `src/web/site-form.ts` в проекте DUO), оттуда — менеджерам в чат заявок.
- Обложка для ссылок — `img/og.jpg`, рисуется из `tools/og.html` (снимок 1200×630).
- Демо-сайты `demo/*` — копии из репозитория duo-portfolio, бренды вымышлены, закрыты от поиска.
- Локальный просмотр — конфигурация `duo-site` в `.claude/launch.json` проекта DUO (порт 5197).
- Бесплатный разбор сайта — `razbor/`, форма шлёт `POST /api/site-audit` на сервер бота.
- Видео кейсов — `media/cases/<slug>.mp4` и `<slug>-m.mp4`, записываются `tools/record_cases.py` (команда в начале файла; для «Вкусного компромисса» нужен его локальный просмотр, `VKUSNY_URL`).
