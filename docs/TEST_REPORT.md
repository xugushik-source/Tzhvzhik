# Проверки размещённого цикла

15.10.2026. `node tests/hosted.mjs`: 43 проверки, настоящий SQLite за адаптером D1, Request/Response API. Проверены верхний вес, шаги/округление, Россия +15%, замороженный курс, запрет раннего чека/веса/забора, версия предложения, неочищаемый при ошибке чек, приватность, роли, самовывоз, курьер, наличные и гонка резерва. Без живых денег.

`node tests/meal.mjs`: 86 проверок шести сценариев, числа гостей, детских порций, округления, целых штук, наличия и смены винного совета при остром соусе. `node tests/telegram.mjs`: 10 проверок webhook secret, личного чата, одноразового role invite, запрета replay и утечки токена. Внешний Telegram транспорт замокан; сообщений тесты не отправляют.

Build Vinext проходит; синтаксис клиентских скриптов проверен. Ранее локальная Python версия прошла 74 серверные и 34 клиентские проверки; эти числа не выдаются за тесты нового Worker. Browser E2E/визуальная проверка страницы не выполнены: разрешённый control-browser отсутствует.

Размещённые API и состояние webhook проверяются после публикации. Все созданные для этой проверки заказы должны иметь DEMO-данные; их наличие не означает настоящую покупку.

`node tests/client-hosted.mjs`: 21 интеграционная проверка скриптов в DOM stub: 3 языка, фото, допродажи без дублей, сборка на 6 и запрет добавления алкоголя. Всего 160 новых проверок перед публикацией.

После публикации пройдены 18 проверок живого HTTPS API: D1/R2 доступны, каталог10, запрет публичного кабинета/чека, заявка/повтор, звонок, фактические1987г, принятие, загрузка синтетического PNG и byte-match приватной копии, owner review, самовывоз. Telegram getMe и setWebhook успешны. Реальных сообщений без Start не отправлялось; реальных денег/доставок нет.

## Photo correction v4 · 15.10.2026
- Viewed all 9 selected photographs; recorded product fit, author, source and license in PHOTO_AUDIT.md and public/photo-credits.html.
- Rejected cooked grill for cutlets/lyulya/vegetables, chicken thighs for fillet, beef ribs for lamb, focaccia for lavash and tomato sauce for tkemali.
- Exact raw chopped cutlet photo is still missing: explicit neutral placeholder, never a burger/cooked substitute.
- node --check: atelier.js and meal-ui.js passed.
- 21 hosted DOM-stub client checks passed; 86 pure meal-planner checks passed.
- Asset reference audit: all 10 SKU paths exist, 9 distinct photos and 1 placeholder. Root local image/script/stylesheet links resolve.
- Browser E2E/viewport screenshots not performed: control-browser is unavailable. Visual review covered source images, not final browser rendering. Same studio/photo-shoot style is NOT claimed.

## Block art direction v5 · 15.10.2026
- Rechecked each block's role, catalogue framing, all six set compositions, process, FAQ, product drawers and additions. Reference box photograph was inspected locally only and is not part of the repository/publication.
- 21 client integration checks and 86 meal-planner checks passed.
- 26 additional DOM-stub/source checks passed: six ingredient cards and quantities in all three languages, no single background photo per set, no-pork photo replacement, family/scenario photo refresh, no FAQ image, process asset, no old selection image, 10 SKU asset paths.
- Syntax checks passed for atelier.js and meal-ui.js. The new meal preview uses current planned line IDs, so selecting no-pork does not retain a pork image.
- No new backend/payment behavior. No real orders/messages/payments sent.
- Source photographs and reference composition were visually inspected; final browser viewport/rendering could not be inspected because control-browser is unavailable. DOM stubs do not establish browser visual QA.

## Premium presentation v6 · 15.10.2026
21 client DOM-stub integration checks and 86 meal-planner checks passed. Updated the former set-photo assertion to verify the set action: set mosaics were deliberately removed.
17 additional design/control assertions passed: all 3 languages render 6 scenarios without images, counters have explicit controls, +/- clamps to adult 1–20 and children 0–10, composition has no contact-sheet images, premium stylesheet exists.
Contrast arithmetic checked for primary/hover buttons, inputs and muted text; all four pairs exceed 4.5:1. This checks specified colours, not a browser accessibility audit. Raw source photo files were not edited.
Native published screenshot inspected but captures intro only. No full viewport/cart browser interaction is claimed; control-browser remains unavailable.

## User-selected photographs v7
Both uploaded originals visually inspected. File copies preserve original bytes; cooked cutlet image is not published. atelier.js syntax and 21 hosted client integration checks passed. No changes to order/payment behavior. Browser viewport verification remains unavailable.

## Decorative arrows v8
meal-ui.js syntax and 21 client DOM-stub checks passed. Unicode diagonal arrow scan is empty in storefront and public client scripts. Action handlers and accessible text retained. No backend/payment behavior changed; browser visual QA not claimed.

## Bidirectional upsell and basket clearing v9
- `node tests/pairing.mjs`: 57 checks, all ten SKU entry points, meat↔bread/sauce/vegetables, wine↔meat, guest quantities, no duplicates, active/stock/max weight/price guards, no sale of reference wine or cheese.
- `node tests/client-hosted.mjs`: 35 checks total (former 21 included), covers adding chicken from white wine, stale second click, guide cheese→white, RU/KA/HY clearing control, clear→undo, preserving saved order.
- `node tests/meal.mjs`: 86 existing portion/preset checks pass. 178 checks total across these 3 suites.
- Syntax checks for new UI and engine pass. No external messages, orders or payments sent by tests. Backend transition rules are unchanged.
- Manual user action clears basket only. It does not cancel/remove saved orders, pending intents or request recovery. Undo is session-memory only and refuses to overwrite a new nonempty basket.
- Browser E2E/visual verification unavailable; DOM stubs are not browser verification.

## Orderable DEMO catalogue v10 · 15.10.2026
56 backend checks passed using real SQLite D1 adapter. New checks cover legacy catalogue migration twice, preservation of owner-edited price/reserved inventory and saved orders, 18-product DEMO catalogue, a wine+cheese+meat quote, whole bottle units, no early payment, three-line weighing/counting, acceptance, synthetic PNG, manual verification and pickup. Health retains real_payments=false and real_alcohol_sales=false; alcohol=DEMO_ONLY.
16 Telegram checks passed with mocked fetch. Mixed order completes its input through /count for bottle/pack and /weigh for meat; wrong units and fractional counts rejected. Found and corrected too-short idempotency keys for small update IDs while extending the command path. No real Telegram calls made.
84 pairing checks, 90 meal-planner checks and 44 hosted DOM-stub integration checks passed. Covers orderable DEMO wine/cheese, reciprocal cheese→sweet wine, fixed one-bottle optional default, explicit optional set components and totals, empty/undo basket preservation. Total290; intermediate suite messages do not add to this total.
Source files inspected/checked for syntax and asset references. New product imagery is explicitly a typographic placeholder, not generated or licensed photography. Browser visual/E2E remains unavailable without control-browser. No real payment, delivery or external messages were performed by tests.
