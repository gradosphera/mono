import { computed, type Ref } from 'vue'
import type { IMeet } from 'src/entities/Meet'
import { useMeetStore } from 'src/entities/Meet'
import { useSessionStore } from 'src/entities/Session'
import { FailAlert, SuccessAlert } from 'src/shared/api'
import { voteOnMeet, type IVoteOnMeetInput } from 'src/features/Meet/VoteOnMeet'
import { generateBallot } from 'src/features/Meet/GenerateBallot'
import { useSignDocument } from 'src/shared/lib/document'
import moment from 'moment-with-locales-es6'

moment.locale('ru')

export const useMeetDetailsVoting = (
  meet: IMeet,
  coopname: string,
  meetHash: string,
  votes: Ref<Record<number, 'for' | 'against' | 'abstained'>>,
  isVoting: Ref<boolean>
) => {
  const meetStore = useMeetStore()
  const sessionStore = useSessionStore()
  const { signDocument } = useSignDocument()

  const meetAgendaItems = computed(() => {
    if (!meet) return []
    return meet.processing?.questions || []
  })

  const canVote = computed(() => {
    if (!meet?.processing?.meet) return false

    const isAuthorized = meet.processing.meet.status === 'authorized'
    
    const now = moment()
    const openAt = moment(meet.processing.meet.open_at)
    const closeAt = moment(meet.processing.meet.close_at)
    
    const isWithinTimeframe = now.isAfter(openAt) && now.isBefore(closeAt)

    return isAuthorized && isWithinTimeframe
  })

  const allVotesSelected = computed(() => {
    if (!meetAgendaItems.value.length) return false
    return meetAgendaItems.value.every((_, index) => votes.value[index] !== undefined)
  })

  const isVotingNotStarted = computed(() => {
    if (!meet?.processing?.meet?.open_at) return false
    const now = moment()
    const openAt = moment(meet.processing.meet.open_at)
    return now.isBefore(openAt)
  })

  const isVotingEnded = computed(() => {
    if (!meet?.processing?.meet?.close_at) return false
    const now = moment()
    const closeAt = moment(meet.processing.meet.close_at)
    return now.isAfter(closeAt)
  })

  const formattedOpenDate = computed(() => {
    if (!meet?.processing?.meet?.open_at) return ''
    return moment(meet.processing.meet.open_at).format('DD.MM.YYYY HH:mm')
  })

  const formattedCloseDate = computed(() => {
    if (!meet?.processing?.meet?.close_at) return ''
    return moment(meet.processing.meet.close_at).format('DD.MM.YYYY HH:mm')
  })

  const submitVote = async () => {
    if (!meet || !allVotesSelected.value || !canVote.value) return

    isVoting.value = true
    try {
      const votesData = meetAgendaItems.value.map((item, index) => ({
        question_id: item.id,
        vote: votes.value[index]
      }))

      const generatedBallot = await generateBallot({
        coopname,
        username: sessionStore.username,
      })

      const signedBallot = await signDocument(generatedBallot)

      const vote: IVoteOnMeetInput = {
        coopname,
        hash: meetHash,
        ballot: signedBallot,
        username: sessionStore.username,
        votes: votesData
      }

      await voteOnMeet(vote)
      SuccessAlert('Ваш голос успешно отправлен')
      await meetStore.loadMeet({ coopname, hash: meetHash })
    } catch (error: any) {
      FailAlert(error)
    } finally {
      isVoting.value = false
    }
  }

  return {
    canVote,
    meetAgendaItems,
    allVotesSelected,
    isVotingNotStarted,
    isVotingEnded,
    formattedOpenDate,
    formattedCloseDate,
    submitVote
  }
} 