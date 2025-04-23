import { Notify } from 'quasar'
import { useMeetStore } from 'src/entities/Meet'
import { voteOnMeet } from 'src/features/Meet/VoteOnMeet'
import { generateBallot } from 'src/features/Meet/GenerateBallot'
import { useSignDocument } from 'src/shared/lib/document'
import { useSessionStore } from 'src/entities/Session'
import { FailAlert } from 'src/shared/api'

export function useMeetDetails(coopname: string, meetId: string) {
  const meetStore = useMeetStore()
  const sessionStore = useSessionStore()
  const { signDocument } = useSignDocument()

  const loadMeet = async () => {
    try {
      return await meetStore.loadMeet({
        coopname,
        hash: meetId
      })
    } catch (e: any) {
      FailAlert(e)
      return null
    }
  }

  const handleVoteOnMeet = async (votesData: { question_id: number, vote: string }[]) => {
    try {
      // Генерация бюллетеня
      const generatedBallot = await generateBallot({
        coopname,
        username: sessionStore.username,
        meet_hash: meetId
      })

      // Подписание бюллетеня
      const signedBallot = await signDocument(generatedBallot)

      // Отправка голоса
      await voteOnMeet({
        coopname,
        hash: meetId,
        ballot: signedBallot,
        member: sessionStore.username,
        votes: votesData
      })

      Notify.create({
        type: 'positive',
        message: 'Ваш голос успешно отправлен'
      })

      return true
    } catch (e: any) {
      FailAlert(e)
      return false
    }
  }

  return {
    loadMeet,
    handleVoteOnMeet
  }
}
