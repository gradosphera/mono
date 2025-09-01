import { expect } from 'vitest'
import { CapitalContract } from 'cooptypes'
import { getTotalRamUsage } from '../../utils/getTotalRamUsage'
import type Blockchain from '../../blockchain'

export async function refreshSegment(
  blockchain: Blockchain,
  coopname: string,
  projectHash: string,
  username: string,
) {
  console.log(`\n🔄 Обновляем сегмент CRPS для ${username} в проекте ${projectHash}`)

  // Получение данных сегмента перед обновлением
  const prevSegment = (await blockchain.getTableRows(
    CapitalContract.contractName.production,
    coopname,
    CapitalContract.Tables.Segments.tableName,
    1000,
  )).filter((s: any) => s.project_hash === projectHash && s.username === username)[0]

  // console.log('📊 Сегмент до обновления:', prevSegment)

  // Обновление сегмента через rfrshsegment
  const refreshSegmentData: CapitalContract.Actions.RefreshSegment.IRefreshSegment = {
    coopname,
    project_hash: projectHash,
    username,
  }

  const refreshResult = await blockchain.transactWithLogs(
    [
      {
        account: CapitalContract.contractName.production,
        name: CapitalContract.Actions.RefreshSegment.actionName,
        authorization: [{ actor: coopname, permission: 'active' }],
        data: refreshSegmentData,
      },
    ],
  )

  getTotalRamUsage(refreshResult)
  expect(refreshResult.transaction_id).toBeDefined()

  // Получение обновленного сегмента
  const updatedSegment = (await blockchain.getTableRows(
    CapitalContract.contractName.production,
    coopname,
    CapitalContract.Tables.Segments.tableName,
    1000,
  )).filter((s: any) => s.project_hash === projectHash && s.username === username)[0]

  // console.log('📊 Сегмент после обновления:', updatedSegment)
  console.log(`✅ Сегмент для ${username} обновлен успешно!`)

  return {
    transactionId: refreshResult.transaction_id,
    prevSegment,
    updatedSegment,
  }
}
