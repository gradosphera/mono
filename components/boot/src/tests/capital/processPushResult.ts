import { expect } from 'vitest'
import { CapitalContract, SovietContract } from 'cooptypes'
import { getTotalRamUsage } from '../../utils/getTotalRamUsage'
import { generateRandomSHA256 } from '../../utils/randomHash'
import { processLastDecision } from '../soviet/processLastDecision'
import { fakeDocument } from '../shared/fakeDocument'
import type Blockchain from '../../blockchain'
import { getSegment } from './getSegment'
import { processApprove } from './processApprove'

/**
 * Функция для внесения результата в кооператив
 * @param blockchain экземпляр блокчейна
 * @param coopname название кооператива
 * @param username имя пользователя
 * @param projectHash хеш проекта
 * @param contributionAmount сумма взноса
 * @param debtAmount сумма долга к погашению
 * @param debtHashes вектор хэшей долгов для погашения
 */
export async function processPushResult(
  blockchain: Blockchain,
  coopname: string,
  username: string,
  projectHash: string,
  contributionAmount: string,
  debtAmount: string,
  debtHashes: string[] = [],
) {
  const resultHash = generateRandomSHA256()
  console.log(`\n🔹 Начало процесса внесения результата: ${resultHash}`)

  // Получаем сегмент до внесения результата
  const segmentBefore = await getSegment(blockchain, coopname, projectHash, username)
  console.log('📊 Сегмент до внесения результата:', segmentBefore)

  fakeDocument.signatures[0].signer = username

  // 1. Вносим результат
  const pushResultData: CapitalContract.Actions.PushResult.IPushResult = {
    coopname,
    username,
    project_hash: projectHash,
    result_hash: resultHash,
    contribution_amount: contributionAmount,
    debt_amount: debtAmount,
    statement: fakeDocument,
    debt_hashes: debtHashes,
  }

  console.log(`\n🚀 Отправка транзакции PushResult для ${username} на сумму ${contributionAmount}`)
  const pushResult = await blockchain.api.transact(
    {
      actions: [
        {
          account: CapitalContract.contractName.production,
          name: CapitalContract.Actions.PushResult.actionName,
          authorization: [{ actor: coopname, permission: 'active' }],
          data: pushResultData,
        },
      ],
    },
    {
      blocksBehind: 3,
      expireSeconds: 30,
    },
  )

  getTotalRamUsage(pushResult)
  expect(pushResult.transaction_id).toBeDefined()
  console.log('✅ Результат внесен:', resultHash)

  // Проверяем что результат создался
  const results = (await blockchain.getTableRows(
    CapitalContract.contractName.production,
    coopname,
    'results',
    1,
    resultHash,
    resultHash,
    3,
    'sha256',
  ))
  const createdResult = results[0]
  console.log('🔍 Результат в блокчейне:', createdResult)
  expect(createdResult).toBeDefined()
  expect(createdResult.status).toBe('created')

  // 2. Одобряем результат через processApprove (soviet контракт)
  console.log(`\n✅ Одобрение результата ${resultHash} через soviet`)
  await processApprove(blockchain, coopname, resultHash)
  console.log('✅ Результат одобрен советом')

  // 3. Процессим решение совета
  await processLastDecision(blockchain, coopname)
  console.log('✅ Решение совета принято')

  // 4. Подписываем акт №1 вкладчиком
  const signAct1Data: CapitalContract.Actions.SignAct1.ISignAct1 = {
    coopname,
    username,
    result_hash: resultHash,
    act: fakeDocument,
  }

  console.log(`\n✅ Подписание акта №1 вкладчиком ${username}`)
  const signAct1Result = await blockchain.api.transact(
    {
      actions: [
        {
          account: CapitalContract.contractName.production,
          name: CapitalContract.Actions.SignAct1.actionName,
          authorization: [{ actor: coopname, permission: 'active' }],
          data: signAct1Data,
        },
      ],
    },
    {
      blocksBehind: 3,
      expireSeconds: 30,
    },
  )

  getTotalRamUsage(signAct1Result)
  expect(signAct1Result.transaction_id).toBeDefined()
  console.log('✅ Акт №1 подписан вкладчиком')

  fakeDocument.signatures[1] = fakeDocument.signatures[0]
  fakeDocument.signatures[1].signer = 'ant'

  // 5. Подписываем акт №2 председателем
  const signAct2Data: CapitalContract.Actions.SignAct2.ISignAct2 = {
    coopname,
    result_hash: resultHash,
    act: fakeDocument,
    username: 'ant',
  }

  console.log(`\n✅ Подписание акта №2 председателем`)
  const signAct2Result = await blockchain.api.transact(
    {
      actions: [
        {
          account: CapitalContract.contractName.production,
          name: CapitalContract.Actions.SignAct2.actionName,
          authorization: [{ actor: coopname, permission: 'active' }],
          data: signAct2Data,
        },
      ],
    },
    {
      blocksBehind: 3,
      expireSeconds: 30,
    },
  )

  getTotalRamUsage(signAct2Result)
  expect(signAct2Result.transaction_id).toBeDefined()
  console.log('✅ Акт №2 подписан председателем')

  // Получаем финальные состояния
  const segmentAfter = await getSegment(blockchain, coopname, projectHash, username)

  console.log('\n📊 Результаты после внесения результата:')
  console.log('▶ Сегмент до:', segmentBefore)
  console.log('▶ Сегмент после:', segmentAfter)

  console.log(`\n✅ Процесс внесения результата на ${contributionAmount} завершен успешно!`)

  return {
    resultHash,
    result: createdResult,
    segmentBefore,
    segmentAfter,
    transactionId: signAct2Result.transaction_id,
  }
}
