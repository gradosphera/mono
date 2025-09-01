import { expect } from 'vitest'
import { CapitalContract } from 'cooptypes'
import { getTotalRamUsage } from '../../utils/getTotalRamUsage'
import { getProjectWallet } from './getProjectWallet'

export async function processRefreshProj(
  blockchain: any,
  coopname: string,
  projectHash: string,
  username: string,
) {
  console.log(`\n🔹 Начало обновления CRPS пайщика в проекте: проект=${projectHash}, пользователь=${username}`)

  // Получение данных ДО обновления
  const projectWalletBefore = await getProjectWallet(blockchain, coopname, projectHash, username)

  console.log('📊 Состояние кошелька проекта ДО обновления CRPS:')
  console.log('▶ Кошелек проекта:', projectWalletBefore)

  // Обновление CRPS пайщика в проекте
  const refreshData: CapitalContract.Actions.RefreshProject.IRefreshProject = {
    coopname,
    project_hash: projectHash,
    username,
  }

  const refreshResult = await blockchain.api.transact(
    {
      actions: [
        {
          account: CapitalContract.contractName.production,
          name: CapitalContract.Actions.RefreshProject.actionName,
          authorization: [{ actor: coopname, permission: 'active' }],
          data: refreshData,
        },
      ],
    },
    {
      blocksBehind: 3,
      expireSeconds: 30,
    },
  )

  getTotalRamUsage(refreshResult)
  expect(refreshResult.transaction_id).toBeDefined()

  // Получение данных ПОСЛЕ обновления
  const projectWalletAfter = await getProjectWallet(blockchain, coopname, projectHash, username)

  console.log('📊 Состояние кошелька проекта ПОСЛЕ обновления CRPS:')
  console.log('▶ Кошелек проекта:', projectWalletAfter)

  console.log(`\n✅ Обновление CRPS пайщика в проекте завершено успешно!`)

  return {
    transactionId: refreshResult.transaction_id,
    transaction: refreshResult,
    projectWalletBefore,
    projectWalletAfter,
  }
}
