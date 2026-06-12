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
  mechanics: Zeus.ExpenseMechanics;
  recipient_type: Zeus.ExpenseRecipientType;
  recipient_name?: string;
  requisites?: string;
  /** Назначение платежа (оплата по счёту организации/ИП). */
  payment_purpose?: string;
  recipient_account?: string;
  item_hash?: string;
  /** Идентификатор платёжного метода получателя-пайщика (SELF/MEMBER). */
  payment_method_id?: string | null;
}

export interface ICreateProgramExpenseDraft {
  description: string;
  /** Срок исполнения («в срок до»), значение date-input `YYYY-MM-DD`. */
  deadline: string;
  items: ICreateProgramExpenseDraftItem[];
}

/**
 * Кошелёк-источник программных расходов capital — кооперативный пул расходов
 * (его же на чейн ставит capital::createpgexp; здесь — для текста СЗ-документа).
 * Способ оплаты задаётся на каждой позиции (item.mechanics: аванс под отчёт /
 * прямая оплата) — ledger2-код операции контракт выводит из пары
 * (source_wallet, механика позиции) в момент оплаты.
 */
const PROGRAM_EXPENSE_SOURCE_WALLET = 'w.cap.pgexp';

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

    // Полные реквизиты в документ подставляет сервер по payment_method_id;
    // фронт знает только сокращённое представление.
    const itemsForDoc = draft.items.map((it, idx) => ({
      number: String(idx + 1),
      description: it.description,
      amount: formatToAsset(it.amount, symbol, precision),
      recipient_type: it.recipient_type,
      mechanics: it.mechanics,
      recipient_name: it.recipient_name ?? '',
      requisites: it.requisites ?? '',
      payment_purpose: it.payment_purpose || undefined,
      payment_method_id: it.payment_method_id ?? undefined,
      recipient_username:
        it.recipient_type === Zeus.ExpenseRecipientType.MEMBER
          ? it.recipient_account?.trim()
          : undefined,
    }));

    const generateInput: GenerateStatementInput = {
      coopname: info.coopname,
      username: session.username,
      proposal_hash: expense_hash,
      proposal: {
        description: draft.description,
        total_amount,
        items_count: draft.items.length,
        source_wallet: PROGRAM_EXPENSE_SOURCE_WALLET,
        deadline: formatDeadline(draft.deadline),
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
      mechanics: it.mechanics,
      recipient_type: it.recipient_type,
      recipient: resolveRecipient(it, session.username),
      description: it.description,
      planned_amount: formatToAsset(it.amount, symbol, precision),
      payment_method_id: it.payment_method_id ?? undefined,
      requisites: it.requisites || undefined,
      payment_purpose: it.payment_purpose || undefined,
    }));

    const result = await createProgramExpense({
      coopname: info.coopname,
      expense_hash,
      creator: session.username,
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

/** `YYYY-MM-DD` (date-input) → `DD.MM.YYYY` (документ). */
function formatDeadline(value: string): string {
  const [year, month, day] = value.split('-');
  return `${day}.${month}.${year}`;
}
