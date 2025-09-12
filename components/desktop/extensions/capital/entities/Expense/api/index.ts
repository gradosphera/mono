import { client } from 'src/shared/api/client';
import { Queries } from '@coopenomics/sdk';
import type {
  IExpense,
  IExpensesPagination,
  IGetExpenseInput,
  IGetExpensesInput,
} from '../model';

async function loadExpenses(
  data: IGetExpensesInput,
): Promise<IExpensesPagination> {
  const { [Queries.Capital.GetExpenses.name]: output } = await client.Query(
    Queries.Capital.GetExpenses.query,
    {
      variables: data,
    },
  );
  return output;
}

async function loadExpense(data: IGetExpenseInput): Promise<IExpense> {
  const { [Queries.Capital.GetExpense.name]: output } = await client.Query(
    Queries.Capital.GetExpense.query,
    {
      variables: {
        data,
      },
    },
  );
  return output;
}

export const api = {
  loadExpenses,
  loadExpense,
};
