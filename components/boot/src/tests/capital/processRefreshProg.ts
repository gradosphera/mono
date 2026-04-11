import { expect } from 'vitest'
import { CapitalContract } from 'cooptypes'
import { getTotalRamUsage } from '../../utils/getTotalRamUsage'
import { getCapitalWallet } from './getCapitalWallet'

export async function processRefreshProg(
  blockchain: any,
  coopname: string,
  username: string,
) {
  console.log(`\n🔹 Начало обновления CRPS пайщика в программе благороста: пользователь=${username}`)

  // Получение данных ДО обновления
  const programWalletBefore = await getCapitalWallet(blockchain, coopname, username)

  console.log('📊 Состояние пайщика ДО обновления CRPS:')
  console.log('▶ Кошелек пайщика:', programWalletBefore)

  // Обновление CRPS пайщика в программе благороста
  const refreshData: CapitalContract.Actions.RefreshProgram.IRefreshProgram = {
    coopname,
    username,
  }

  const refreshResult = await blockchain.api.transact(
    {
      actions: [
        {
          account: CapitalContract.contractName.production,
          name: CapitalContract.Actions.RefreshProgram.actionName,
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
  const programWalletAfter = await getCapitalWallet(blockchain, coopname, username)

  console.log('📊 Состояние пайщика ПОСЛЕ обновления CRPS:')
  console.log('▶ Кошелек пайщика:', programWalletAfter)

  console.log(`\n✅ Обновление CRPS пайщика в программе благороста завершено успешно!`)

  return {
    transactionId: refreshResult.transaction_id,
    transaction: refreshResult,
    programWalletBefore,
    programWalletAfter,
  }
}
