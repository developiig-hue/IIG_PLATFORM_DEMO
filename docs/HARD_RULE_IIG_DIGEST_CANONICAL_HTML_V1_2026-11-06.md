# IIG DIGEST — HARD RULE: CANONICAL HTML ARTIFACT v1.0
**Дата:** 2026-11-06  
**Владелец процесса:** IIG / ADMIN_1  
**Статус:** утверждённый архитектурный протокол; внедрение на Mirohost — отдельный этап, не заявлено завершённым.  
**Область:** Robot #6, ADMIN_2 Digest Builder, ADMIN_1 Approval, PDF / CURRENT.

## HR-01. Единственная последовательность
1. **НОВЕ АВТОФОРМУВАННЯ** — первоначальный server-side packing (сбрасывает ручные изменения только при явном запуске).
2. **SAVE WORKING COVER** — ADMIN_2 фиксирует текущую фотографию и текст Page 1 физически на сервере; никакого отдельного approval ADMIN_1 для титулки.
3. **РЕДАГУВАТИ ДАЙДЖЕСТ** — ADMIN_2 редактирует рабочий snapshot страниц 2–3 и дополнительных 4–N, включая Marketplace; ↑/↓/⇄/× меняют данные выпуска, не источники NEWS/ADVICE/MARKET.
4. **ЗІБРАТИ ДАЙДЖЕСТ** (зелёная кнопка) — **единственное** место сборки полного выпуска. Backend читает текущие зафиксированные Working Cover и edited snapshot, валидирует, создаёт **физический HTML-файл** выпуска и замороженный комплект его ресурсов/manifest. Возвращает issue, revision, file URL и SHA-256 content+assets.
5. **ФІНАЛЬНИЙ ПЕРЕГЛЯД** — **только** открывает сохранённый HTML. Не пересобирает страницы, не читает DOM редактора, не заменяет обложку. ADMIN_2 и ADMIN_1 получают одни и те же HTML bytes и ресурсы под аутентификацией.
6. **ПЕРЕДАТИ ADMIN_1 → ПОГОДИТИ ДАЙДЖЕСТ** — ADMIN_1 изучает тот же HTML и утверждает именно его revision/hash. Содержимое после передачи неизменно; статус согласования хранится отдельно от HTML.
7. **СФОРМУВАТИ PDF → ПУБЛІКАЦІЯ** — кнопка PDF активируется у ADMIN_2 после APPROVED. Сервер печатает PDF **из того же HTML** с закреплёнными ресурсами и print CSS; не пересобирает и не обновляет контент. QA проверяет формат, активные ссылки, визуальное соответствие и хэш утверждённого источника. Только QA-passed PDF публикуется как CURRENT; рассылка — отдельное человеческое разрешение.

## HR-01A. AUTOFORM НЕ СОЗДАЁТ И НЕ ПОДМЕНЯЕТ PAGE 1 (утверждено 2026-11-07)
1. Зелёная кнопка **«НОВЕ АВТОФОРМУВАННЯ»** автоматически подбирает и записывает **только страницы 2–N**: NEWS, Finance/Regulation/Advice и иные включённые источники. Она **не создаёт, не записывает, не перерисовывает и не подставляет** шаблонную титулку Page 1 в текущую редакцию.
2. Cover Studio / **SAVE WORKING COVER** — единственный путь для фиксации Page 1 (физическое изображение и все текстовые поля) в `cover-working.json` и revision-local image. AUTOFORM не меняет `cover-working.json`, не меняет `cover-meta.json`, не удаляет `cover-working-image.*`, не устанавливает `cover-candidate.png` или MASTER fallback. Исходный шаблон разрешён только как пустой визуальный ориентир в редакторе до SAVE, но не как источник данных и не как часть Built HTML.
3. После AUTOFORM статус обложки отображается отдельно: сохранённая Working Cover — актуальная либо **«ОБКЛАДИНКУ НЕ ЗБЕРЕЖЕНО»**. Автоматическое заполнение страниц не должно объявлять Page 1 готовой.
4. Новый HTML BUILD выполняется только после фактического сохранения обложки и последнего редакторского snapshot ADMIN_2; отсутствие физически сохранённой картинки возвращает `DIGEST_WORKING_COVER_IMAGE_MISSING` и не обновляет Built revision.
5. Важно: запрет шаблонной титулки в Autoform **не заменяет исправление SAVE**. Если после SAVE `cover-working.json.saved_at` не меняется и `background_filename` пуст, устранить дефект frontend→backend отдельно. Нельзя объявлять `COVER_GREEN` по визуальному preview или уведомлению UI.
6. Проверка: (A) Autoform обновляет Page 2–N и сохраняет Cover JSON+asset без изменений; (B) SAVE Working Cover создаёт новый файл/время; (C) BUILD показывает её; (D) повторный Autoform не меняет сохранённую Cover, но явно сбрасывает ручные изменения Page 2–N только по утверждённому правилу Autoform.

