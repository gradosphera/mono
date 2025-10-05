import type { Queries, Mutations, Zeus } from '@coopenomics/sdk';

export type IIssuesPagination =
  Queries.Capital.GetIssues.IOutput[typeof Queries.Capital.GetIssues.name];

export type IIssue = Zeus.ModelTypes['CapitalIssue'];

// Тип разрешений для задачи
export type IIssuePermissions = Zeus.ModelTypes['CapitalIssuePermissions'];

export type IGetIssuesInput = Queries.Capital.GetIssues.IInput;
export type IGetIssueInput = Queries.Capital.GetIssue.IInput['data'];
export type IGetIssueOutput =
  Queries.Capital.GetIssue.IOutput[typeof Queries.Capital.GetIssue.name];
export type ICreateIssueInput = Mutations.Capital.CreateIssue.IInput['data'];
export type ICreateIssueOutput =
  Mutations.Capital.CreateIssue.IOutput[typeof Mutations.Capital.CreateIssue.name];

export type IUpdateIssueInput = Mutations.Capital.UpdateIssue.IInput['data'];
export type IUpdateIssueOutput =
  Mutations.Capital.UpdateIssue.IOutput[typeof Mutations.Capital.UpdateIssue.name];

export type IDeleteIssueInput = Mutations.Capital.DeleteIssue.IInput['data'];
export type IDeleteIssueOutput =
  Mutations.Capital.DeleteIssue.IOutput[typeof Mutations.Capital.DeleteIssue.name];
