import { api } from '../api';
import { useCommitStore } from 'app/extensions/capital/entities/Commit/model';
import { Mutations } from '@coopenomics/sdk';

export type IApproveCommitInput = Mutations.Capital.ApproveCommit.IInput['data'];
export type IApproveCommitOutput =
  Mutations.Capital.ApproveCommit.IOutput[typeof Mutations.Capital.ApproveCommit.name];

export function useApproveCommit() {
  const store = useCommitStore();

  async function approveCommit(
    data: IApproveCommitInput,
  ): Promise<IApproveCommitOutput> {
    const commit = await api.approveCommit(data);

    // Обновляем коммит в списке локально
    store.updateCommitInList(commit);

    return commit;
  }

  return { approveCommit };
}
