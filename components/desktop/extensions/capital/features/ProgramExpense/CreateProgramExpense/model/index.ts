import { useSystemStore } from 'src/entities/System/model';
import { useSessionStore } from 'src/entities/Session';
import { DigitalDocument } from 'src/shared/lib/document';
import type { Cooperative } from 'cooptypes';
import { Mutations, Zeus } from '@coopenomics/sdk';
import { generateUniqueHash } from 'src/shared/lib/utils/generateUniqueHash';
import { formatToAsset } from 'src/shared/lib/utils/formatToAsset';
import { generateExpenseProposalStatementDocument } from 'app/extensions/expenses/api';
import { createProgramExpense } from '../api';
import { useProgramExpenseStore } from 'app/extensions/capital/entities/ProgramExpense/model';

type GenerateStatementInput = Mutations.Expense.GenerateExpenseProposalStatementDocument.IInput['data'];

export interface ICreateProgramExpenseDraftItem {
  number: string;
  description: string;
  amount: string;
  recipient_type: Zeus.ExpenseRecipientType;
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

/**
 * Карта `operation_code → source_wallet_code` для UI-рендера документа.
 *
 * Временно на фронте — должен выводить backend по operation_code (issue R3:
 * `refactor(expense): backend derives source_wallet from operation_code`).
 * Пока вся capital-логика на `w.cap.blago` — расширяется добавлением кодов.
 */
const SOURCE_WALLET_BY_OPERATION: Record<string, string> = {
  'o.exp.blgadv': 'w.cap.blago',
  'o.exp.blgdir': 'w.cap.blago',
};

function resolveSourceWallet(operationCode: string): string {
  const code = SOURCE_WALLET_BY_OPERATION[operationCode];
  if (!code) throw new Error(`Не задан source_wallet для operation_code "${operationCode}"`);
  return code;
}

/**
 * Механика одна на всё СЗ и однозначно следует из operation_code —
 * контракт expense отклоняет items со способом, не совпадающим с кодом.
 */
function resolveMechanics(operationCode: string): Zeus.ExpenseMechanics {
  return operationCode === 'o.exp.blgdir'
    ? Zeus.ExpenseMechanics.DIRECT
    : Zeus.ExpenseMechanics.ADVANCE;
}

/**
 * On-chain получатель (eosio::name): SELF — сам создатель, MEMBER — аккаунт
 * пайщика, ORG — пустое имя (организация не имеет аккаунта в кооперативе,
 * её название и реквизиты фиксируются в документе-заявлении).
 */
function resolveRecipient(item: ICreateProgramExpenseDraftItem, creator: string): string {
  if (item.recipient_type === Zeus.ExpenseRecipientType.MEMBER) {
    const account = item.recipient_account?.trim();
    if (!account) throw new Error('Для получателя-пайщика укажите его аккаунт');
    return account;
  }
  if (item.recipient_type === Zeus.ExpenseRecipientType.ORG) return '';
  return creator;
}

export function useCreateProgramExpense() {
  const { info } = useSystemStore();
  const session = useSessionStore();
  const store = useProgramExpenseStore();

  async function submitProgramExpense(draft: ICreateProgramExpenseDraft) {
    const expense_hash = await generateUniqueHash();

    const symbol = info.symbols.root_govern_symbol;
    const precision = info.symbols.root_govern_precision;
    const totalAmount = draft.items.reduce((sum, it) => sum + parseFloat(it.amount || '0'), 0);
    const total_amount = formatToAsset(totalAmount, symbol, precision);
    const mechanics = resolveMechanics(draft.operation_code);

    const itemsForDoc = draft.items.map((it, idx) => ({
      number: String(idx + 1),
      description: it.description,
      amount: it.amount,
      recipient_type: it.recipient_type,
      mechanics,
      recipient_name: it.recipient_name ?? '',
      requisites: it.requisites ?? '',
    }));

    const generateInput: GenerateStatementInput = {
      coopname: info.coopname,
      username: session.username,
      proposal: {
        description: draft.description,
        total_amount,
        items_count: draft.items.length,
        source_wallet: resolveSourceWallet(draft.operation_code),
      },
      items: itemsForDoc,
    };

    const { [Mutations.Expense.GenerateExpenseProposalStatementDocument.name]: generatedDoc } =
      await generateExpenseProposalStatementDocument(generateInput);

    const digital = new DigitalDocument(generatedDoc);
    const signed = await digital.sign<Cooperative.Registry.ExpenseProposalStatement.Meta>(
      session.username,
      1,
    );

    const itemsForChain = draft.items.map((it, idx) => ({
      item_hash: it.item_hash ?? generateItemHash(expense_hash, idx),
      mechanics,
      recipient_type: it.recipient_type,
      recipient: resolveRecipient(it, session.username),
      description: it.description,
      planned_amount: formatToAsset(it.amount, symbol, precision),
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
