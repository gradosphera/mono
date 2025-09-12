import { client } from 'src/shared/api/client';
import { Queries } from '@coopenomics/sdk';
import type { IIssuesPagination, IGetIssuesInput } from '../model/types';

async function loadIssues(data: IGetIssuesInput): Promise<IIssuesPagination> {
  const { [Queries.Capital.GetIssues.name]: output } = await client.Query(
    Queries.Capital.GetIssues.query,
    {
      variables: data,
    },
  );
  return output;
}

export const api = {
  loadIssues,
};
