/**
 * Форматирует eosio::time_point_sec в удобочитаемый формат даты и времени
 * @param timestamp Строка с временной меткой eosio::time_point_sec
 * @returns Отформатированная строка даты и времени
 */
import moment from 'moment-timezone'

export function formatDateTime(timestamp: string): string {
  if (!timestamp)
    return ''

  // Устанавливаем московский часовой пояс для форматирования
  const timezone = 'Europe/Moscow'

  // Преобразование timestamp в момент с учетом часового пояса
  let moscowDate
  if (timestamp.includes('T')) {
    // Формат ISO строки - используем moment с указанием UTC для правильной интерпретации
    moscowDate = moment.utc(timestamp).tz(timezone)
  }
  else if (!Number.isNaN(Number(timestamp))) {
    // Формат UNIX timestamp в секундах
    moscowDate = moment.unix(Number(timestamp)).tz(timezone)
  }
  else {
    // Для других форматов пытаемся определить автоматически
    moscowDate = moment(timestamp).tz(timezone)
  }

  // Месяцы на русском языке
  const months = [
    'января',
    'февраля',
    'марта',
    'апреля',
    'мая',
    'июня',
    'июля',
    'августа',
    'сентября',
    'октября',
    'ноября',
    'декабря',
  ]

  // Форматирование: "15 марта 2024 10:00 (Мск)"
  const day = moscowDate.date()
  const month = months[moscowDate.month()]
  const year = moscowDate.year()
  const hours = moscowDate.format('HH')
  const minutes = moscowDate.format('mm')

  return `${day} ${month} ${year} ${hours}:${minutes} (Мск)`
}
