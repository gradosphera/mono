import { client } from 'src/shared/api/client';
import { Mutations, Queries } from '@coopenomics/sdk';

export type IExpenseProposal =
  Queries.Expense.ExpenseProposal.IOutput[typeof Queries.Expense.ExpenseProposal.name];
export type IExpenseProposalItem = NonNullable<IExpenseProposal>['items'][number];
export type IReportExpenseItemInput = Mutations.Expense.ReportExpenseItem.IInput['data'];

async function loadExpenseProposal(
  proposalHash: string,
): Promise<IExpenseProposal | null> {
  const { [Queries.Expense.ExpenseProposal.name]: result } = await client.Query(
    Queries.Expense.ExpenseProposal.query,
    { variables: { proposal_hash: proposalHash } },
  );
  return result ?? null;
}

async function reportExpenseItem(data: IReportExpenseItemInput): Promise<void> {
  await client.Mutation(Mutations.Expense.ReportExpenseItem.mutation, {
    variables: { data },
  });
}

export const api = { loadExpenseProposal, reportExpenseItem };
