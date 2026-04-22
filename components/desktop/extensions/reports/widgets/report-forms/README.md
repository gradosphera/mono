# report-forms

Vue-компоненты визуальных форм для превью сгенерированных отчётов в
`ReportPreviewDialog`. Одна форма на один `ReportType`. Каждая форма —
статический компонент с input-props (`xml`, `requisites`, `year`), который
выводит HTML, визуально похожий на типографский бланк ФНС/СФР.

## Статус форм

| ReportType | Компонент | КНД | ВерсФорм |
|---|---|---|---|
| BUHOTCH | `BuhotchForm.vue` | 0710096 | 5.04 |
| DUSN | `DusnForm.vue` | 1152017 | 5.09 |
| NDFL6 | `Ndfl6Form.vue` | 1151100 | 5.05 |
| RSV | `RsvForm.vue` | 1151111 | 5.08 |
| PSV | `PsvForm.vue` | 1151162 | 5.01 |
| UUSN / UV_VZNOSY | `UusnForm.vue` | 1110355 | 5.03 |
| FSS4 (ЕФС-1) | `Efs1Form.vue` | — (форма СФР) | — |

## Архитектура

- **`useReportXml.ts`** — общий композабл: парсит XML через `DOMParser`,
  возвращает `doc` + базовую шапку (ИНН/КПП/наименование/подписант/ОКТМО
  и пр.), helper'ы (`getAttr`, `getNum`, `getByLocal` для namespace-тегов
  ЕФС-1, `padInn`, `formatDate`, `fmt`, `fmtZero`). Заглядывает в
  `requisites` как fallback для полей, которых нет в XML.
- **`_printable-form.scss`** — общий стиль: A4-страницы, Times New Roman,
  рамки 0.5pt, штрихкод-заглушка, ячейки ИНН, таблицы `.data-table`,
  подпись-блок. Каждый SFC подключает через `@use './_printable-form.scss'`
  в scoped-стиле — стиль хэшируется на компонент, конфликтов нет.
- Каждый `XxxForm.vue` — самодостаточный SFC: свой парсер раздела
  (баланс / раздел 1 6-НДФЛ / раздел 2 ЕФС-1 / …) поверх `useReportXml`
  и своя разметка под бланк этого типа.
- `ReportPreviewDialog.vue` (в `pages/DocumentsPage/ui/`) — статичная карта
  `FORM_COMPONENTS` сопоставляет `reportType` с Vue-компонентом.

## Как корректно править форму

1. Открыть бланк в `components/reports-standarts/<форма>/` (TIF/XLS/PDF)
   — там расположение полей «как на бумаге». Следовать ему, чтобы
   бухгалтер мгновенно узнавал форму.
2. Открыть генератор в `components/controller/src/extensions/reports/
   infrastructure/generators/<форма>.generator.ts` — там точная
   XML-структура: теги, атрибуты, иерархия.
3. Добавлять только те данные, которые реально есть в XML. Остальное —
   прочерк «—» (не фабриковать).
4. Стили — через `@use './_printable-form.scss'` + локальные доп.правила.
   Не дублировать общие стили.
5. Для ЕФС-1 теги с namespace-prefix (`ЕФС8:…`) — использовать
   `getByLocal(localName)` / `getElementsByTagNameNS('*', …)`, CSS-селектор
   не умеет по `:`.

## Пропсы форм (контракт)

```ts
defineProps<{
  xml: string                              // сгенерированный XML отчёта
  requisites?: IReportRequisitesView | null // merged-view реквизитов
  year?: number                            // отчётный год (fallback если нет в XML)
}>()
```

## См. также

- `components/reports-standarts/` — бланки, XSD-схемы, приказы ФНС/СФР.
- `components/controller/src/extensions/reports/infrastructure/generators/`
  — генераторы XML для каждой формы.
- `components/controller/tests/fixtures/reports-references/*_romashka.xml`
  — обезличенные эталоны XML для сверки.
