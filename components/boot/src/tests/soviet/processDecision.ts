import { SovietContract } from 'cooptypes'
import { expect } from 'vitest'
import { getTotalRamUsage } from '../../utils/getTotalRamUsage'
import { fakeDocument } from './fakeDocument'

export async function processDecision(blockchain: any, decisionId: number) {
  const voteData: SovietContract.Actions.Decisions.VoteFor.IVoteForDecision = {
    coopname: 'voskhod',
    member: 'ant',
    decision_id: decisionId,
  }

  const authData: SovietContract.Actions.Decisions.Authorize.IAuthorize = {
    coopname: 'voskhod',
    chairman: 'ant',
    decision_id: decisionId,
    document: fakeDocument,
  }

  const execData: SovietContract.Actions.Decisions.Exec.IExec = {
    executer: 'ant',
    coopname: 'voskhod',
    decision_id: decisionId,
  }

  const result = await blockchain.api.transact(
    {
      actions: [
        {
          account: SovietContract.contractName.production,
          name: SovietContract.Actions.Decisions.VoteFor.actionName,
          authorization: [{ actor: 'ant', permission: 'active' }],
          data: voteData,
        },
        {
          account: SovietContract.contractName.production,
          name: SovietContract.Actions.Decisions.Authorize.actionName,
          authorization: [{ actor: 'ant', permission: 'active' }],
          data: authData,
        },
        {
          account: SovietContract.contractName.production,
          name: SovietContract.Actions.Decisions.Exec.actionName,
          authorization: [{ actor: 'ant', permission: 'active' }],
          data: execData,
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
}
