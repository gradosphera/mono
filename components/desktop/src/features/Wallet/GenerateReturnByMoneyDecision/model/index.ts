import { client } from 'src/shared/api/client'
import { Mutations } from '@coopenomics/sdk'
import { useSystemStore } from 'src/entities/System/model'

export type IGenerateReturnByMoneyDecisionData = Mutations.Wallet.GenerateReturnByMoneyDecisionDocument.IInput['data']
export type IGenerateReturnByMoneyDecisionResult = Mutations.Wallet.GenerateReturnByMoneyDecisionDocument.IOutput[typeof Mutations.Wallet.GenerateReturnByMoneyDecisionDocument.name]

/**
 * Композабл для генерации документа решения совета о возврате паевого взноса
 */
export function useGenerateReturnByMoneyDecision() {
  const { info } = useSystemStore()

  /**
   * Генерирует документ решения совета о возврате паевого взноса
   */
  async function generateReturnByMoneyDecision(data: Omit<IGenerateReturnByMoneyDecisionData, 'coopname'>): Promise<IGenerateReturnByMoneyDecisionResult> {
    const { [Mutations.Wallet.GenerateReturnByMoneyDecisionDocument.name]: result } = await client.Mutation(
      Mutations.Wallet.GenerateReturnByMoneyDecisionDocument.mutation,
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
    generateReturnByMoneyDecision
  }
}
