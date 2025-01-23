import { TransactResult } from '@wharfkit/session';
import { SovietContract } from 'cooptypes';
import { useSessionStore } from 'src/entities/Session';
import { useGlobalStore } from 'src/shared/store';
import { useSystemStore } from 'src/entities/System/model';

export function useVoteForDecision() {
  const { info } = useSystemStore()

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
        coopname: info.coopname,
        decision_id: decision_id,
      },
    });

    return result;
  }
  return { voteForDecision };
}
