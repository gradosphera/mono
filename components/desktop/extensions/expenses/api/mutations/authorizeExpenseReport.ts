import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

export type IAuthorizeExpenseReportInput = Mutations.Expense.AuthorizeExpenseReport.IInput['data'];

export async function authorizeExpenseReport(data: IAuthorizeExpenseReportInput) {
  return client.Mutation(Mutations.Expense.AuthorizeExpenseReport.mutation, {
    variables: { data },
  });
}
