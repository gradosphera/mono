import { expect } from 'vitest'
import { CapitalContract } from 'cooptypes'
import type Blockchain from '../../blockchain'
import { getTotalRamUsage } from '../../utils/getTotalRamUsage'
import { makeCombinedChecksum256NameIndexKey } from '../shared/combinedKeys'

/**
 * Функция для расчета голосов участника по методу Водянова
 * @param blockchain экземпляр блокчейна
 * @param data данные для расчета голосов
 */
export async function processCalculateVotes(
  blockchain: Blockchain,
  data: CapitalContract.Actions.CalculateVotes.IFinalVoting,
) {
  const { coopname, username, project_hash } = data

  console.log(`\n🧮 Начало расчета голосов для участника ${username} в проекте ${project_hash}`)

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

  // Состояние до: данные сегмента участника
  const segmentKey = makeCombinedChecksum256NameIndexKey(project_hash, username)
  const segmentBefore = (await blockchain.getTableRows(
    CapitalContract.contractName.production,
    coopname,
    'segments',
    1,
    segmentKey,
    segmentKey,
    3,
    'i128',
  ))[0]

  // console.log('📊 Состояние до расчета голосов:')
  // console.log('▶ Статус проекта:', projectBefore.status)
  // console.log('▶ Голосов получено:', projectBefore.voting.votes_received)
  // console.log('▶ Всего участников голосования:', projectBefore.voting.total_voters)
  // console.log(`▶ Сегмент участника ${username}:`)
  // console.log('  - voting_bonus:', segmentBefore.voting_bonus)
  // console.log('  - equal_author_bonus:', segmentBefore.equal_author_bonus)
  // console.log('  - direct_creator_bonus:', segmentBefore.direct_creator_bonus)
  // console.log('  - total_segment_cost:', segmentBefore.total_segment_cost)

  // Отправляем транзакцию расчета голосов
  const txResult = await blockchain.api.transact(
    {
      actions: [
        {
          account: CapitalContract.contractName.production,
          name: CapitalContract.Actions.CalculateVotes.actionName,
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

  // Состояние после: данные сегмента участника
  const segmentAfter = (await blockchain.getTableRows(
    CapitalContract.contractName.production,
    coopname,
    'segments',
    1,
    segmentKey,
    segmentKey,
    3,
    'i128',
  ))[0]

  console.log('📊 Состояние после расчета голосов:')
  console.log('▶ Статус проекта:', projectAfter.status)
  console.log(`▶ Сегмент участника ${username}:`)
  console.log('  - voting_bonus:', segmentAfter.voting_bonus)
  console.log('  - total_voting_pool:', projectAfter.voting.amounts.total_voting_pool)
  console.log('  - active_voting_amount:', projectAfter.voting.amounts.active_voting_amount)
  console.log('  - equal_voting_amount:', projectAfter.voting.amounts.equal_voting_amount)

  return {
    txId: txResult.transaction_id,
    projectBefore,
    projectAfter,
    segmentBefore,
    segmentAfter,
  }
}
