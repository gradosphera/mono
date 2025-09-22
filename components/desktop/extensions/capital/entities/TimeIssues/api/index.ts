import { client } from 'src/shared/api/client';
import { Queries } from '@coopenomics/sdk';
import type {
  IGetTimeIssuesInput,
  ITimeIssuesPagination,
} from '../model/types';

async function loadTimeIssues(
  data: IGetTimeIssuesInput,
): Promise<ITimeIssuesPagination> {
  const { [Queries.Capital.GetTimeEntriesByIssues.name]: output } = await client.Query(
    Queries.Capital.GetTimeEntriesByIssues.query,
    {
      variables: data,
    },
  );
  return output;
}

export const api = {
  loadTimeIssues,
};
