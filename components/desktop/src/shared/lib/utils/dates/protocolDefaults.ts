export const getDefaultProtocolNumber = (): string => {
  const now = new Date()
  const day = String(now.getDate()).padStart(2, '0')
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const year = now.getFullYear()

  return `СС-${day}-${month}-${year}`
}

export const getDefaultProtocolDate = (): string => {
  const now = new Date()
  const day = now.getDate()
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
  const month = months[now.getMonth()]
  const year = now.getFullYear()

  return `${day} ${month} ${year} г.`
}
