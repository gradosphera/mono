import type {
  ICreateIssueOutput,
  ICreateIssueInput,
} from 'app/extensions/capital/entities/Issue/model';
import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

async function createIssue(
  data: ICreateIssueInput,
): Promise<ICreateIssueOutput> {
  const { [Mutations.Capital.CreateIssue.name]: result } =
    await client.Mutation(Mutations.Capital.CreateIssue.mutation, {
      variables: {
        data,
      },
    });

  return result;
}

export const api = {
  createIssue,
};