## HR-02. Физический артефакт и путь
Целевая структура на Mirohost (должна быть внедрена, не является утверждением о существующем каталоге):
```text
/var/www/iigeur/iig-data/digest/
  cover/cover-working.json
  workflow/workflow-v39.json
  revisions/YYYY-MM/rNNNN/
    digest.html
    assets/cover.<png|jpg|webp>
    assets/... (только необходимые локальные ресурсы)
    manifest.json
  release/current.pdf
  release/current.json
```
Сервер создаёт HTML и ресурсы в staging, валидирует, затем атомарно фиксирует новую уникальную revision. Имя файла/путь неизменны после BUILD. CSS для фиксированного макета может быть встроен в digest.html; фото/шрифты/другие зависимости обязаны иметь неизменяемые revision-local копии или проверенные хэши. Не допускаются mutable URL, generic /cover/image и зависимость от legacy MASTER для готовой редакции.

HTML и assets до публикации **не** выкладываются в общедоступный web-root: просмотр через защищённый ADMIN endpoint, с проверкой серверной сессии и роли. Разрешённый URL должен вести только на версию, зафиксированную сервером, без произвольного выбора пути. Контент очищается от опасного HTML/JS.

## HR-03. Единственный визуальный эталон
Структурированный JSON остаётся рабочим источником редактирования и provenance, но только созданный Constructor immutable digest.html является визуальным артефактом Preview/Approval/PDF. Никакой отдельный renderer/iframe/legacy preview не имеет права создавать альтернативный макет. У HTML один хэш ресурсо-зависимого артефакта (HTML + manifest assets), связанный с issue/revision.

## HR-03A. Синяя кнопка просмотра = читатель готового HTML (дополнение от 2026-11-06)
**HARD RULE PREVIEW SINGLE-SOURCE / BLUE BUTTON PRIORITY.**

1. После успешного **«ЗІБРАТИ ДАЙДЖЕСТ»** синяя кнопка **«ПЕРЕГЛЯНУТИ / РОБОЧИЙ ПЕРЕГЛЯД»** и кнопка **«ФІНАЛЬНИЙ ПЕРЕГЛЯД»** обязаны читать **одну и ту же физическую revision** `digest.html` (с теми же `assets/` и `manifest.json`) по одному защищённому серверному маршруту. Приоритет immutable HTML абсолютный: запрещено вместо него открывать предыдущий iframe, DOM-вёрстку, старую «временную сборку», legacy MASTER, cached auto-fill, cover-candidate или иной renderer.
2. Синяя кнопка **не инициирует BUILD**, не вызывает `composeFinalBundle()`, `autoFillDigest()`, `window.digestPages`, не записывает новый `digest-bundle.json`, не меняет fingerprint, `BUILT`, `PREVIEWED` или approval. Это просто **read-only просмотр** уже существующей актуальной revision.
3. **«ФІНАЛЬНИЙ ПЕРЕГЛЯД»** показывает точно тот же HTML/asset hash и только после успешного осмотра может фиксировать `PREVIEWED`. Никакой повторной компоновки. ADMIN_1 открывает ту же revision, а не копию, заново собранную браузером.
4. Если BUILD ещё ни разу не выполнен, синяя кнопка может показывать лишь явно помеченную **«ЧЕРНЕТКА — НЕ ЗІБРАНО, НЕ ДЛЯ ЗАТВЕРДЖЕННЯ»**; такой просмотр не считается Final Preview, не получает fingerprint и не передаётся ADMIN_1. Допускается вместо черновика предложить выполнить зелёную BUILD.
5. Если после BUILD отредактированы Cover, порядок, ссылки, материалы или дополнительные страницы, прежняя revision считается `DIRTY/STALE`. Синяя и финальная кнопки **не должны без предупреждения показывать старый HTML как новый**. Они блокируют финальный просмотр с сообщением **«ЗМІНИ ПІСЛЯ ЗБІРКИ — натисніть ЗІБРАТИ ДАЙДЖЕСТ»** до создания новой revision. Утверждение старого fingerprint запрещено.
6. Кэширование: URL HTML и его ресурсов несёт уникальную revision/hash, а защищённый endpoint использует `Cache-Control: no-store`. На обоих экранах показывают issue/revision/hash из серверного `manifest.json`.
7. У события каждой кнопки ровно один владелец. Все legacy preview listeners / overlay / iframe / document-level interceptors, способные перехватывать синий или финальный просмотр, должны быть отключены или сделаны полностью read-only без самостоятельной сборки. **Нельзя просто добавить ещё один listener поверх них.**
8. Проверка GREEN: после BUILD открыть синий просмотр, Final Preview ADMIN_2 и просмотр ADMIN_1 — убедиться в одинаковом issue/revision/hash/изображении/порядке/ссылках; затем изменить одну строку и проверить обязательный `STALE` до нового BUILD.

