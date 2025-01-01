import type { PaymentDetailsDTO } from '~/modules/payment/dto/payment-details.dto';
import { PaymentStatus } from '../interfaces/payment-status-domain.interface';
import { type IOrder } from '~/types';
import type { PaymentDTO } from '~/modules/payment/dto/payment.dto';
import type { PaymentTypeDomainInterface } from '../interfaces/payment-type-domain.interface';

export class PaymentDomainEntity {
  id?: string;
  orderNum?: number;
  secret!: string;
  creator!: string;
  status: PaymentStatus = PaymentStatus.PENDING;
  type!: PaymentTypeDomainInterface;
  provider!: string;
  message?: string;
  username!: string;
  quantity!: string;
  symbol!: string;
  details?: {
    data: any;
    amount_plus_fee: string;
    amount_without_fee: string;
    fee_amount: string;
    fee_percent: number;
    fact_fee_percent: number;
    tolerance_percent: number;
  };
  expiredAt!: Date;
  userId!: string;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: Partial<IOrder & { created_at?: Date; updated_at?: Date }>) {
    Object.assign(this, {
      id: data.id,
      orderNum: data.order_num,
      secret: data.secret,
      creator: data.creator,
      status: data.status as unknown as PaymentStatus,
      type: data.type,
      provider: data.provider,
      message: data.message,
      username: data.username,
      quantity: data.quantity,
      symbol: data.symbol,
      details: data.details,
      expiredAt:
        data.expired_at ||
        (() => {
          const now = new Date();
          now.setDate(now.getDate() + 1);
          return now;
        })(),
      user: data.user,
      createdAt: data.created_at ?? new Date(),
      updatedAt: data.updated_at ?? new Date(),
    });
  }

  toDTO(): PaymentDTO {
    if (!this.id) {
      throw new Error('ID is required for PaymentDTO');
    }
    if (this.orderNum === undefined || this.orderNum === null) {
      throw new Error('Order number is required for PaymentDTO');
    }

    const details: PaymentDetailsDTO | undefined = this.details
      ? {
          data: this.details.data,
          amount_plus_fee: this.details.amount_plus_fee,
          amount_without_fee: this.details.amount_without_fee,
          fee_amount: this.details.fee_amount,
          fee_percent: this.details.fee_percent,
          fact_fee_percent: this.details.fact_fee_percent,
          tolerance_percent: this.details.tolerance_percent,
        }
      : undefined;

    return {
      id: this.id,
      blockchain_id: this.orderNum,
      provider: this.provider,
      details: details || ({} as PaymentDetailsDTO),
      status: this.status,
      message: this.message || '',
      amount: parseFloat(this.quantity),
      symbol: this.symbol,
      username: this.username,
      expired_at: this.expiredAt,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
    };
  }
}
