import { computed } from 'vue'
import { Notify } from 'quasar'
import { useMeetStore } from 'src/entities/Meet/model/store'
import { createMeetWithAgenda } from 'src/features/Meet/CreateMeetWithAgenda/model'
import { signByPresiderOnAnnualGeneralMeetWithDecision } from 'src/features/Meet/CloseMeetWithDecision/model'
import { restartMeetWithProposal } from 'src/features/Meet/RestartMeetWithProposal/model'
import { useSessionStore } from 'src/entities/Session'
import type { IMeet } from 'src/entities/Meet'
import { FailAlert } from 'src/shared/api'

export function useMeetManagement(coopname: string) {
  const meetStore = useMeetStore()
  const sessionStore = useSessionStore()

  const meets = computed(() => meetStore.meets)
  const loading = computed(() => meetStore.loading)

  const loadMeets = async () => {
    try {
      await meetStore.loadMeets({ coopname })
    } catch (e: any) {
      FailAlert(e)
    }
  }

  const handleCreateMeet = async (formData: any) => {
    try {
      await createMeetWithAgenda({
        coopname,
        initiator: formData.initiator,
        presider: formData.presider,
        secretary: formData.secretary,
        open_at: formData.open_at,
        close_at: formData.close_at,
        username: sessionStore.username,
        agenda_points: formData.agenda_points
      })

      await loadMeets()

      Notify.create({
        message: 'Собрание успешно создано',
        type: 'positive',
      })

      return true
    } catch (e: any) {
      FailAlert(e)
      return false
    }
  }

  const handleCloseMeet = async (meet: IMeet) => {
    try {
      await signByPresiderOnAnnualGeneralMeetWithDecision({
        coopname,
        hash: meet.hash,
        username: sessionStore.username,
        meet_hash: meet.hash
      })

      await loadMeets()

      Notify.create({
        message: 'Собрание успешно закрыто',
        type: 'positive',
      })

      return true
    } catch (e: any) {
      FailAlert(e)
      return false
    }
  }

  const handleRestartMeet = async (data: any) => {
    try {
      await restartMeetWithProposal({
        coopname,
        hash: data.hash,
        username: sessionStore.username,
        new_open_at: data.new_open_at,
        new_close_at: data.new_close_at,
        agenda_points: data.agenda_points
      })

      await loadMeets()

      Notify.create({
        message: 'Собрание успешно перезапущено',
        type: 'positive',
      })

      return true
    } catch (e: any) {
      FailAlert(e)
      return false
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleVote = (meet: IMeet) => {
    Notify.create({
      message: 'Голосование в разработке',
      type: 'info',
    })
  }

  return {
    meets,
    loading,
    loadMeets,
    handleCreateMeet,
    handleCloseMeet,
    handleRestartMeet,
    handleVote
  }
}
