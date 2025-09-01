import { SovietContract } from 'cooptypes'
import { getTotalRamUsage } from '../../utils/getTotalRamUsage'
import { fakeDocument } from '../shared/fakeDocument'
import type Blockchain from '../../blockchain'
import { fakeVote } from '../shared/fakeVote'

export async function processDecision(blockchain: Blockchain, decisionId: number) {
  const voteData: SovietContract.Actions.Decisions.VoteFor.IVoteForDecision = fakeVote
  voteData.decision_id = decisionId

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
}
