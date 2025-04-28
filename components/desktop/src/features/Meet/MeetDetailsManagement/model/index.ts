import { computed, type Ref } from 'vue'
import type { IMeet } from 'src/entities/Meet'
import { useMeetStore } from 'src/entities/Meet'
import { useSessionStore } from 'src/entities/Session'
import { FailAlert, SuccessAlert } from 'src/shared/api'
import { signByPresiderOnAnnualGeneralMeetWithDecision } from 'src/features/Meet/CloseMeetWithDecision/model'
import { restartMeetWithProposal } from 'src/features/Meet/RestartMeet/model'
import moment from 'moment-with-locales-es6'

moment.locale('ru')

export const useMeetDetailsManagement = (
  meet: IMeet,
  coopname: string,
  meetHash: string,
  isProcessing: Ref<boolean>
) => {
  const meetStore = useMeetStore()
  const sessionStore = useSessionStore()

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

  const closeMeetBySecretary = async () => {
    isProcessing.value = true
    try {
      await signByPresiderOnAnnualGeneralMeetWithDecision({
        coopname,
        hash: meetHash,
        username: sessionStore.username,
      })

      await meetStore.loadMeet({ coopname, hash: meetHash })
      SuccessAlert('Собрание успешно закрыто')
    } catch (error: any) {
      FailAlert(error)
    } finally {
      isProcessing.value = false
    }
  }

  const closeMeetByPresider = async () => {
    isProcessing.value = true
    try {
      await signByPresiderOnAnnualGeneralMeetWithDecision({
        coopname,
        hash: meetHash,
        username: sessionStore.username,
      })

      await meetStore.loadMeet({ coopname, hash: meetHash })
      SuccessAlert('Собрание успешно закрыто')
    } catch (error: any) {
      FailAlert(error)
    } finally {
      isProcessing.value = false
    }
  }

  const handleRestartMeet = async (data: any) => {
    isProcessing.value = true
    try {
      await restartMeetWithProposal({
        coopname,
        hash: meetHash,
        username: sessionStore.username,
        new_open_at: data.new_open_at,
        new_close_at: data.new_close_at,
        agenda_points: data.agenda_points
      })

      await meetStore.loadMeet({ coopname, hash: meetHash })
      SuccessAlert('Собрание успешно перезапущено')
      return true
    } catch (error: any) {
      FailAlert(error)
      return false
    } finally {
      isProcessing.value = false
    }
  }

  return {
    canManageMeet,
    canCloseBySecretary,
    canCloseByPresider,
    canRestartMeet,
    closeMeetBySecretary,
    closeMeetByPresider,
    handleRestartMeet
  }
} 