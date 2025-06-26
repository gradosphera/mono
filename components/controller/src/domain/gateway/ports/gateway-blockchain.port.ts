import type { TransactionResult } from '~/domain/blockchain/types/transaction-result.type';
import type { GatewayContract } from 'cooptypes';
import type { CompleteIncomeDomainInterface } from '../interfaces/complete-income-domain.interface';
import type { CompleteOutcomeDomainInterface } from '../interfaces/complete-outcome-domain.interface';
import type { DeclineOutcomeDomainInterface } from '../interfaces/decline-outcome-domain.interface';

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

  // Завершение входящего платежа (депозита)
  completeIncome(data: CompleteIncomeDomainInterface): Promise<TransactionResult>;
}

export const GATEWAY_BLOCKCHAIN_PORT = Symbol('GATEWAY_BLOCKCHAIN_PORT');
