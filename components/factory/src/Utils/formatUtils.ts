/**
 * Форматирует eosio::time_point_sec в удобочитаемый формат даты и времени
 * @param timestamp Строка с временной меткой eosio::time_point_sec
 * @returns Отформатированная строка даты и времени
 */
export function formatDateTime(timestamp: string): string {
  if (!timestamp)
    return ''

  // Преобразование timestamp в объект Date
  let date: Date
  if (timestamp.includes('T')) {
    // Формат ISO строки
    date = new Date(timestamp)
  }
  else if (!Number.isNaN(Number(timestamp))) {
    // Формат UNIX timestamp в секундах
    date = new Date(Number(timestamp) * 1000)
  }
  else {
    // Пытаемся разобрать строку как есть
    date = new Date(timestamp)
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
  const day = date.getDate()
  const month = months[date.getMonth()]
  const year = date.getFullYear()
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')

  return `${day} ${month} ${year} ${hours}:${minutes} (Мск)`
}
