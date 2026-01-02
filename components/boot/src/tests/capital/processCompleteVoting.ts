import { expect } from 'vitest'
import { CapitalContract } from 'cooptypes'
import type Blockchain from '../../blockchain'
import { getTotalRamUsage } from '../../utils/getTotalRamUsage'

/**
 * Функция для завершения голосования по проекту
 * @param blockchain экземпляр блокчейна
 * @param data данные для завершения голосования
 */
export async function processCompleteVoting(
  blockchain: Blockchain,
  data: CapitalContract.Actions.CompleteVoting.ICompleteVoting,
) {
  const { coopname, project_hash } = data

  console.log(`\n✅ Начало завершения голосования для проекта ${project_hash}`)

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

  console.log('📊 Состояние до завершения голосования:')
  console.log('▶ Статус проекта:', projectBefore.status)
  console.log('▶ Голосов получено:', projectBefore.voting.votes_received)
  console.log('▶ Всего участников голосования:', projectBefore.voting.total_voters)
  console.log('▶ Дедлайн голосования:', projectBefore.voting.voting_deadline)

  // Отправляем транзакцию завершения голосования
  const txResult = await blockchain.api.transact(
    {
      actions: [
        {
          account: CapitalContract.contractName.production,
          name: CapitalContract.Actions.CompleteVoting.actionName,
          authorization: [{ actor: coopname, permission: 'active' }],
          data,
        },
      ],
    },
    { blocksBehind: 3, expireSeconds: 30 },
  )
  getTotalRamUsage(txResult)
  expect(txResult.transaction_id).toBeDefined()

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

  console.log('📊 Состояние после завершения голосования:')
  console.log('▶ Статус проекта:', projectAfter.status)
  console.log('▶ Голосов получено:', projectAfter.voting.votes_received)
  console.log('▶ Всего участников голосования:', projectAfter.voting.total_voters)

  // Проверяем что статус изменился на result
  expect(projectAfter.status).toBe('result')

  console.log(`\n✅ Голосование для проекта ${project_hash} успешно завершено!`)

  return {
    projectHash: project_hash,
    txId: txResult.transaction_id,
    projectBefore,
    projectAfter,
  }
}
