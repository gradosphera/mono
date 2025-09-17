import type { Queries, Mutations, Zeus } from '@coopenomics/sdk';

export type IIssuesPagination =
  Queries.Capital.GetIssues.IOutput[typeof Queries.Capital.GetIssues.name];

export type IIssue = Zeus.ModelTypes['CapitalIssue'];

export type IGetIssuesInput = Queries.Capital.GetIssues.IInput;
export type IGetIssueInput = Queries.Capital.GetIssue.IInput['data'];
export type IGetIssueOutput =
  Queries.Capital.GetIssue.IOutput[typeof Queries.Capital.GetIssue.name];
export type ICreateIssueInput = Mutations.Capital.CreateIssue.IInput['data'];
export type ICreateIssueOutput =
  Mutations.Capital.CreateIssue.IOutput[typeof Mutations.Capital.CreateIssue.name];
