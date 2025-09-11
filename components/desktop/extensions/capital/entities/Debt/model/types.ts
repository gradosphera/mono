import type { Queries, Mutations } from '@coopenomics/sdk';

export type IDebt =
  Queries.Capital.GetDebt.IOutput[typeof Queries.Capital.GetDebt.name];
export type IDebtsPagination =
  Queries.Capital.GetDebts.IOutput[typeof Queries.Capital.GetDebts.name];

export type IGetDebtInput = Queries.Capital.GetDebt.IInput['data'];
export type IGetDebtsInput = Queries.Capital.GetDebts.IInput;
export type ICreateDebtInput = Mutations.Capital.CreateDebt.IInput['data'];
export type ICreateDebtOutput =
  Mutations.Capital.CreateDebt.IOutput[typeof Mutations.Capital.CreateDebt.name];
