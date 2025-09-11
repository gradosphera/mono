import type { Queries, Mutations } from '@coopenomics/sdk';

export type IVote =
  Queries.Capital.GetVote.IOutput[typeof Queries.Capital.GetVote.name];
export type IVotesPagination =
  Queries.Capital.GetVotes.IOutput[typeof Queries.Capital.GetVotes.name];

export type IGetVoteInput = Queries.Capital.GetVote.IInput['data'];
export type IGetVotesInput = Queries.Capital.GetVotes.IInput;
export type ISubmitVoteInput = Mutations.Capital.SubmitVote.IInput['data'];
export type ISubmitVoteOutput =
  Mutations.Capital.SubmitVote.IOutput[typeof Mutations.Capital.SubmitVote.name];
