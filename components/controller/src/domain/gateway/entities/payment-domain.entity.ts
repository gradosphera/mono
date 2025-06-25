import type { PaymentDomainInterface } from '../interfaces/payment-domain.interface';

/**
 * Универсальная доменная сущность платежа
 * Работает как для входящих, так и для исходящих платежей
 */
export class PaymentDomainEntity implements PaymentDomainInterface {
  id?: string;
  coopname: string;
  username: string;
  hash: string;
  quantity: string;
  symbol: string;
  method_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  type: 'incoming' | 'outgoing';
  created_at: Date;
  updated_at?: Date;
  memo?: string;
  payment_details?: string;
  blockchain_data?: any;

  constructor(data: PaymentDomainInterface) {
    this.id = data.id;
    this.coopname = data.coopname;
    this.username = data.username;
    this.hash = data.hash;
    this.quantity = data.quantity;
    this.symbol = data.symbol;
    this.method_id = data.method_id;
    this.status = data.status;
    this.type = data.type;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.memo = data.memo;
    this.payment_details = data.payment_details;
    this.blockchain_data = data.blockchain_data;
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
    return this.status !== 'completed' && this.status !== 'cancelled';
  }

  /**
   * Получить человекочитаемый статус
   */
  getStatusLabel(): string {
    const statusLabels = {
      pending: 'Ожидает обработки',
      processing: 'В процессе',
      completed: 'Завершен',
      failed: 'Ошибка',
      cancelled: 'Отменен',
    };
    return statusLabels[this.status] || this.status;
  }

  /**
   * Получить человекочитаемый тип платежа
   */
  getTypeLabel(): string {
    const typeLabels = {
      incoming: 'Входящий платеж',
      outgoing: 'Исходящий платеж',
    };
    return typeLabels[this.type] || this.type;
  }

  /**
   * Получить соответствующий хеш для типа платежа
   */
  getSpecificHash(): { [key: string]: string } {
    if (this.type === 'outgoing') {
      return { outcome_hash: this.hash };
    } else {
      return { income_hash: this.hash };
    }
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
      ...this.getSpecificHash(), // Добавляем конкретный хеш
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
      type_label: this.getTypeLabel(),
      can_change_status: this.canChangeStatus(),
    };
  }
}
