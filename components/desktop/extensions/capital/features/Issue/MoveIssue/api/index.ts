import type { IIssue } from 'app/extensions/capital/entities/Issue/model';
import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

export interface IMoveIssueToComponentInput {
  issue_hash: string;
  target_project_hash: string;
}

async function moveIssueToComponent(data: IMoveIssueToComponentInput): Promise<IIssue> {
  const { [Mutations.Capital.MoveIssueToComponent.name]: result } =
    await client.Mutation(Mutations.Capital.MoveIssueToComponent.mutation, {
      variables: { data },
    });
  return result as IIssue;
}

export const api = {
  moveIssueToComponent,
};
