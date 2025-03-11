import { expect } from 'vitest'
import { SovietContract } from 'cooptypes'
import { getTotalRamUsage } from '../../utils/getTotalRamUsage'

export async function signAgreement(
  blockchain: any,
  coopname: string,
  username: string,
  agreement_type: string,
  fakeDocument: any,
) {
  const data: SovietContract.Actions.Agreements.SendAgreement.ISendAgreement = {
    coopname,
    administrator: coopname,
    username,
    agreement_type,
    document: fakeDocument,
  }

  const result = await blockchain.api.transact(
    {
      actions: [
        {
          account: SovietContract.contractName.production,
          name: SovietContract.Actions.Agreements.SendAgreement.actionName,
          authorization: [{ actor: username, permission: 'active' }],
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

  return result.transaction_id
}
