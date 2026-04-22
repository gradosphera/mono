# report-forms

Vue-компоненты визуальных форм для превью сгенерированных отчётов в
`ReportPreviewDialog`. Одна форма на один `ReportType`. Каждая форма —
статический компонент с input-props (`xml`, `requisites`, `year`), который
выводит HTML, визуально похожий на типографский бланк ФНС/СФР.

## Статус форм

| ReportType | Компонент | КНД | ВерсФорм | Статус |
|---|---|---|---|---|
| BUHOTCH | `BuhotchForm.vue` | 0710096 | 5.04 | ✅ свёрстано (титул + баланс) |
| DUSN | `DusnForm.vue` | 1152017 | 5.09 | 🚧 stub |
| NDFL6 | `Ndfl6Form.vue` | 1151100 | 5.05 | 🚧 stub |
| RSV | `RsvForm.vue` | 1151111 | 5.08 | 🚧 stub |
| PSV | `PsvForm.vue` | 1151162 | 5.01 | 🚧 stub |
| UUSN / UV_VZNOSY | `UusnForm.vue` | 1110355 | 5.03 | 🚧 stub |
| FSS4 (ЕФС-1) | `Efs1Form.vue` | — (форма СФР) | — | 🚧 stub |

## Архитектура

- `FormStub.vue` — базовый компонент-заглушка. Общая разметка шапки
  (штрихкод, ИНН/КПП, ОКВЭД/ОКПО/ОКТМО), блок «в разработке», раскрываемый
  XML. Принимает `title`, `knd`, `versForm`, `period` — заглушки для всех
  кроме `BuhotchForm` делегируют ему рендер.
- `BuhotchForm.vue` — reference-имплементация свёрстанной формы. 2 листа
  (титул + бухгалтерский баланс). Парсит XML через `DOMParser` и берёт шапку
  из `requisites` как fallback. Шаблон стилей можно копировать в остальные
  формы при переводе stub → full.
- `ReportPreviewDialog.vue` (в `pages/DocumentsPage/ui/`) — статичная карта
  `FORM_COMPONENTS` сопоставляет `reportType` с Vue-компонентом.

## Как перевести stub → полноценную форму

1. Взять `BuhotchForm.vue` как образец стилей и логики парсинга XML.
2. Открыть бланк из `components/reports-standarts/<форма>/` (TIF/XLS) —
   это расположение полей «как на бумаге», следовать ему.
3. Посмотреть генератор в `components/controller/src/extensions/reports/
   infrastructure/generators/<форма>.generator.ts` — он показывает точную
   XML-структуру: какие теги, какие атрибуты, иерархия.
4. Перенести template stub'а в собственную разметку (убрать `<FormStub>`).
5. Селекторы `doc.querySelector('НПЮЛ')` и т.п. — те же namespace-free
   имена, что в генераторе.
6. Стили — скопировать `.printable-form` + `.page` блок из `BuhotchForm`.
   Это даёт A4-пропорции, Times New Roman, ч/б рамки.

## Пропсы форм (контракт)

```ts
defineProps<{
  xml: string                              // сгенерированный XML отчёта
  requisites?: IReportRequisitesView | null // merged-view реквизитов кооператива
  year?: number                            // отчётный год (fallback если нет в XML)
}>()
```

## См. также

- `components/reports-standarts/` — бланки, XSD-схемы, приказы ФНС/СФР.
- `components/controller/src/extensions/reports/infrastructure/generators/`
  — генераторы XML для каждой формы.
- `components/controller/tests/fixtures/reports-references/*_romashka.xml`
  — обезличенные эталоны XML для сверки.
