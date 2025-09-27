import type { ConfirmApproveInputDTO } from '../../application/dto/confirm-approve-input.dto';
import type { DeclineApproveInputDTO } from '../../application/dto/decline-approve-input.dto';

export const CHAIRMAN_BLOCKCHAIN_PORT = Symbol('CHAIRMAN_BLOCKCHAIN_PORT');

/**
 * Порт для взаимодействия с блокчейном в расширении Chairman
 */
export interface ChairmanBlockchainPort {
  /**
   * Подтвердить одобрение документа
   */
  confirmApprove(data: ConfirmApproveInputDTO): Promise<any>;

  /**
   * Отклонить одобрение документа
   */
  declineApprove(data: DeclineApproveInputDTO): Promise<any>;
}
