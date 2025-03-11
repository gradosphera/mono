import { expect } from 'vitest'
import { CapitalContract } from 'cooptypes'
import { getTotalRamUsage } from '../../utils/getTotalRamUsage'

export async function allocateFundsToResult(
  blockchain: any,
  coopname: string,
  projectHash: string,
  resultHash: string,
  amount: string,
) {
  console.log(`\n🔹 Начало финансирования результата: ${resultHash}, сумма: ${amount}`)

  // Получение текущих данных перед финансированием
  const prevResult = (await blockchain.getTableRows(
    CapitalContract.contractName.production,
    coopname,
    'results',
    1,
    resultHash,
    resultHash,
    2,
    'sha256',
  ))[0] || { available: '0.0000 RUB' }

  const prevProject = (await blockchain.getTableRows(
    CapitalContract.contractName.production,
    coopname,
    'projects',
    1,
    projectHash,
    projectHash,
    3,
    'sha256',
  ))[0] || { available: '0.0000 RUB' }

  console.log('📊 Балансы до финансирования:')
  console.log('▶ Результат:', prevResult)
  console.log('▶ Проект:', prevProject)

  // Отправка транзакции финансирования
  const allocateData: CapitalContract.Actions.Allocate.IAllocate = {
    coopname,
    application: coopname,
    project_hash: projectHash,
    result_hash: resultHash,
    amount,
  }

  console.log(`\n🚀 Отправка транзакции Allocate для результата ${resultHash}`)
  const allocateResult = await blockchain.api.transact(
    {
      actions: [
        {
          account: CapitalContract.contractName.production,
          name: CapitalContract.Actions.Allocate.actionName,
          authorization: [{ actor: coopname, permission: 'active' }],
          data: allocateData,
        },
      ],
    },
    {
      blocksBehind: 3,
      expireSeconds: 30,
    },
  )

  getTotalRamUsage(allocateResult)
  expect(allocateResult.transaction_id).toBeDefined()

  // Получение обновленных данных
  const updatedResult = (await blockchain.getTableRows(
    CapitalContract.contractName.production,
    coopname,
    'results',
    1,
    resultHash,
    resultHash,
    2,
    'sha256',
  ))[0]

  const updatedProject = (await blockchain.getTableRows(
    CapitalContract.contractName.production,
    coopname,
    'projects',
    1,
    projectHash,
    projectHash,
    3,
    'sha256',
  ))[0]

  console.log('\n📊 Балансы после финансирования:')
  console.log('▶ Результат:', updatedResult)
  console.log('▶ Проект:', updatedProject)

  // Проверка изменения available
  expect(parseFloat(updatedResult.available)).toBe(parseFloat(prevResult.available) + parseFloat(amount))
  expect(parseFloat(updatedProject.available)).toBe(parseFloat(prevProject.available) - parseFloat(amount))
  expect(parseFloat(updatedProject.allocated)).toBe(parseFloat(prevProject.allocated) + parseFloat(amount))

  console.log(`\n✅ Финансирование ${amount} завершено успешно!`)

  return { transactionId: allocateResult.transaction_id }
}
