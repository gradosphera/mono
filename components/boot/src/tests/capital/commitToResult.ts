import { expect } from 'vitest'
import { CapitalContract, SovietContract } from 'cooptypes'
import { getTotalRamUsage } from '../../utils/getTotalRamUsage'
import { generateRandomSHA256 } from '../../utils/randomHash'
import { fakeDocument } from '../shared/fakeDocument'
import { processApprove } from './processApprove'

export async function commitToResult(
  blockchain: any,
  coopname: string,
  projectHash: string,
  creator: string,
  spendHours: number,
) {
  const commitHash = generateRandomSHA256()
  console.log(`\n🔹 Начало коммита: ${commitHash}, проект: ${projectHash}, часы: ${spendHours}`)

  // Получение текущих данных проекта перед коммитом
  const prevProject = (await blockchain.getTableRows(
    CapitalContract.contractName.production,
    coopname,
    'projects',
    1,
    projectHash,
    projectHash,
    3,
    'sha256',
  ))[0] || { spended: '0.0000 RUB' }

  const prevContributor = (await blockchain.getTableRows(
    CapitalContract.contractName.production,
    coopname,
    'contributors',
    1,
    creator,
    creator,
    2,
    'i64',
  ))[0] || { contributed_hours: 0, available: '0.0000 RUB' }

  console.log('📊 Балансы до коммита:')
  console.log('▶ Проект:', prevProject)
  console.log('▶ Контрибьютор:', prevContributor)

  // Обновим состояние проекта после возможной смены статуса
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
  const prevTotalCommits = projectBefore?.counts?.total_commits ?? 0
  const prevCreatorsHours = projectBefore?.fact?.creators_hours ?? 0

  // Создание коммита
  const commitData: CapitalContract.Actions.CreateCommit.ICommit = {
    coopname,
    application: coopname,
    username: creator,
    project_hash: projectHash,
    commit_hash: commitHash,
    creator_hours: spendHours,
  }

  const createCommitResult = await blockchain.api.transact(
    {
      actions: [
        {
          account: CapitalContract.contractName.production,
          name: CapitalContract.Actions.CreateCommit.actionName,
          authorization: [{ actor: coopname, permission: 'active' }],
          data: commitData,
        },
      ],
    },
    {
      blocksBehind: 3,
      expireSeconds: 30,
    },
  )

  getTotalRamUsage(createCommitResult)
  expect(createCommitResult.transaction_id).toBeDefined()

  // Проверка созданного коммита
  const blockchainCommit = (await blockchain.getTableRows(
    CapitalContract.contractName.production,
    coopname,
    'commits',
    1,
    commitHash,
    commitHash,
    3,
    'sha256',
  ))[0]

  console.log('🔍 Коммит после создания:', blockchainCommit)
  expect(blockchainCommit).toBeDefined()
  expect(blockchainCommit.commit_hash).toBe(commitHash)
  expect(blockchainCommit.project_hash).toBe(projectHash)
  expect(blockchainCommit.status).toBe('created')

  // Утверждение коммита
  console.log(`\n✅ Подтверждение коммита ${commitHash}`)
  const approveCommitResult = await processApprove(blockchain, coopname, commitHash)

  // Проверка утвержденного коммита
  const blockchainEmptyCommit = (await blockchain.getTableRows(
    CapitalContract.contractName.production,
    coopname,
    'commits',
    1,
    commitHash,
    commitHash,
    3,
    'sha256',
  ))[0]

  // Коммит удаляем после утверждения
  expect(blockchainEmptyCommit).toBeUndefined()

  // Проверка проекта после утверждения коммита
  const finalProject = (await blockchain.getTableRows(
    CapitalContract.contractName.production,
    coopname,
    'projects',
    1,
    projectHash,
    projectHash,
    3,
    'sha256',
  ))[0]

  const finalContributor = (await blockchain.getTableRows(
    CapitalContract.contractName.production,
    coopname,
    'contributors',
    1,
    creator,
    creator,
    2,
    'i64',
  ))[0]

  console.log('\n📊 Балансы после утверждения коммита:')
  console.log('▶ Проект:', finalProject)

  // Проверки по проекту
  expect(finalProject.counts.total_commits).toBe(prevTotalCommits + 1)
  expect(parseInt(finalProject.fact.creators_hours)).toBe(prevCreatorsHours + spendHours)

  console.log(`\n✅ Коммит ${commitHash} завершен успешно!`)

  return {
    commitHash,
    commit: blockchainCommit,
    transactionId: approveCommitResult.transaction_id,
    finalProject,
    finalContributor,
  }
}
