import { expect } from 'vitest'
import { CapitalContract } from 'cooptypes'
import type Blockchain from '../../blockchain'
import { getTotalRamUsage } from '../../utils/getTotalRamUsage'
import { processLastDecision } from '../soviet/processLastDecision'
import { processApprove } from './processApprove'
import { getSegment } from './getSegment'

export async function processCreateProjectProperty(
  blockchain: Blockchain,
  data: CapitalContract.Actions.CreateProjectProperty.ICreateProjectProperty,
) {
  const { coopname, username, project_hash, property_hash } = data

  // Состояния до: сегмент проекта и данные проекта
  const segmentBefore = await getSegment(blockchain, coopname, project_hash, username)
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

  // 1) Создаём проектное предложение имущественного взноса
  const txCreate = await blockchain.api.transact(
    {
      actions: [
        {
          account: CapitalContract.contractName.production,
          name: CapitalContract.Actions.CreateProjectProperty.actionName,
          authorization: [{ actor: coopname, permission: 'active' }],
          data,
        },
      ],
    },
    { blocksBehind: 3, expireSeconds: 30 },
  )
  getTotalRamUsage(txCreate)
  expect(txCreate.transaction_id).toBeDefined()

  // 2) Подтверждение одобрения председателем (через soviet)
  await processApprove(blockchain as any, coopname, property_hash as unknown as string)

  // Состояния после: сегмент проекта и данные проекта
  const segmentAfter = await getSegment(blockchain, coopname, project_hash, username)
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

  return {
    propertyHash: property_hash,
    txCreateId: txCreate.transaction_id,
    segmentBefore,
    segmentAfter,
    projectBefore,
    projectAfter,
  }
}
