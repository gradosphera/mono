import { api } from '../api';
import { useCommitStore } from 'app/extensions/capital/entities/Commit/model';
import { Mutations } from '@coopenomics/sdk';

export type IDeclineCommitInput = Mutations.Capital.DeclineCommit.IInput['data'];
export type IDeclineCommitOutput =
  Mutations.Capital.DeclineCommit.IOutput[typeof Mutations.Capital.DeclineCommit.name];

export function useDeclineCommit() {
  const store = useCommitStore();

  async function declineCommit(
    data: IDeclineCommitInput,
  ): Promise<IDeclineCommitOutput> {
    const commit = await api.declineCommit(data);

    // Обновляем коммит в списке локально
    store.updateCommitInList(commit);

    return commit;
  }

  return { declineCommit };
}
