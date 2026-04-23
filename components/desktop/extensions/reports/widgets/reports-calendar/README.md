# reports-calendar

Виджет-матрица «форма × месяцы» для страницы отчётности — аналог
календаря сдачи в Контур.Экстерн / СБИС.

- Строки — 5 форм MVP (БУХОТЧ, 6-НДФЛ, РСВ, ПСВ, ЕФС-1).
- Столбцы — 12 месяцев выбранного года.
- Каждая ячейка в месяце сдачи формы подсвечена цветом по статусу:
  * 🟢 `submitted` — сгенерирован валидный XML (есть в архиве).
  * 🟡 `draft` — есть черновик (`ReportDraft`), но не сдан.
  * 🔴 `overdue` — срок прошёл, не сдано.
  * ⚪ `empty` — ячейка-заглушка на будущий период.

Клик по активной ячейке открывает `ReportEditorDialog` для (reportType,
year, period) этой ячейки.

## Источник данных

- Backend: резолвер `getReportCalendar(year): [ReportCalendarRow]` в
  `controller/src/extensions/reports/application/resolvers/
  report-calendar.resolver.ts`.
- Реестр дат сдачи: `controller/src/extensions/reports/domain/services/
  reports-calendar-registry.ts` — хардкод сроков на основе НК РФ (ст.230
  для 6-НДФЛ, ст.431 для РСВ/ПСВ, ст.18 402-ФЗ для БУХОТЧ) и приказа
  СФР №1462 от 17.11.2025 для ЕФС-1.
- Статусы считаются по `GeneratedReportEntity` (архив) и
  `ReportDraftEntity` (черновик).

## Файлы

- `ReportsCalendar.vue` — матрица + управление годом + загрузка через
  `reportStore.loadCalendar(year)`.
- `CalendarCell.vue` — одна ячейка месяца (статус/иконка/тултип).

## Ограничения / TODO

- Переносы сроков на выходные ещё не учтены: если 25-е — суббота, календарь
  покажет 25-е, а надо — ближайший рабочий день. Регламентно срок формально
  продлевается, но для UI лучше показать реальный рабочий день. Добавить
  `addBusinessDays` в `reports-calendar-registry.ts`.
- Overdue-статус проверяется только через `dueDate < today`. Если пользователь
  сдал отчёт «с опозданием», архив покажет `submitted` (правильно), но до того
  он будет overdue — это ожидаемо.
