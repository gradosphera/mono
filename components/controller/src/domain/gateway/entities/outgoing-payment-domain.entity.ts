import type { OutgoingPaymentDomainInterface } from '../interfaces/outgoing-payment-domain.interface';
import { GatewayPaymentStatusEnum } from '../enums/gateway-payment-status.enum';
import { GatewayPaymentTypeEnum } from '../enums/gateway-payment-type.enum';

/**
 * Доменная сущность исходящего платежа
 */
export class OutgoingPaymentDomainEntity implements OutgoingPaymentDomainInterface {
  id?: string;
  coopname: string;
  username: string;
  hash: string;
  quantity: string;
  symbol: string;
  method_id: string;
  status: GatewayPaymentStatusEnum;
  type: GatewayPaymentTypeEnum.OUTGOING = GatewayPaymentTypeEnum.OUTGOING;
  created_at: Date;
  updated_at?: Date;
  memo?: string;
  payment_details?: string;
  blockchain_data?: any;

  constructor(data: OutgoingPaymentDomainInterface) {
    this.id = data.id;
    this.coopname = data.coopname;
    this.username = data.username;
    this.hash = data.hash;
    this.quantity = data.quantity;
    this.symbol = data.symbol;
    this.method_id = data.method_id;
    this.status = data.status as GatewayPaymentStatusEnum;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.memo = data.memo;
    this.payment_details = data.payment_details;
    this.blockchain_data = data.blockchain_data;
    this.type = GatewayPaymentTypeEnum.OUTGOING;
  }

  /**
   * Получить количество и символ в формате строки
   */
  getFormattedAmount(): string {
    return `${this.quantity} ${this.symbol}`;
  }

  /**
   * Проверить, может ли статус быть изменен
   */
  canChangeStatus(): boolean {
    return this.status !== GatewayPaymentStatusEnum.COMPLETED && this.status !== GatewayPaymentStatusEnum.CANCELLED;
  }

  /**
   * Получить человекочитаемый статус
   */
  getStatusLabel(): string {
    const statusLabels: Record<GatewayPaymentStatusEnum, string> = {
      [GatewayPaymentStatusEnum.PENDING]: 'Ожидает обработки',
      [GatewayPaymentStatusEnum.PROCESSING]: 'В процессе',
      [GatewayPaymentStatusEnum.COMPLETED]: 'Завершен',
      [GatewayPaymentStatusEnum.FAILED]: 'Ошибка',
      [GatewayPaymentStatusEnum.CANCELLED]: 'Отменен',
    };
    return statusLabels[this.status] || this.status;
  }

  /**
   * Преобразовать в DTO для GraphQL
   */
  toDTO(): any {
    return {
      id: this.id,
      coopname: this.coopname,
      username: this.username,
      hash: this.hash,
      quantity: this.quantity,
      symbol: this.symbol,
      method_id: this.method_id,
      status: this.status,
      type: this.type,
      created_at: this.created_at,
      updated_at: this.updated_at,
      memo: this.memo,
      payment_details: this.payment_details,
      blockchain_data: this.blockchain_data,
      formatted_amount: this.getFormattedAmount(),
      status_label: this.getStatusLabel(),
      can_change_status: this.canChangeStatus(),
    };
  }
}
