import type { ConfirmApproveDomainInput } from '../actions/confirm-approve-domain-input.interface';
import type { DeclineApproveDomainInput } from '../actions/decline-approve-domain-input.interface';

export const CHAIRMAN_BLOCKCHAIN_PORT = Symbol('CHAIRMAN_BLOCKCHAIN_PORT');

/**
 * Порт для взаимодействия с блокчейном в расширении Chairman
 */
export interface ChairmanBlockchainPort {
  /**
   * Подтвердить одобрение документа
   */
  confirmApprove(data: ConfirmApproveDomainInput): Promise<any>;

  /**
   * Отклонить одобрение документа
   */
  declineApprove(data: DeclineApproveDomainInput): Promise<any>;
}
