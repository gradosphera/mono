import { expect } from 'vitest'
import { CapitalContract } from 'cooptypes'
import type Blockchain from '../../blockchain'
import { getTotalRamUsage } from '../../utils/getTotalRamUsage'

export async function processDeleteProject(
  blockchain: Blockchain,
  coopname: string,
  project_hash: string,
) {
  // Состояние проекта до удаления
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

  const data: CapitalContract.Actions.DeleteProject.IDeleteProject = {
    coopname,
    project_hash,
  }

  // Выполняем удаление проекта
  const txDelete = await blockchain.api.transact(
    {
      actions: [
        {
          account: CapitalContract.contractName.production,
          name: CapitalContract.Actions.DeleteProject.actionName,
          authorization: [{ actor: coopname, permission: 'active' }],
          data,
        },
      ],
    },
    { blocksBehind: 3, expireSeconds: 30 },
  )
  getTotalRamUsage(txDelete)
  expect(txDelete.transaction_id).toBeDefined()

  // Проверяем что проект удален
  const projectsAfter = await blockchain.getTableRows(
    CapitalContract.contractName.production,
    coopname,
    'projects',
    1,
    project_hash,
    project_hash,
    3,
    'sha256',
  )

  return {
    transactionId: txDelete.transaction_id,
    projectBefore,
    projectAfter: projectsAfter[0] || null, // null если удален
  }
}
