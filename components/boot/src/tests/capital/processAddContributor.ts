import { expect } from 'vitest'
import { CapitalContract } from 'cooptypes'
import type Blockchain from '../../blockchain'
import { getTotalRamUsage } from '../../utils/getTotalRamUsage'
import { getSegment } from './getSegment'

export async function processAddContributor(
  blockchain: Blockchain,
  coopname: string,
  project_hash: string,
  username: string,
) {
  // Состояние сегмента до добавления (может не существовать)
  let segmentBefore: any = null
  try {
    segmentBefore = await getSegment(blockchain, coopname, project_hash, username)
  }
  catch (error) {
    // Сегмент может не существовать - это нормально
  }

  const data: CapitalContract.Actions.AddContributor.IAddContributor = {
    coopname,
    project_hash,
    username,
  }

  // Выполняем добавление участника в проект
  const txAdd = await blockchain.api.transact(
    {
      actions: [
        {
          account: CapitalContract.contractName.production,
          name: CapitalContract.Actions.AddContributor.actionName,
          authorization: [{ actor: coopname, permission: 'active' }],
          data,
        },
      ],
    },
    { blocksBehind: 3, expireSeconds: 30 },
  )
  getTotalRamUsage(txAdd)
  expect(txAdd.transaction_id).toBeDefined()

  // Состояние сегмента после добавления
  const segmentAfter = await getSegment(blockchain, coopname, project_hash, username)

  return {
    transactionId: txAdd.transaction_id,
    segmentBefore,
    segmentAfter,
  }
}
