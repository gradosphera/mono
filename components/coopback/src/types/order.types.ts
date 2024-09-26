import type { ObjectId } from 'mongoose';
import type { IUser } from '../models/user.model';
import type { IOrder } from '../models/order.model';

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
