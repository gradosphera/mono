import type { PaymentDetails } from '../../types';

export interface PaymentProvider {
  tolerance_percent: number;
  fee_percent: number;
  createPayment(
    amount: string,
    symbol: string,
    description: string,
    order_num: number,
    secret: string
  ): Promise<PaymentDetails>;
}
