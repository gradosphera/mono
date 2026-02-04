import { SovietContract } from 'cooptypes'
import type Blockchain from '../../blockchain'
import { processDecision } from './processDecision'

export async function processLastDecision(blockchain: Blockchain, coopname: string) {
  // Получаем последнее решение для голосования
  const decisions = await blockchain.getTableRows(
    SovietContract.contractName.production,
    coopname,
    SovietContract.Tables.Decisions.tableName,
    100, // берем больше, чтобы гарантированно получить все
  )
  console.log('Активные вопросы на повестке: ', decisions)
  // Берем ПОСЛЕДНИЙ элемент массива (самый свежий)
  const lastDecision = decisions[decisions.length - 1]

  // 3. Голосуем за решение совета
  await processDecision(blockchain, lastDecision.id)
}
