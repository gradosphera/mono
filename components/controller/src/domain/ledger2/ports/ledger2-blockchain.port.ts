import type { TransactionResult } from '~/domain/blockchain/types/transaction-result.type';

/**
 * Параметры перевода между кошельками одного бух.счёта (operation `o.adj.walmove`).
 */
export interface WalmoveBlockchainDomainInterface {
  coopname: string;
  /** Инициатор корректировки (для аудита; обычно совпадает с coopname). */
  initiator: string;
  /** Владелец кошельков (для аналитики; для коллективных — обычно coopname). */
  username: string;
  fromWallet: number;
  toWallet: number;
  /** Сумма с символом, например `"100.00 RUB"`. */
  quantity: string;
  /** SHA-256 хэш корректировки (генерирует backend). */
  processHash: string;
  /** Обязательное обоснование (≤ 255 символов). */
  memo: string;
}

/**
 * Параметры отката операции (operation `o.adj.rev`).
 *
 * Backend готовит зеркальные параметры (поднимает оригинал из БД,
 * меняет местами Dr/Cr и wallet_from/wallet_to, подбирает корректный
 * mirror_wallet_op для зеркала ISSUE → REVOKE и т.п.).
 */
export interface RevertBlockchainDomainInterface {
  coopname: string;
  initiator: string;
  /** id оригинальной операции в blockchain_actions. */
  originalOperationId: number;
  /** operation_code оригинала (валидация запрета `o.mig.*` дублируется в контракте). */
  originalOperationCode: string;
  username: string;
  quantity: string;
  /** 0=ISSUE, 1=TRANSFER, 4=WALLET_ONLY, 5=REVOKE. 2/3 (BLOCK/UNBLOCK) запрещены. */
  mirrorWalletOp: number;
  mirrorWalletFrom: number;
  mirrorWalletTo: number;
  mirrorDebitAccountId: number;
  mirrorCreditAccountId: number;
  processHash: string;
  memo: string;
}

/**
 * Порт ledger2 для записи в блокчейн (ручные корректировки председателя).
 *
 * Чтение состояния (accounts/wallets/history) живёт в `Ledger2StatePort` —
 * этот порт только пишет. Подпись `coopname@active`.
 */
export interface Ledger2BlockchainPort {
  walmove(data: WalmoveBlockchainDomainInterface): Promise<TransactionResult>;
  revert(data: RevertBlockchainDomainInterface): Promise<TransactionResult>;
}

export const LEDGER2_BLOCKCHAIN_PORT = Symbol('LEDGER2_BLOCKCHAIN_PORT');
