import { client } from 'src/shared/api/client'
import { Mutations } from '@coopenomics/sdk'
import { useSystemStore } from 'src/entities/System/model'

export type IGenerateFreeDecisionData = Mutations.FreeDecisions.GenerateFreeDecision.IInput['data']
export type IGenerateFreeDecisionResult = Mutations.FreeDecisions.GenerateFreeDecision.IOutput[typeof Mutations.FreeDecisions.GenerateFreeDecision.name]

export function useGenerateFreeDecision() {
  const { info } = useSystemStore()

  /**
   * Генерирует документ для свободного решения
   */
  async function generateFreeDecision(data: Omit<IGenerateFreeDecisionData, 'coopname'>): Promise<IGenerateFreeDecisionResult> {
    const { [Mutations.FreeDecisions.GenerateFreeDecision.name]: result } = await client.Mutation(
      Mutations.FreeDecisions.GenerateFreeDecision.mutation,
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
    generateFreeDecision
  }
}
