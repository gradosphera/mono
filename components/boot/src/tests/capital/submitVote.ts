import { expect } from 'vitest'
import { CapitalContract } from 'cooptypes'
import type Blockchain from '../../blockchain'
import { getTotalRamUsage } from '../../utils/getTotalRamUsage'

/**
 * Интерфейс для распределения голосов
 */
export interface VoteInput {
  recipient: string
  amount: string
}

/**
 * Создает равномерное распределение голосующей суммы между участниками (кроме самого голосующего)
 * @param voters список всех участников голосования
 * @param voter участник который голосует (исключается из распределения)
 * @param votingAmount общая голосующая сумма для распределения
 * @returns массив распределения голосов
 */
export function createVoteDistribution(
  voters: string[],
  voter: string,
  votingAmount: string,
): VoteInput[] {
  const otherVoters = voters.filter(v => v !== voter)
  const votingAmountFloat = parseFloat(votingAmount.split(' ')[0])
  const currency = votingAmount.split(' ')[1]

  // Равномерно распределяем сумму между остальными участниками
  const amountPerVoter = votingAmountFloat / otherVoters.length

  return otherVoters.map(recipient => ({
    recipient,
    amount: `${amountPerVoter.toFixed(4)} ${currency}`,
  }))
}

/**
 * Функция для голосования по методу Водянова
 * @param blockchain экземпляр блокчейна
 * @param coopname имя кооператива
 * @param voter участник который голосует
 * @param projectHash хэш проекта
 * @param voteDistribution массив голосов для распределения
 */
export async function submitVote(
  blockchain: Blockchain,
  coopname: string,
  voter: string,
  projectHash: string,
  voteDistribution: VoteInput[],
) {
  console.log(`\n🗳️ Начало голосования участника ${voter}`)

  // Состояние до: данные проекта
  const projectBefore = (await blockchain.getTableRows(
    CapitalContract.contractName.production,
    coopname,
    'projects',
    1,
    projectHash,
    projectHash,
    3,
    'sha256',
  ))[0]

  // Получаем все голоса по проекту до голосования
  const votesBefore = await blockchain.getTableRows(
    CapitalContract.contractName.production,
    coopname,
    'votes',
    100,
    projectHash,
    projectHash,
    2,
    'sha256',
  )

  // Получаем голоса конкретного участника до голосования
  const voterVotesBefore = votesBefore.filter((vote: any) =>
    vote.project_hash === projectHash && vote.voter === voter,
  )

  console.log('📊 Состояние до голосования:')
  console.log('▶ Проект votes_received:', projectBefore.voting.votes_received)
  console.log('▶ Всего голосов в таблице:', votesBefore.filter((v: any) => v.project_hash === projectHash).length)
  console.log('▶ Голосов от участника:', voterVotesBefore.length)

  // Формируем данные для транзакции
  const votes = voteDistribution.map(v => ({
    recipient: v.recipient,
    amount: v.amount,
  }))

  const data: any = {
    coopname,
    voter,
    project_hash: projectHash,
    votes,
  }

  console.log('📝 Данные голосования:', JSON.stringify(data, null, 2))

  // Отправляем транзакцию голосования
  const txResult = await blockchain.api.transact(
    {
      actions: [
        {
          account: CapitalContract.contractName.production,
          name: CapitalContract.Actions.SubmitVote.actionName,
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
    projectHash,
    projectHash,
    3,
    'sha256',
  ))[0]

  // Получаем все голоса по проекту после голосования
  const votesAfter = await blockchain.getTableRows(
    CapitalContract.contractName.production,
    coopname,
    'votes',
    100,
    projectHash,
    projectHash,
    2,
    'sha256',
  )

  // Получаем голоса конкретного участника после голосования
  const voterVotesAfter = votesAfter.filter((vote: any) =>
    vote.project_hash === projectHash && vote.voter === voter,
  )

  console.log('📊 Состояние после голосования:')
  console.log('▶ Проект votes_received:', projectAfter.voting.votes_received)
  console.log('▶ Всего голосов в таблице:', votesAfter.filter((v: any) => v.project_hash === projectHash).length)
  console.log('▶ Голосов от участника:', voterVotesAfter.length)

  return {
    txId: txResult.transaction_id,
    projectBefore,
    projectAfter,
    votesBefore: votesBefore.filter((v: any) => v.project_hash === projectHash),
    votesAfter: votesAfter.filter((v: any) => v.project_hash === projectHash),
    voterVotesBefore,
    voterVotesAfter,
    voteInput: voteDistribution,
  }
}
