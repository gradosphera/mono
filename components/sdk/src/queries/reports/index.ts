/** Список доступных типов отчётов MVP c мета по последней генерации и готовности реквизитов */
export * as GetAvailableReports from './getAvailableReports'

/** Получить сгенерированный отчёт по UUID (полный XML) */
export * as GetReport from './getReport'

/** История сгенерированных отчётов (постраничная, без XML) */
export * as GetReportHistory from './getReportHistory'

/** Объединённый вид реквизитов кооператива (ончейн + ручные) с источником каждого поля */
export * as GetReportRequisites from './getReportRequisites'

/** Проверить готовность реквизитов для генерации конкретной формы */
export * as CheckReportReadiness from './checkReportReadiness'

/** Скачать XSD-схему ФНС/СФР для типа отчёта (utf-8) */
export * as DownloadReportXsd from './downloadReportXsd'

/** Скачать PDF-бланк пустой печатной формы (base64) */
export * as DownloadReportBlankPdf from './downloadReportBlankPdf'
