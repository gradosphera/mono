import { expect } from 'vitest'
import { CapitalContract } from 'cooptypes'
import { getTotalRamUsage } from '../../utils/getTotalRamUsage'

export async function processMasterApprove(
  blockchain: any,
  coopname: string,
  commitHash: string,
  master: string,
) {
  const data: CapitalContract.Actions.CommitApprove.ICommitApprove = {
    coopname,
    master,
    commit_hash: commitHash,
  }

  const result = await blockchain.api.transact(
    {
      actions: [
        {
          account: CapitalContract.contractName.production,
          name: CapitalContract.Actions.CommitApprove.actionName,
          authorization: [{ actor: coopname, permission: 'active' }],
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

  return result
}
