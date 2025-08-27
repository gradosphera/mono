import { expect } from 'vitest'
import { CapitalContract } from 'cooptypes'
import { getTotalRamUsage } from '../../utils/getTotalRamUsage'
import { generateRandomSHA256 } from '../../utils/randomHash'
import { fakeDocument } from '../shared/fakeDocument'
import type Blockchain from '../../blockchain'
import { getSegment } from './getSegment'

/**
 * Функция для конвертации сегмента участника
 * @param blockchain экземпляр блокчейна
 * @param coopname название кооператива
 * @param username имя пользователя
 * @param projectHash хеш проекта
 * @param walletAmount сумма для конвертации в главный кошелек
 * @param capitalAmount сумма для конвертации в капитализацию
 * @param projectAmount сумма для конвертации в кошелек проекта
 */
export async function processConvertSegment(
  blockchain: Blockchain,
  coopname: string,
  username: string,
  projectHash: string,
  walletAmount: string,
  capitalAmount: string,
  projectAmount: string,
) {
  const convertHash = generateRandomSHA256()
  console.log(`\n🔹 Начало процесса конвертации сегмента: ${convertHash}`)

  // Получаем сегмент до конвертации
  const segmentBefore = await getSegment(blockchain, coopname, projectHash, username)
  console.log('📊 Сегмент до конвертации:', segmentBefore)

  // 1. Конвертируем сегмент
  const convertSegmentData: CapitalContract.Actions.ConvertSegment.IConvertSegment = {
    coopname,
    username,
    project_hash: projectHash,
    convert_hash: convertHash,
    wallet_amount: walletAmount,
    capital_amount: capitalAmount,
    project_amount: projectAmount,
    convert_statement: fakeDocument,
  }

  console.log(`\n🚀 Отправка транзакции ConvertSegment для ${username}`)
  console.log(`   В главный кошелек: ${walletAmount}`)
  console.log(`   В капитализацию: ${capitalAmount}`)
  console.log(`   В проект: ${projectAmount}`)

  const convertResult = await blockchain.api.transact(
    {
      actions: [
        {
          account: CapitalContract.contractName.production,
          name: CapitalContract.Actions.ConvertSegment.actionName,
          authorization: [{ actor: coopname, permission: 'active' }],
          data: convertSegmentData,
        },
      ],
    },
    {
      blocksBehind: 3,
      expireSeconds: 30,
    },
  )

  getTotalRamUsage(convertResult)
  expect(convertResult.transaction_id).toBeDefined()
  console.log('✅ Сегмент конвертирован:', convertHash)

  // Получаем сегмент после конвертации
  const segmentAfter = await getSegment(blockchain, coopname, projectHash, username)

  // Проверяем изменение статуса сегмента на COMPLETED
  expect(segmentAfter.status).toBe('completed')
  console.log('🔍 Статус сегмента после конвертации:', segmentAfter.status)

  console.log('\n📊 Результаты после конвертации сегмента:')
  console.log('▶ Сегмент до:', segmentBefore)
  console.log('▶ Сегмент после:', segmentAfter)

  console.log(`\n✅ Процесс конвертации сегмента завершен успешно!`)

  return {
    convertHash,
    segmentBefore,
    segmentAfter,
    transactionId: convertResult.transaction_id,
  }
}
