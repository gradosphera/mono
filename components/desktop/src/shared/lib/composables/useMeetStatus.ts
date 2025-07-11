import { computed } from 'vue'
import type { IMeet } from 'src/entities/Meet'
import moment from 'moment-with-locales-es6'
import { BASIC_STATUS_MAP, EXTENDED_STATUS_MAP, SPECIAL_STATUSES } from 'src/shared/lib/consts'
import { formatDateToLocalTimezone, formatDateFromNow } from 'src/shared/lib/utils/dates/timezone'

export function useMeetStatus(meet: IMeet | null) {
  // Базовый статус собрания
  const basicStatus = computed(() => {
    if (!meet?.processing?.meet?.status) return 'Неизвестный статус'
    return BASIC_STATUS_MAP[meet.processing.meet.status] || 'Неизвестный статус'
  })

  // Расширенный статус собрания
  const extendedStatus = computed(() => {
    if (!meet?.processing?.extendedStatus) return 'Неизвестный статус'
    return EXTENDED_STATUS_MAP[meet.processing.extendedStatus] || 'Неизвестный статус'
  })

  // Даты собрания в локальном часовом поясе
  const formattedOpenDate = computed(() => {
    if (!meet?.processing?.meet?.open_at) return ''
    return formatDateToLocalTimezone(meet.processing.meet.open_at)
  })

  const formattedCloseDate = computed(() => {
    if (!meet?.processing?.meet?.close_at) return ''
    return formatDateToLocalTimezone(meet.processing.meet.close_at)
  })

  // Относительное время до/после собрания
  const isVotingNotStarted = computed(() => {
    if (!meet?.processing?.meet?.open_at) return false
    return moment().isBefore(moment(meet.processing.meet.open_at))
  })

  const isVotingEnded = computed(() => {
    if (!meet?.processing?.meet?.close_at) return false
    return moment().isAfter(moment(meet.processing.meet.close_at))
  })

  const isVotingInProgress = computed(() => {
    if (!meet?.processing?.meet?.open_at || !meet?.processing?.meet?.close_at) return false
    const now = moment()
    return now.isAfter(moment(meet.processing.meet.open_at)) && now.isBefore(moment(meet.processing.meet.close_at))
  })

  // Проверяем специальные статусы
  const hasSpecialStatus = computed(() => {
    if (!meet?.processing?.extendedStatus) return false
    return SPECIAL_STATUSES.includes(meet.processing.extendedStatus)
  })

  const relativeOpenTime = computed(() => {
    if (!meet?.processing?.meet?.open_at || hasSpecialStatus.value) return ''

    const openMoment = moment(meet.processing.meet.open_at)
    const now = moment()

    if (now.isBefore(openMoment)) {
      return `Собрание начнется ${formatDateFromNow(meet.processing.meet.open_at)}`
    } else {
      // Проверяем, закончилось ли уже собрание
      if (isVotingEnded.value) {
        return relativeCloseTime.value
      }
      return `Собрание началось ${formatDateFromNow(meet.processing.meet.open_at)}`
    }
  })

  const relativeCloseTime = computed(() => {
    if (!meet?.processing?.meet?.close_at || hasSpecialStatus.value) return ''

    const closeMoment = moment(meet.processing.meet.close_at)
    const now = moment()

    if (now.isBefore(closeMoment)) {
      return `Собрание завершится ${formatDateFromNow(meet.processing.meet.close_at)}`
    } else {
      return `Собрание завершилось ${formatDateFromNow(meet.processing.meet.close_at)}`
    }
  })

  return {
    basicStatus,
    extendedStatus,
    formattedOpenDate,
    formattedCloseDate,
    isVotingNotStarted,
    isVotingEnded,
    isVotingInProgress,
    hasSpecialStatus,
    relativeOpenTime,
    relativeCloseTime
  }
}
