import { expect } from 'vitest'
import { SovietContract } from 'cooptypes'
import { getTotalRamUsage } from '../../utils/getTotalRamUsage'
import { fakeDocument } from '../shared/fakeDocument'

export async function processApprove(blockchain: any, coopname: string, approvalHash: string) {
  fakeDocument.signatures[0].signer = 'ant'
  
  const data: SovietContract.Actions.Approves.ConfirmApprove.IConfirmApprove = {
    coopname,
    approval_hash: approvalHash,
    approved_document: fakeDocument,
  }

  const result = await blockchain.api.transact(
    {
      actions: [
        {
          account: SovietContract.contractName.production,
          name: SovietContract.Actions.Approves.ConfirmApprove.actionName,
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
