import { expect } from 'vitest'
import { CapitalContract } from 'cooptypes'
import { getTotalRamUsage } from '../../utils/getTotalRamUsage'
import { getProjectWallet } from './getProjectWallet'

export async function processFundProject(
  blockchain: any,
  coopname: string,
  projectHash: string,
  amount: string,
  memo: string = 'Тестовое финансирование проекта',
) {
  console.log(`\n🔹 Начало финансирования проекта: проект=${projectHash}, сумма=${amount}, memo=${memo}`)

  // Получение данных ДО финансирования
  const projectWalletBefore = await getProjectWallet(blockchain, coopname, projectHash, coopname)

  console.log('📊 Состояние проекта ДО финансирования:')
  console.log('▶ Кошелек проекта:', projectWalletBefore)

  // Финансирование проекта
  const fundData: CapitalContract.Actions.FundProject.IFundProject = {
    coopname,
    project_hash: projectHash,
    amount,
    memo,
  }

  const fundResult = await blockchain.api.transact(
    {
      actions: [
        {
          account: CapitalContract.contractName.production,
          name: CapitalContract.Actions.FundProject.actionName,
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
  const projectWalletAfter = await getProjectWallet(blockchain, coopname, projectHash, coopname)

  console.log('📊 Состояние проекта ПОСЛЕ финансирования:')
  console.log('▶ Кошелек проекта:', projectWalletAfter)

  console.log(`\n✅ Финансирование проекта завершено успешно!`)

  return {
    transactionId: fundResult.transaction_id,
    transaction: fundResult,
    projectWalletBefore,
    projectWalletAfter,
  }
}
