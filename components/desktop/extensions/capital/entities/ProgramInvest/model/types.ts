import type { Queries, Mutations } from '@coopenomics/sdk';

export type IProgramInvestsPagination =
  Queries.Capital.GetProgramInvests.IOutput[typeof Queries.Capital.GetProgramInvests.name];

export type IGetProgramInvestsInput = Queries.Capital.GetProgramInvests.IInput;
export type ICreateProgramInvestInput =
  Mutations.Capital.CreateProgramProperty.IInput['data'];
export type ICreateProgramInvestOutput =
  Mutations.Capital.CreateProgramProperty.IOutput[typeof Mutations.Capital.CreateProgramProperty.name];
