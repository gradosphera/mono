/**
 * TS-зеркало канона кооперативного стандарта.
 *
 * Спецификация: coopenomics-docs/docs/standards/_spec/canon.md
 *
 * Три опциональных поля добавлены под требования графа (не ломают существующие
 * YAML-манифесты):
 *   - states[].kind
 *   - transitions[].guards
 *   - transitions[].operations
 */

// ── Типы-строки для wallet_op / relation / status / role ────────────────────
export type WalletOp = 'ISSUE' | 'TRANSFER' | 'BLOCK' | 'UNBLOCK' | 'WALLET_ONLY';

export type StandardLifecycle = 'proposed' | 'approved' | 'active' | 'deprecated';

export type StateKind = 'initial' | 'normal' | 'final' | 'virtual';

export type ActionRoleInProcess = 'opener' | 'progress' | 'closer' | 'reject';

export type RelationKind = 'provides' | 'repaid_by' | 'affects' | 'consumes' | 'triggers';

export type Role =
  | 'contributor'
  | 'chairman'
  | 'soviet'
  | 'soviet_members'
  | 'meet'
  | 'gateway_operator'
  | 'administrator'
  | 'chairman_or_soviet'
  // open для расширения без правки типа
  | (string & {});

// ── Элементарные структуры ──────────────────────────────────────────────────
export interface WalletRef {
  id: number;
  name: string;
  human: string;
}

export interface AccountRef {
  account: number;       // номер счёта по плану счетов (51, 58, 80, …)
  name: string;          // константа ledger2_accounts (BANK_ACCOUNT …)
  human: string;
  type?: 'ACTIVE' | 'PASSIVE';
}

// ── Секции стандарта ────────────────────────────────────────────────────────

// §1 Паспорт — свойства на верхнем уровне
// §2 Действия контракта
export interface ContractAction {
  name: string;                     // идентификатор: capital::createdebt
  human?: string;                   // короткое человеко-читаемое имя (2–3 слова)
  actor: Role;
  role: ActionRoleInProcess;
  purpose: string;                  // подробное описание, для панели деталей
}

// §3 Граф состояний
export interface EntityState {
  name: string;                     // машинное имя, как в namespace Status (`created`, `active`…)
  description: string;              // полный смысл — показывается в панели под графом
  human?: string;                   // короткое человеко-читаемое имя (2–3 слова) для квадратика в графе
  kind?: StateKind;                 // добавлено под v1
  virtual?: boolean;                // совместимость со старыми YAML
}

export interface Transition {
  from: string;                     // '∅' для стартового перехода
  to: string;
  action: string;                   // capital::approvedebt
  actor: Role;
  ledger_code?: string;             // если переход порождает операцию ledger2
  guards?: string[];                // условия выхода (v1)
  operations?: string[];            // явный список ledger_code (v1, опционально)
}

// §4 Сценарий
export interface ScenarioParticipant {
  alias: string;
  name?: string;
  role?: Role;
}

export interface ScenarioStep {
  step: number;
  title: string;
  actor: Role;
  action: string;
  description: string;
  pre?: string[];
  post?: string[];
}

export interface ScenarioAlternative {
  branch: string;
  at_step: number;
  action: string;
  actor: Role;
  description: string;
}

export interface Scenario {
  participants?: ScenarioParticipant[];
  steps: ScenarioStep[];
  alternatives?: ScenarioAlternative[];
}

// §5 Документы
export interface ProcessDocument {
  step: number;
  title: string;
  template: string;                 // registry_id из draft
  signed_by: Role[];
  stored_in: string;                // поле таблицы сущности (debts.statement)
  note?: string;
}

// §6 Операции ledger2
export interface Ledger2Operation {
  ledger_code: string;              // cap.lnissue
  human_name: string;
  wallet_op: WalletOp;
  wallet_from: WalletRef | null;
  wallet_to: WalletRef | null;
  debit: AccountRef | null;
  credit: AccountRef | null;
  amount_ref: string;               // debt.amount
  triggered_by: string;             // capital::debtpaycnfrm
  description?: string;
}

// §7 Связи
export interface RelatedStandard {
  process_type: string | null;
  id?: string;                      // public_capital_..._process (если есть)
  relation: RelationKind;
  note: string;
}

// ── Корневой тип манифеста ──────────────────────────────────────────────────
export interface Standard {
  // §1 Паспорт
  process_type: string;             // cap.loan
  id?: string;                      // public_capital_debt_process
  title: string;
  slug: string;
  status: StandardLifecycle;
  contract: string;                 // capital, registrator, ...
  area?: string;                    // debt_managment
  summary: string;
  purpose?: string;
  roles: Role[];

  // §2
  actions: ContractAction[];

  // §3
  entity?: string;
  entity_source?: string;
  states: EntityState[];
  transitions: Transition[];

  // §4
  scenario: Scenario;

  // §5
  documents: ProcessDocument[];

  // §6
  operations: Ledger2Operation[];

  // §7
  related?: RelatedStandard[];
}

// ── Мета: индекс всех стандартов для sidebar + роутинга ─────────────────────
export interface StandardIndexEntry {
  process_type: string;
  title: string;
  contract: string;
  slug: string;
  path: string;                     // путь к исходному YAML относительно repo
  status: StandardLifecycle;
}

export interface StandardIndex {
  byProcessType: Record<string, Standard>;
  byContract: Record<string, StandardIndexEntry[]>;
  contracts: string[];              // отсортированный список контрактов
}
