import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';
import type { IDeleteBranchInput } from 'src/entities/Branch/model';

export async function deleteBranch(data: IDeleteBranchInput): Promise<boolean> {
  const { [Mutations.Branches.DeleteBranch.name]: result } = await client.Mutation(
    Mutations.Branches.DeleteBranch.mutation,
    {
      variables: {
        data
      }
    }
  );
  return result;
}
