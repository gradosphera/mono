/**
 * Форматирует дату в строку формата 'YYYY-MM-DDTHH:mm:ss'
 * @param date - Дата для форматирования
 * @returns Строка в формате 'YYYY-MM-DDTHH:mm:ss'
 */
export function formatDateToISOString(date: Date): string {
  return date.toISOString().slice(0, 19);
}
