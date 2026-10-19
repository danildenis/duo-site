# duo — сайт студии

Многостраничный статический сайт: https://danildenis.github.io/duo-site/ (GitHub Pages, ветка main).

- Страницы собираются скриптом: `node tools/build.mjs` — шапка, подвал, тексты и цены в `tools/build.mjs`, форма заявки — `tools/parts/form.html`.
- Общие стили и скрипт — `assets/site.css`, `assets/site.js`. Версия в адресе файлов меняется сама при сборке.
- Цены — копия прайса DUO (`src/products/site/pricing.config.ts`, `src/products/bot/pricing.config.ts`): при смене прайса поправить `tools/build.mjs` и `PRICE` в `assets/site.js`.
- Отправка заявки не подключена (`send()` в `assets/site.js`).
- Локальный просмотр — конфигурация `duo-site` в `.claude/launch.json` проекта DUO (порт 5197).
