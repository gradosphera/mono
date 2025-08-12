import { CapitalContract } from 'cooptypes'
import { expect } from 'vitest'
import type Blockchain from '../../blockchain'
import { getTotalRamUsage } from '../../utils/getTotalRamUsage'
import { makeCombinedChecksum256NameIndexKey } from '../shared/combinedKeys'

export async function addAuthor(blockchain: Blockchain, coopname: string, project_hash: string, author: string) {
  const data: CapitalContract.Actions.AddAuthor.IAddAuthor = {
    coopname,
    application: coopname,
    project_hash,
    author,
  }

  const result = await blockchain.api.transact(
    {
      actions: [
        {
          account: CapitalContract.contractName.production,
          name: CapitalContract.Actions.AddAuthor.actionName,
          authorization: [
            {
              actor: coopname,
              permission: 'active',
            },
          ],
          data,
        },
      ],
    },
    {
      blocksBehind: 3,
      expireSeconds: 30,
    },
  )
  getTotalRamUsage(result)
  expect(result.transaction_id).toBeDefined()

  const key = makeCombinedChecksum256NameIndexKey(project_hash, author)
  const rows = (await blockchain.getTableRows(
    CapitalContract.contractName.production,
    coopname,
    CapitalContract.Tables.Segments.tableName,
    1000,
    key,
    key,
    3,
    'i128',
  ))

  const segment = rows[0]

  console.log('segment: ', segment)
  expect(segment).toBeDefined()
  expect(segment.username).toBe(author)
  expect(segment.project_hash).toBe(project_hash)
  expect(segment.is_author).toBe(1)

  const project = (await blockchain.getTableRows(
    CapitalContract.contractName.production,
    coopname,
    CapitalContract.Tables.Projects.tableName,
    1000,
    project_hash,
    project_hash,
    3,
    'sha256',
  ))[0]

  expect(project).toBeDefined()

  return {
    project,
    segment,
  }
}
