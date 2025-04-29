import { client } from 'src/shared/api/client'
import { Mutations } from '@coopenomics/sdk'
import { useSystemStore } from 'src/entities/System/model'

export type IGenerateParticipantApplicationDecisionData = Mutations.Participants.GenerateParticipantApplicationDecision.IInput['data']
export type IGenerateParticipantApplicationDecisionResult = Mutations.Participants.GenerateParticipantApplicationDecision.IOutput[typeof Mutations.Participants.GenerateParticipantApplicationDecision.name]

export function useGenerateParticipantApplicationDecision() {
  const { info } = useSystemStore()

  /**
   * Генерирует документ для решения по заявлению о вступлении в кооператив
   */
  async function generateParticipantApplicationDecision(
    data: Omit<IGenerateParticipantApplicationDecisionData, 'coopname'>
  ): Promise<IGenerateParticipantApplicationDecisionResult> {
    const { [Mutations.Participants.GenerateParticipantApplicationDecision.name]: result } = await client.Mutation(
      Mutations.Participants.GenerateParticipantApplicationDecision.mutation,
      {
        variables: {
          data: {
            coopname: info.coopname,
            ...data
          },
          options: {
            lang: 'ru'
          }
        }
      }
    )

    return result
  }

  return {
    generateParticipantApplicationDecision
  }
}
