import type { TransactionResult } from '~/domain/blockchain/types/transaction-result.type';
import type { GatewayContract } from 'cooptypes';
import type { CompleteIncomeDomainInterface } from '../interfaces/complete-income-domain.interface';
import type { CompleteOutcomeDomainInterface } from '../interfaces/complete-outcome-domain.interface';
import type { DeclineOutcomeDomainInterface } from '../interfaces/decline-outcome-domain.interface';
import { PaymentStatusEnum } from '../enums/payment-status.enum';

/**
 * Единый порт для всех gateway операций
 * Включает как блокчейн операции, так и доменные операции
 */
export interface GatewayPort {
  // Блокчейн операции

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

  // Доменные операции

  /**
   * Выполнить процессинг платежа
   */
  executeIncomePayment(id: string, status: PaymentStatusEnum): Promise<void>;

  /**
   * Обновить все истекшие платежи в статус EXPIRED
   * @returns количество обновленных платежей
   */
  expireOutdatedPayments(): Promise<number>;
}

export const GATEWAY_PORT = Symbol('GatewayPort');
