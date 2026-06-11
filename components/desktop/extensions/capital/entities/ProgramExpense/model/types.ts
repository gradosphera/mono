import type { Queries, Mutations } from '@coopenomics/sdk';

export type IProgramExpense =
  Queries.Capital.GetProgramExpense.IOutput[typeof Queries.Capital.GetProgramExpense.name];
export type IProgramExpensesPagination =
  Queries.Capital.GetProgramExpenses.IOutput[typeof Queries.Capital.GetProgramExpenses.name];

export type IGetProgramExpenseInput = Queries.Capital.GetProgramExpense.IInput;
export type IGetProgramExpensesInput = Queries.Capital.GetProgramExpenses.IInput;

export type ICreateProgramExpenseInput =
  Mutations.Capital.CreateProgramExpense.IInput['data'];
export type ICreateProgramExpenseOutput =
  Mutations.Capital.CreateProgramExpense.IOutput[typeof Mutations.Capital.CreateProgramExpense.name];

export type ITopupProgramExpenseInput =
  Mutations.Capital.TopupProgramExpense.IInput['data'];
export type ITopupProgramExpenseOutput =
  Mutations.Capital.TopupProgramExpense.IOutput[typeof Mutations.Capital.TopupProgramExpense.name];
