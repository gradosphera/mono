import { expect } from 'vitest'
import { CapitalContract } from 'cooptypes'
import type Blockchain from '../../blockchain'
import { getTotalRamUsage } from '../../utils/getTotalRamUsage'

export async function processStartVoting(
  blockchain: Blockchain,
  data: CapitalContract.Actions.StartVoting.IStartVoting,
) {
  const { coopname, project_hash } = data

  // Состояние до: данные проекта
  const projectBefore = (await blockchain.getTableRows(
    CapitalContract.contractName.production,
    coopname,
    'projects',
    1,
    project_hash,
    project_hash,
    3,
    'sha256',
  ))[0]
  console.log('projectBefore: ', projectBefore)
  // 1) Запускаем голосование по проекту
  const txStart = await blockchain.api.transact(
    {
      actions: [
        {
          account: CapitalContract.contractName.production,
          name: CapitalContract.Actions.StartVoting.actionName,
          authorization: [{ actor: coopname, permission: 'active' }],
          data,
        },
      ],
    },
    { blocksBehind: 3, expireSeconds: 30 },
  )
  getTotalRamUsage(txStart)
  expect(txStart.transaction_id).toBeDefined()

  // Состояние после: данные проекта
  const projectAfter = (await blockchain.getTableRows(
    CapitalContract.contractName.production,
    coopname,
    'projects',
    1,
    project_hash,
    project_hash,
    3,
    'sha256',
  ))[0]
  console.log('projectAfter: ', projectAfter)
  return {
    projectHash: project_hash,
    txStartId: txStart.transaction_id,
    projectBefore,
    projectAfter,
  }
}
