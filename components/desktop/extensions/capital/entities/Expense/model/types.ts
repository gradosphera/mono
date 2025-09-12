import type { Queries, Mutations } from '@coopenomics/sdk';

export type IExpense =
  Queries.Capital.GetExpense.IOutput[typeof Queries.Capital.GetExpense.name];
export type IExpensesPagination =
  Queries.Capital.GetExpenses.IOutput[typeof Queries.Capital.GetExpenses.name];

export type IGetExpenseInput = Queries.Capital.GetExpense.IInput['data'];
export type IGetExpensesInput = Queries.Capital.GetExpenses.IInput;
export type ICreateExpenseInput =
  Mutations.Capital.CreateExpense.IInput['data'];
export type ICreateExpenseOutput =
  Mutations.Capital.CreateExpense.IOutput[typeof Mutations.Capital.CreateExpense.name];
