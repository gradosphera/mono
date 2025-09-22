import type { Queries } from '@coopenomics/sdk';

export type ITimeIssuesPagination =
  Queries.Capital.GetTimeEntriesByIssues.IOutput[typeof Queries.Capital.GetTimeEntriesByIssues.name];

export type ITimeIssue = Queries.Capital.GetTimeEntriesByIssues.IOutput[typeof Queries.Capital.GetTimeEntriesByIssues.name]['items'][0];

export type IGetTimeIssuesInput = Queries.Capital.GetTimeEntriesByIssues.IInput;
