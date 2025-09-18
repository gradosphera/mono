import { date } from 'quasar';

/**
 * Форматирует значение даты/времени в читаемый формат DD.MM.YYYY HH:mm
 * Поддерживает различные типы входных данных
 *
 * @param dateValue - значение даты (string, Date, unknown)
 * @returns отформатированная строка даты или сообщение об ошибке
 */
export function formatDateToHumanDateTime(dateValue: unknown): string {
  try {
    let dateObj: Date;

    if (typeof dateValue === 'string') {
      dateObj = new Date(dateValue);
    } else if (dateValue instanceof Date) {
      dateObj = dateValue;
    } else {
      return String(dateValue || 'Неверная дата');
    }

    return date.formatDate(dateObj, 'DD.MM.YYYY HH:mm');
  } catch {
    return String(dateValue || 'Неверная дата');
  }
}
