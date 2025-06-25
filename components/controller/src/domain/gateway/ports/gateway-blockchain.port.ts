import type { TransactionResult } from '~/domain/blockchain/types/transaction-result.type';
import type { GatewayContract } from 'cooptypes';

/**
 * Доменные интерфейсы для управления gateway
 */
export interface CompleteOutcomeDomainInterface {
  coopname: string;
  outcome_hash: string;
}

export interface DeclineOutcomeDomainInterface {
  coopname: string;
  outcome_hash: string;
  reason: string;
}

/**
 * Порт для взаимодействия с gateway блокчейном
 * Только управление уже созданными outcomes - создание происходит автоматически другими контрактами
 */
export interface GatewayBlockchainPort {
  // Завершение исходящего платежа
  completeOutcome(data: CompleteOutcomeDomainInterface): Promise<TransactionResult>;

  // Отклонение исходящего платежа
  declineOutcome(data: DeclineOutcomeDomainInterface): Promise<TransactionResult>;

  // Получение исходящих платежей из блокчейна
  getOutcomes(coopname: string): Promise<GatewayContract.Tables.Outcomes.IOutcome[]>;

  // Получение конкретного исходящего платежа
  getOutcome(coopname: string, outcome_hash: string): Promise<GatewayContract.Tables.Outcomes.IOutcome | null>;
}

export const GATEWAY_BLOCKCHAIN_PORT = Symbol('GATEWAY_BLOCKCHAIN_PORT');
