import { TransactResult } from '@wharfkit/session';
import { SovietContract } from 'cooptypes';
import { useSessionStore } from 'src/entities/Session';
import { COOPNAME } from 'src/shared/config';
import { useGlobalStore } from 'src/shared/store';

export function useVoteForDecision() {
  async function voteForDecision(
    decision_id: number
  ): Promise<TransactResult | undefined> {
    const session = useSessionStore();

    const result = useGlobalStore().transact({
      account: SovietContract.contractName.production,
      name: SovietContract.Actions.Decisions.VoteFor.actionName,
      authorization: [
        {
          actor: session.username,
          permission: 'active',
        },
      ],
      data: {
        member: session.username,
        coopname: COOPNAME,
        decision_id: decision_id,
      },
    });

    return result;
  }
  return { voteForDecision };
}
