import type { Queries, Mutations, Zeus } from '@coopenomics/sdk';

export type ICommitsPagination =
  Queries.Capital.GetCommits.IOutput[typeof Queries.Capital.GetCommits.name];

export type ICommit = Zeus.ModelTypes['CapitalCommit'];

export type IGetCommitsInput = Queries.Capital.GetCommits.IInput;
export type IGetCommitsFilter = IGetCommitsInput['filter'];
export type IGetCommitInput = Queries.Capital.GetCommit.IInput['data'];
export type IGetCommitOutput =
  Queries.Capital.GetCommit.IOutput[typeof Queries.Capital.GetCommit.name];
export type ICreateCommitInput = Mutations.Capital.CreateCommit.IInput['data'];
export type ICreateCommitOutput =
  Mutations.Capital.CreateCommit.IOutput[typeof Mutations.Capital.CreateCommit.name];
