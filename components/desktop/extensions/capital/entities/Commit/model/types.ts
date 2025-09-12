import type { Queries, Mutations } from '@coopenomics/sdk';

export type ICommitsPagination =
  Queries.Capital.GetCommits.IOutput[typeof Queries.Capital.GetCommits.name];

export type IGetCommitsInput = Queries.Capital.GetCommits.IInput;
export type ICreateCommitInput = Mutations.Capital.CreateCommit.IInput['data'];
export type ICreateCommitOutput =
  Mutations.Capital.CreateCommit.IOutput[typeof Mutations.Capital.CreateCommit.name];
