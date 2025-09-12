import type { Queries, Mutations } from '@coopenomics/sdk';

export type ICyclesPagination =
  Queries.Capital.GetCycles.IOutput[typeof Queries.Capital.GetCycles.name];

export type IGetCyclesInput = Queries.Capital.GetCycles.IInput;
export type ICreateCycleInput = Mutations.Capital.CreateCycle.IInput['data'];
export type ICreateCycleOutput =
  Mutations.Capital.CreateCycle.IOutput[typeof Mutations.Capital.CreateCycle.name];
