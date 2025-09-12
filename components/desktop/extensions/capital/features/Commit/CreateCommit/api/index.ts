import type {
  ICreateCommitOutput,
  ICreateCommitInput,
} from 'app/extensions/capital/entities/Commit/model';
import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

async function createCommit(
  data: ICreateCommitInput,
): Promise<ICreateCommitOutput> {
  const { [Mutations.Capital.CreateCommit.name]: result } =
    await client.Mutation(Mutations.Capital.CreateCommit.mutation, {
      variables: {
        data,
      },
    });

  return result;
}

export const api = {
  createCommit,
};
