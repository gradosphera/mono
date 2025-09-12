import type { Queries, Mutations } from '@coopenomics/sdk';

export type IConfig =
  Queries.Capital.GetConfig.IOutput[typeof Queries.Capital.GetConfig.name];

export type IGetConfigInput = Queries.Capital.GetConfig.IInput['data'];
export type ISetConfigInput = Mutations.Capital.SetConfig.IInput['data'];
export type ISetConfigOutput =
  Mutations.Capital.SetConfig.IOutput[typeof Mutations.Capital.SetConfig.name];
