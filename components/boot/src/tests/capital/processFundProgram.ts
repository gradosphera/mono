import { expect } from 'vitest'
import { CapitalContract } from 'cooptypes'
import { getTotalRamUsage } from '../../utils/getTotalRamUsage'
import { getCapitalWallet } from './getCapitalWallet'

export async function processFundProgram(
  blockchain: any,
  coopname: string,
  amount: string,
  memo: string = 'Тестовое финансирование программы',
) {
  console.log(`\n🔹 Начало финансирования программы капитализации: сумма=${amount}, memo=${memo}`)

  // Получение данных ДО финансирования
  const programWalletBefore = await getCapitalWallet(blockchain, coopname, coopname)

  console.log('📊 Состояние программы ДО финансирования:')
  console.log('▶ Кошелек программы:', programWalletBefore)

  // Финансирование программы капитализации
  const fundData: CapitalContract.Actions.FundProgram.IFundProgram = {
    coopname,
    amount,
    memo,
  }

  const fundResult = await blockchain.api.transact(
    {
      actions: [
        {
          account: CapitalContract.contractName.production,
          name: CapitalContract.Actions.FundProgram.actionName,
          authorization: [{ actor: coopname, permission: 'active' }],
          data: fundData,
        },
      ],
    },
    {
      blocksBehind: 3,
      expireSeconds: 30,
    },
  )

  getTotalRamUsage(fundResult)
  expect(fundResult.transaction_id).toBeDefined()

  // Получение данных ПОСЛЕ финансирования
  const programWalletAfter = await getCapitalWallet(blockchain, coopname, coopname)

  console.log('📊 Состояние программы ПОСЛЕ финансирования:')
  console.log('▶ Кошелек программы:', programWalletAfter)

  console.log(`\n✅ Финансирование программы капитализации завершено успешно!`)

  return {
    transactionId: fundResult.transaction_id,
    transaction: fundResult,
    programWalletBefore,
    programWalletAfter,
  }
}