## HR-04. Обязательное содержание
Page 1 = фактически сохранённое изображение и тексты cover-working.json (месяц/год, title, subtitle, slogan, 4 анонса, KPI, 2 CTA).  
Page 2 = одобренные NEWS Ukraine/World/Event из отредактированного snapshot с category/tag/order/individual URL.  
Page 3 = Finance/Regulation и отдельный Advice block из snapshot; без смешивания Advice с NEWS.  
Page 4–N = только явно включённые ADMIN_2 дополнительные материалы: IIG MARKET, IIG ORIGINAL, PARTNER, SPONSORED и связанные страницы. Marketplace не более 12 позиций на страницу; ручной порядок/исключения сохраняются. Никогда не изменять исходные CMS/MARKET записи при удалении из Digest.

## HR-05. Прямые ссылки и бренд
NEWS → individual `article.html?id=<public_slug>`; Advice → individual `advice-article.html?id=<public_slug>`; Finance, Regulation, Partner, Marketplace → **точный** публичный URL соответствующей карточки/материала. CTA: `forms.html#project`, `forms.html#subscribe`. Базовый адрес через `IIG_PUBLIC_BASE_URL`. Запрещены #, общий каталог, случайная ссылка, временный URL и выпуск без проверенных прямых адресов.
MASTER visual, Page 1–3 geometry, переносы, DejaVu Sans, KPI, footer, CTA, русско/украинские тексты, корректная украинская Unicode-типографика и гиперссылки сохраняются по существующим визуальным HARD RULE. HTML-print CSS должен давать точный портретный постраничный PDF с форматированием и без наложений.

## HR-06. Отсутствие обложки = остановка сборки
При BUILD проверять физическое наличие, допустимый тип, размер/доступность выбранной Working Cover Image. **Не** подставлять `cover-candidate.png`, старую электростанцию, MASTER iframe, предыдущий bundle либо иной legacy fallback. При отсутствии — явная ошибка `DIGEST_WORKING_COVER_IMAGE_MISSING`, отсутствие нового HTML, прежняя утверждённая версия не меняется.

## HR-07. Состояния и роли
`WORKING → BUILT → PREVIEWED → PENDING_ADMIN_1 → APPROVED → PDF_READY → RELEASED`.
ADMIN_2: создание, редактирование, BUILD, Final Preview, submit, PDF после approval, publish после QA.  
ADMIN_1: тот же read-only просмотр утверждаемой revision, approve/reject; без повторной сборки.  
После изменения cover/pages/links/order/exclusions построенная revision становится устаревшей: новая сборка с новой revision и новым fingerprint обязательна. Нельзя approve по статусу, если content hash изменился. Один и тот же HTML/hash у обеих ролей.

## HR-08. PDF / публикация
PDF создаётся на сервере из *approved* digest.html с теми же frozen assets, без изменения Page 1, текста, последовательности, списка и URL. Необходимо проверить: визуально Page 1–3+; корректность page breaks; изображения; Unicode; selectable/clickable links; все CTA; отсутствие старой обложки; соответствие approved revision/hash. Ошибка PDF QA блокирует CURRENT. На сайте доступен один актуальный CURRENT PDF: заменяет прежний публичный CURRENT, без создания публичного архива. Закрытый backup/revision audit допустим. Отправка email не инициируется Robot #6 автоматически.

## HR-09. Неприемлемые реализации
Запрещены: создание только DOM preview вместо файла; локальный blob/html, существующий только в браузере; повторная сборка в Final Preview, ADMIN_1 или PDF; mutable cover URL; передача ADMIN_1 иной версии; сборка из старого auto-fill после ручной правки; публикация до APPROVED; незащищённый preview URL; отказ молча без error-code.

## HR-10. Acceptance / GREEN
1. Создан выпуск на новом issue и Cover с новым изображением; SAVE физически закрепляет его.
2. Ручные ↑/↓/⇄/× и новые pages 4–N сохраняются.
3. Одна зелёная BUILD создаёт digest.html, assets и manifest с revision/hash на Mirohost.
4. Перезагрузка браузера и повторное открытие Preview показывают **точно** ту же HTML revision; изображение и ссылки правильные.
5. ADMIN_1 открывает тот же hash, approves; правки после preview требуют новой build/re-approval.
6. Кнопка PDF доступна только после APPROVED; PDF формируется из этой HTML revision, визуально проверен и кликабелен.
7. CURRENT меняется только после PDF QA; 404/500, пустые или подменённые изображения и старые listeners отсутствуют.
8. При ошибке cover/image/links/artifact/hash — fail-closed, никакой тихой подстановки.

## HR-11. Приоритет и внедрение
Этот протокол **заменяет** прежние указания, допускавшие сборку в `FINAL PREVIEW`, разные renderer, legacy-cover fallback или отдельное утверждение титулки ADMIN_1. Он **не отменяет** ранее утверждённый MASTER visual, права/RBAC/MFA, прямые ссылки, правила материалов, Marketplace и отдельный mailing gate.
Фиксация документа в GitHub не равна внедрению кода на Mirohost: требуется отдельный контролируемый patch, тестирование и отметка GREEN в production. Никаких runtime изменений настоящим коммитом не выполняется.
