import { ref, computed } from 'vue'
import { client } from 'src/shared/api/client'
import { Mutations, Zeus } from '@coopenomics/sdk'
import moment from 'moment-with-locales-es6'
import { useMeetStore } from 'src/entities/Meet'
import type { IMeet } from 'src/entities/Meet'
import type { IVoteOnMeetInput, IVoteOnMeetResult } from './types'
import { formatDateToLocalTimezone } from 'src/shared/lib/utils/dates/timezone'

moment.locale('ru')

export function useVoteOnMeet() {
  // Стор встреч для доступа к данным и методам загрузки
  const meetStore = useMeetStore()

  // Локальное состояние голосов
  const votes = ref<Record<number, 'for' | 'against' | 'abstained'>>({})

  // Текущее собрание для голосования (может быть из стора или переданное)
  const currentVotingMeet = ref<IMeet | null>(null)

  // Получаем активное собрание, приоритет у переданного собрания
  const activeMeet = computed<IMeet | null>(() => {
    return currentVotingMeet.value || meetStore.currentMeet
  })

  // Устанавливаем собрание для голосования
  const setMeet = (meet: IMeet | null) => {
    currentVotingMeet.value = meet
  }

  // Селекторы (computed)
  const meetAgendaItems = computed(() => {
    if (!activeMeet.value) return []
    return activeMeet.value.processing?.questions || []
  })

  const allVotesSelected = computed(() => {
    if (!meetAgendaItems.value.length) return false
    return meetAgendaItems.value.every((_, index) => votes.value[index] !== undefined)
  })

  const isVotingNow = computed(() => {
    if (activeMeet.value?.processing?.extendedStatus === Zeus.ExtendedMeetStatus.VOTING_IN_PROGRESS) return true
    else return false
 })

  const isVotingNotStarted = computed(() => {
    if (activeMeet.value?.processing?.extendedStatus === Zeus.ExtendedMeetStatus.WAITING_FOR_OPENING) return true
    else return false
  })

  const isVotingEnded = computed(() => {
    if (activeMeet.value?.processing?.extendedStatus === Zeus.ExtendedMeetStatus.VOTING_COMPLETED) return true
    else return false
  })

  const formattedOpenDate = computed(() => {
    if (!activeMeet.value?.processing?.meet?.open_at) return ''
    return formatDateToLocalTimezone(activeMeet.value.processing.meet.open_at)
  })

  const formattedCloseDate = computed(() => {
    if (!activeMeet.value?.processing?.meet?.close_at) return ''
    return formatDateToLocalTimezone(activeMeet.value.processing.meet.close_at)
  })

  // Экшены
  const resetVotes = () => {
    votes.value = {}
  }

  const voteOnMeet = async (data: IVoteOnMeetInput): Promise<IVoteOnMeetResult> => {
    const { [Mutations.Meet.VoteOnAnnualGeneralMeet.name]: result } = await client.Mutation(
      Mutations.Meet.VoteOnAnnualGeneralMeet.mutation,
      {
        variables: {
          data
        }
      }
    )

    // Обновляем данные собрания после голосования
    if (data.coopname && data.hash) {
      // Обновляем данные в сторе собраний
      const updatedMeet = await meetStore.loadMeet({
        coopname: data.coopname,
        hash: data.hash
      })

      // Обновляем данные в локальном сторе, если используется отдельное собрание
      if (currentVotingMeet.value) {
        currentVotingMeet.value = updatedMeet
      }
    }

    // Сбрасываем локальное состояние голосов
    resetVotes()

    return result
  }

  return {
    // state
    votes,
    currentVotingMeet,

    // getters
    activeMeet,
    meetAgendaItems,
    isVotingNow,
    allVotesSelected,
    isVotingNotStarted,
    isVotingEnded,
    formattedOpenDate,
    formattedCloseDate,

    // actions
    setMeet,
    voteOnMeet,
    resetVotes
  }
}
