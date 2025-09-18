import type {
  IUpdateIssueInput,
  IUpdateIssueOutput,
} from 'app/extensions/capital/entities/Issue/model';
import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

async function updateIssue(
  data: IUpdateIssueInput,
): Promise<IUpdateIssueOutput> {
  const { [Mutations.Capital.UpdateIssue.name]: result } =
    await client.Mutation(Mutations.Capital.UpdateIssue.mutation, {
      variables: {
        data,
      },
    });

  return result;
}

export const api = {
  updateIssue,
};
