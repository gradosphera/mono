import { SovietContract } from 'cooptypes'
import type Blockchain from '../../blockchain'
import { processDecision } from './processDecision'

export async function processLastDecision(blockchain: Blockchain, coopname: string) {
  // Получаем последнее решение для голосования
  const decisions = await blockchain.getTableRows(
    SovietContract.contractName.production,
    coopname,
    SovietContract.Tables.Decisions.tableName,
    1,
  )
  const lastDecision = decisions[0]

  // 3. Голосуем за решение совета
  await processDecision(blockchain, lastDecision.id)
}
