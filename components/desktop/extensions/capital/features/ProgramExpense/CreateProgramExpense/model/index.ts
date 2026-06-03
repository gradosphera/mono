import { useSystemStore } from 'src/entities/System/model';
import { useSessionStore } from 'src/entities/Session';
import { DigitalDocument } from 'src/shared/lib/document';
import type { Cooperative } from 'cooptypes';
import { Zeus } from '@coopenomics/sdk';
import { generateUniqueHash } from 'src/shared/lib/utils/generateUniqueHash';
import { generateExpenseProposalStatementDocument } from 'app/extensions/expenses/api';
import { createProgramExpense } from '../api';
import { useProgramExpenseStore } from 'app/extensions/capital/entities/ProgramExpense/model';

export interface ICreateProgramExpenseDraftItem {
  number: string;
  description: string;
  amount: string;
  recipient_type: Zeus.ExpenseRecipientType;
  mechanics: Zeus.ExpenseMechanics;
  recipient_name?: string;
  requisites?: string;
  recipient_account?: string;
  item_hash?: string;
}

export interface ICreateProgramExpenseDraft {
  operation_code: string;
  description: string;
  items: ICreateProgramExpenseDraftItem[];
}

export function useCreateProgramExpense() {
  const { info } = useSystemStore();
  const session = useSessionStore();
  const store = useProgramExpenseStore();

  async function submitProgramExpense(draft: ICreateProgramExpenseDraft) {
    const expense_hash = await generateUniqueHash();

    const totalAmount = draft.items.reduce((sum, it) => sum + parseFloat(it.amount || '0'), 0);
    const total_amount = `${totalAmount.toFixed(4)} RUB`;

    const itemsForDoc = draft.items.map((it, idx) => ({
      number: String(idx + 1),
      description: it.description,
      amount: it.amount,
      recipient_type: it.recipient_type,
      mechanics: it.mechanics,
      recipient_name: it.recipient_name ?? '',
      requisites: it.requisites ?? '',
    }));

    const generated = await generateExpenseProposalStatementDocument({
      coopname: info.coopname,
      username: session.username,
      proposal: {
        description: draft.description,
        total_amount,
        items_count: draft.items.length,
        source_wallet: 'w.cap.blago',
      },
      items: itemsForDoc,
    } as any);

    const docKey = 'generateExpenseProposalStatementDocument' as const;
    const generatedDoc = (generated as any)[docKey];

    const digital = new DigitalDocument(generatedDoc);
    const signed = await digital.sign<Cooperative.Registry.ExpenseProposalStatement.Meta>(
      session.username,
      1,
    );

    const itemsForChain = draft.items.map((it, idx) => ({
      item_hash: it.item_hash ?? generateItemHash(expense_hash, idx),
      mechanics: it.mechanics,
      recipient_type: it.recipient_type,
      recipient: it.recipient_account ?? it.recipient_name ?? session.username,
      description: it.description,
      planned_amount: it.amount,
    }));

    const result = await createProgramExpense({
      coopname: info.coopname,
      expense_hash,
      creator: session.username,
      operation_code: draft.operation_code,
      items: itemsForChain,
      description: draft.description,
      statement: signed as any,
    } as any);

    await store.loadProgramExpenses({ coopname: info.coopname });
    return result;
  }

  return { submitProgramExpense };
}

function generateItemHash(expense_hash: string, idx: number): string {
  return `${expense_hash.slice(0, 56)}${idx.toString(16).padStart(8, '0')}`;
}
