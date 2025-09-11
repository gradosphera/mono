import type { Queries, Mutations } from '@coopenomics/sdk';

export type IResult =
  Queries.Capital.GetResult.IOutput[typeof Queries.Capital.GetResult.name];
export type IResultsPagination =
  Queries.Capital.GetResults.IOutput[typeof Queries.Capital.GetResults.name];

export type IGetResultInput = Queries.Capital.GetResult.IInput['data'];
export type IGetResultsInput = Queries.Capital.GetResults.IInput;
export type IPushResultInput = Mutations.Capital.PushResult.IInput['data'];
export type IPushResultOutput =
  Mutations.Capital.PushResult.IOutput[typeof Mutations.Capital.PushResult.name];
