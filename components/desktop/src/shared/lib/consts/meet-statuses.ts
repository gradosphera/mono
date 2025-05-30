import { Zeus } from '@coopenomics/sdk'

// Описания расширенных статусов собрания
export const EXTENDED_STATUS_MAP: Record<Zeus.ExtendedMeetStatus, string> = {
  'NONE': 'Неопределенное состояние',
  'CREATED': 'Собрание создано. Ожидаем утверждения даты проведения.',
  'AUTHORIZED': 'Дата общего собрания утверждена. Ожидаем начала собрания.',
  'ONRESTART': 'Получено предложение новой даты общего собрания. Ожидаем утверждения.',
  'PRECLOSED': 'Получена подпись секретаря собрания на протоколе. Ожидаем подписи председателя.',
  'CLOSED': 'Собрание успешно завершено',
  'WAITING_FOR_OPENING': 'Собрание открывается',
  'VOTING_IN_PROGRESS': 'Собрание идет и завершится',
  'EXPIRED_NO_QUORUM': 'Кворум собрания не собран. Ожидаем предложения даты нового собрания.',
  'VOTING_COMPLETED': 'Собрание успешно завершено. Ожидаем подписи секретаря на протоколе.'
}

// Описания базовых статусов собрания
export const BASIC_STATUS_MAP: Record<string, string> = {
  'created': 'Ожидание решения совета',
  'authorized': 'Утверждено',
  'preclosed': 'На закрытии',
  'closed': 'Закрыто'
}

// Статусы, требующие специальной обработки времени
export const SPECIAL_STATUSES: Zeus.ExtendedMeetStatus[] = [
  Zeus.ExtendedMeetStatus.ONRESTART,
  Zeus.ExtendedMeetStatus.EXPIRED_NO_QUORUM,
  Zeus.ExtendedMeetStatus.CLOSED,
  Zeus.ExtendedMeetStatus.PRECLOSED,
  Zeus.ExtendedMeetStatus.CREATED
]

// Конфигурация для отображения статусов баннером
export const STATUS_BANNER_CONFIG: Record<Zeus.ExtendedMeetStatus, { class: string, needTime: boolean, color: string, outline: boolean }> = {
  'NONE': { class: 'bg-grey-2 text-grey-8', needTime: false, color: 'grey-6', outline: true },
  'CREATED': { class: 'bg-grey-1 text-grey-8', needTime: false, color: 'grey-7', outline: true },
  'AUTHORIZED': { class: 'bg-grey-1 text-grey-8', needTime: false, color: 'grey-7', outline: true },
  'ONRESTART': { class: 'bg-orange-1 text-orange-8', needTime: false, color: 'orange', outline: true },
  'PRECLOSED': { class: 'bg-light-green-1 text-light-green-8', needTime: false, color: 'light-green', outline: true },
  'CLOSED': { class: 'bg-teal text-teal-10', needTime: false, color: 'teal', outline: false },
  'WAITING_FOR_OPENING': { class: 'bg-blue-1 text-blue-8', needTime: true, color: 'primary', outline: true },
  'VOTING_IN_PROGRESS': { class: 'bg-green-1 text-green-8', needTime: true, color: 'positive', outline: true },
  'EXPIRED_NO_QUORUM': { class: 'bg-amber-1 text-amber-8', needTime: false, color: 'amber', outline: true },
  'VOTING_COMPLETED': { class: 'bg-indigo-1 text-indigo-8', needTime: false, color: 'indigo', outline: true }
}
