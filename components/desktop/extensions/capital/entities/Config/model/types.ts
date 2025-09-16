import type { Queries, Mutations } from '@coopenomics/sdk';

export type IState =
  Queries.Capital.GetState.IOutput[typeof Queries.Capital.GetState.name];

export type IGetStateInput = Queries.Capital.GetState.IInput['data'];
export type ISetConfigInput = Mutations.Capital.SetConfig.IInput['data'];
export type ISetConfigOutput =
  Mutations.Capital.SetConfig.IOutput[typeof Mutations.Capital.SetConfig.name];
