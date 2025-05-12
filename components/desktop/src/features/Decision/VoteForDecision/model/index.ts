import { TransactResult } from '@wharfkit/session';
import { SovietContract } from 'cooptypes';
import { useSessionStore } from 'src/entities/Session';
import { useGlobalStore } from 'src/shared/store';
import { useSystemStore } from 'src/entities/System/model';
import { client } from 'src/shared/api/client';

export function useVoteForDecision() {
  const { info } = useSystemStore()

  async function voteForDecision(
    decision_id: number
  ): Promise<TransactResult | undefined> {
    const session = useSessionStore();

    // Создаем подпись голоса с помощью SDK Vote
    const voteData = await client.Vote.voteFor(
      info.coopname,
      session.username,
      decision_id
    );
    // Отправляем транзакцию с подписанными данными
    const result = useGlobalStore().transact({
      account: SovietContract.contractName.production,
      name: SovietContract.Actions.Decisions.VoteFor.actionName,
      authorization: [
        {
          actor: session.username,
          permission: 'active',
        },
      ],
      data: voteData,
    });

    return result;
  }
  return { voteForDecision };
}
