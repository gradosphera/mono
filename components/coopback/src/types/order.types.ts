import type { ObjectId } from 'mongoose';
import type { IUser } from '../types/user.types';

export enum orderStatus {
  'pending' = 'pending',
  'paid' = 'paid',
  'completed' = 'completed',
  'failed' = 'failed',
  'expired' = 'expired',
  'refunded' = 'refunded',
}

export interface IOrder {
  id?: string;
  order_num?: number;
  secret: string;
  creator: string;
  status: orderStatus;
  type: 'registration' | 'deposit';
  provider: string;
  message?: string;
  username: string;
  quantity: string;
  symbol: string;
  details?: PaymentDetails;
  expired_at?: Date;
  user: ObjectId;
}

export interface IOrderResponse extends Omit<IOrder, 'user'> {
  user: IUser;
}

// Определение типа для деталей платежа
export interface PaymentDetails {
  data: any; // строка с данными платежа
  amount_plus_fee: string;
  amount_without_fee: string;
  fee_amount: string;
  fee_percent: number;
  fact_fee_percent: number;
  tolerance_percent: number;
}

export interface ICreatedPayment {
  provider: string;
  details: PaymentDetails;
}
