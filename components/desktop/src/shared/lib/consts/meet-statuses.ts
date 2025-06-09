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

// Конфигурация для баннеров статусов собраний
// @property {string} class - CSS-класс для стилизации
// @property {boolean} needTime - Нужно ли отображать время
// @property {string} color - Цвет баннера
// @property {boolean} outline - Использовать ли контурный стиль
// @property {string} icon - иконка
export const STATUS_BANNER_CONFIG: Record<
  Zeus.ExtendedMeetStatus,
  { class: string; needTime: boolean; color: string; outline: boolean; icon: string }
> = {
  NONE: {
    class: 'text-grey-8',
    needTime: false,
    color: 'grey-4',
    outline: true,
    icon: 'help_outline'
  },
  WAITING_FOR_OPENING: {
    class: 'text-grey-8',
    needTime: true,
    color: 'grey-4',
    outline: true,
    icon: 'hourglass_empty'
  },
  VOTING_IN_PROGRESS: {
    class: 'text-primary',
    needTime: true,
    color: 'primary',
    outline: true,
    icon: 'how_to_vote'
  },
  VOTING_COMPLETED: {
    class: 'text-primary',
    needTime: false,
    color: 'primary',
    outline: true,
    icon: 'hourglass_bottom'
  },
  CLOSED: {
    class: 'text-primary',
    needTime: false,
    color: 'primary',
    outline: true,
    icon: 'check_circle'
  },
  CREATED: {
    class: 'text-primary',
    needTime: false,
    color: 'primary',
    outline: true,
    icon: 'fiber_new'
  },
  AUTHORIZED: {
    class: 'text-primary',
    needTime: false,
    color: 'primary',
    outline: true,
    icon: 'verified_user'
  },
  ONRESTART: {
    class: 'text-primary',
    needTime: false,
    color: 'primary',
    outline: true,
    icon: 'sync_problem'
  },
  PRECLOSED: {
    class: 'text-primary',
    needTime: false,
    color: 'primary',
    outline: true,
    icon: 'schedule'
  },
  EXPIRED_NO_QUORUM: {
    class: 'text-primary',
    needTime: false,
    color: 'primary',
    outline: true,
    icon: 'group_off'
  }
}
