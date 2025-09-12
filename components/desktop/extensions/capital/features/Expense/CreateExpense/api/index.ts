import type {
  ICreateExpenseOutput,
  ICreateExpenseInput,
} from 'app/extensions/capital/entities/Expense/model';
import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

async function createExpense(
  data: ICreateExpenseInput,
): Promise<ICreateExpenseOutput> {
  const { [Mutations.Capital.CreateExpense.name]: result } =
    await client.Mutation(Mutations.Capital.CreateExpense.mutation, {
      variables: {
        data,
      },
    });

  return result;
}

export const api = {
  createExpense,
};
