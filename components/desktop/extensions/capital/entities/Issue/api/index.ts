import { client } from 'src/shared/api/client';
import { Queries } from '@coopenomics/sdk';
import type {
  IIssuesPagination,
  IGetIssuesInput,
  IGetIssueInput,
  IGetIssueOutput,
  IGetIssueLogsInput,
  IGetIssueLogsOutput,
} from '../model/types';

async function loadIssues(data: IGetIssuesInput): Promise<IIssuesPagination> {
  const { [Queries.Capital.GetIssues.name]: output } = await client.Query(
    Queries.Capital.GetIssues.query,
    {
      variables: data,
    },
  );
  return output;
}

async function loadIssue(data: IGetIssueInput): Promise<IGetIssueOutput> {
  const { [Queries.Capital.GetIssue.name]: output } = await client.Query(
    Queries.Capital.GetIssue.query,
    {
      variables: {
        data,
      },
    },
  );
  return output;
}

async function loadIssueLogs(data: IGetIssueLogsInput): Promise<IGetIssueLogsOutput> {
  const { [Queries.Capital.GetIssueLogs.name]: output } = await client.Query(
    Queries.Capital.GetIssueLogs.query,
    {
      variables: data,
    },
  );
  return output;
}

export const api = {
  loadIssues,
  loadIssue,
  loadIssueLogs,
};
