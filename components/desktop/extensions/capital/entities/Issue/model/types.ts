import type { Queries, Mutations } from '@coopenomics/sdk';

export type IIssuesPagination =
  Queries.Capital.GetIssues.IOutput[typeof Queries.Capital.GetIssues.name];

export type IGetIssuesInput = Queries.Capital.GetIssues.IInput;
export type ICreateIssueInput = Mutations.Capital.CreateIssue.IInput['data'];
export type ICreateIssueOutput =
  Mutations.Capital.CreateIssue.IOutput[typeof Mutations.Capital.CreateIssue.name];
