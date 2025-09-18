import type {
  IDeleteIssueOutput,
  IDeleteIssueInput,
} from 'app/extensions/capital/entities/Issue/model';
import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

async function deleteIssue(
  data: IDeleteIssueInput,
): Promise<IDeleteIssueOutput> {
  const { [Mutations.Capital.DeleteIssue.name]: result } =
    await client.Mutation(Mutations.Capital.DeleteIssue.mutation, {
      variables: {
        data,
      },
    });

  return result;
}

export const api = {
  deleteIssue,
};
