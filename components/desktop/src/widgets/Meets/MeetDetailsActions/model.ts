import { computed } from 'vue'
import type { IMeet } from 'src/entities/Meet'
import moment from 'moment-with-locales-es6'

moment.locale('ru')

export const useMeetDetailsActions = (meet: IMeet) => {
  const canManageMeet = computed(() => true) // Здесь можно добавить проверку ролей

  const canCloseBySecretary = computed(() => {
    if (!meet?.processing?.meet) return false
    
    const now = moment()
    const closeAt = moment(meet.processing.meet.close_at)
    
    const isAfterCloseDate = now.isAfter(closeAt)
    const isQuorumPassed = meet.processing.meet.quorum_passed === true
    const isAuthorized = meet.processing.meet.status === 'authorized'
    
    return isAfterCloseDate && isQuorumPassed && isAuthorized
  })

  const canCloseByPresider = computed(() => {
    if (!meet?.processing?.meet) return false
    return meet.processing.meet.status === 'preclose'
  })

  const canRestartMeet = computed(() => {
    if (!meet?.processing?.meet) return false
    
    const now = moment()
    const closeAt = moment(meet.processing.meet.close_at)
    
    const isAfterCloseDate = now.isAfter(closeAt)
    const isQuorumNotPassed = meet.processing.meet.quorum_passed !== true
    
    return isAfterCloseDate && isQuorumNotPassed && meet.processing.meet.status === 'authorized'
  })

  return {
    canManageMeet,
    canCloseBySecretary,
    canCloseByPresider,
    canRestartMeet
  }
} 