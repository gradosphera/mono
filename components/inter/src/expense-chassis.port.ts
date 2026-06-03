/**
 * Шасси расходов (контракт `expense`): read-side для приложений-потребителей
 * (capital, marketplace, EMP). Реализация — расширение `expense-chassis`;
 * токен `INTER_EXPENSE_CHASSIS` регистрируется в InterCommunicationBridgeModule.
 *
 * Mutations approve/authorize/pay/report/close/decline — это прямые GraphQL
 * endpoints шасси; consumer-extension'ы их НЕ оборачивают, чтобы не дублировать
 * lifecycle. Порт нужен только для чтения proposals из инфраструктуры шасси
 * без межсервисных вызовов.
 */

/** Lifecycle-статус proposal'а шасси (зеркало `ExpenseProposalStatus` в `extensions/expenses`). */
export type InterExpenseProposalStatus =
  | 'CREATED'
  | 'AUTHORIZED'
  | 'PARTIALLY_PAID'
  | 'REPORT_SUBMITTED'
  | 'CLOSED'
  | 'DECLINED'
  | 'UNDEFINED';

/** Item — одна строка СЗ-расхода (зеркало `IExpenseItemBlockchainData`). */
export interface InterExpenseItem {
  itemHash: string;
  /** ExpenseMechanics: 0=ADVANCE / 1=DIRECT / 2=POST_FACT (узнать у consumer'а). */
  mechanics: number;
  /** ExpenseRecipientType: 0=USER / 1=ORG / 2=EXTERNAL. */
  recipientType: number;
  /** Получатель: username (USER) / inn (ORG) / свободная строка (EXTERNAL). */
  recipient: string;
  description: string;
  /** Сумма-резерв позиции (raw asset, например "1500.0000 RUB"). */
  plannedAmount: string;
  /** Сумма-факт после `reportexp` (0 пока не отчитались). */
  actualAmount: string;
  /** ExpenseItemStatus blockchain enum. */
  status: number;
}

export interface InterExpenseCallbackHandler {
  /** Owner-контракт consumer'а (для capital'а — `capital`). Пусто = standalone. */
  contract: string;
  action: string;
  data: string;
}

export interface InterExpenseProposalRead {
  coopname: string;
  /** Хэш СЗ-расхода (он же `expense_hash` в capital::progexpenses). */
  proposalHash: string;
  /** Кошелёк-источник (например `BLAGOROST_FUND`). */
  sourceWalletCode: string;
  /** Инициатор (creator) — username председателя, оформившего расход. */
  creator: string;
  /** Код операции ledger2 (например `BLAGO_ADVANCE` / `BLAGO_DIRECT`). */
  operationCode: string;
  status: InterExpenseProposalStatus;
  /** Callback consumer-контракта: пустой `contract` ⇒ standalone-расход без owner'а. */
  callback?: InterExpenseCallbackHandler;
  items: InterExpenseItem[];
  /** Сумма-резерв по items (raw asset). */
  totalPlanned: string;
  /** Фактически потрачено после `reportexp` (raw asset; "0.0000 RUB" пока не отчитались). */
  totalActual: string;
  /** ISO timestamp создания. */
  createdAt: string;
  /** ISO timestamp последнего перехода lifecycle. */
  updatedAt: string;
}

/** Пагинация — нейтральная (не зависит от Nest/TypeORM DTO). */
export interface InterExpensePagination {
  limit?: number;
  offset?: number;
  /** Поле сортировки. По умолчанию `updatedAt`. */
  sortBy?: 'createdAt' | 'updatedAt';
  /** Направление. По умолчанию `DESC`. */
  sortOrder?: 'ASC' | 'DESC';
}

export interface InterExpensePaginatedResult<T> {
  items: T[];
  totalCount: number;
}

export interface InterExpenseChassisPort {
  /**
   * Чтение proposal'а по хэшу. Возвращает null, если шасси не видит
   * (либо хэш чужого кооператива, либо ещё не долетел из parser-stream'а).
   */
  readProposalByHash(coopname: string, proposalHash: string): Promise<InterExpenseProposalRead | null>;

  /**
   * Batch-чтение для list-view (страница «Управление расходами программы» в Капитале).
   * Order не гарантируется — вызывающий сам индексирует по proposalHash.
   */
  readProposalsByHashes(coopname: string, proposalHashes: string[]): Promise<InterExpenseProposalRead[]>;

  /**
   * Список proposals по owner'у (значение `callback.contract`) + опц. action.
   * Используется list-view'ями consumer-extension'ов: «дай мне все программные
   * расходы Капитала» = listProposalsByOwner(coopname, 'capital', 'onpgexpdone').
   */
  listProposalsByOwner(
    coopname: string,
    ownerContract: string,
    ownerAction?: string,
    pagination?: InterExpensePagination,
  ): Promise<InterExpensePaginatedResult<InterExpenseProposalRead>>;
}
