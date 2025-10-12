import type { IApproveCommitOutput } from '../model';
import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

async function approveCommit(
  data: Mutations.Capital.ApproveCommit.IInput['data'],
): Promise<IApproveCommitOutput> {
  const { [Mutations.Capital.ApproveCommit.name]: result } =
    await client.Mutation(Mutations.Capital.ApproveCommit.mutation, {
      variables: {
        data,
      },
    });

  return result;
}

export const api = {
  approveCommit,
};
