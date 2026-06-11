import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

export type IDeclineExpenseReportInput = Mutations.Expense.DeclineExpenseReport.IInput['data'];

export async function declineExpenseReport(data: IDeclineExpenseReportInput) {
  return client.Mutation(Mutations.Expense.DeclineExpenseReport.mutation, {
    variables: { data },
  });
}
